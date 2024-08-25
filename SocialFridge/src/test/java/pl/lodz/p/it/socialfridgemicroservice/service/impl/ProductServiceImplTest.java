package pl.lodz.p.it.socialfridgemicroservice.service.impl;

import com.github.javafaker.Faker;
import jakarta.mail.MessagingException;
import jakarta.ws.rs.core.EntityTag;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import pl.lodz.p.it.socialfridgemicroservice.config.Roles;
import pl.lodz.p.it.socialfridgemicroservice.entity.Account;
import pl.lodz.p.it.socialfridgemicroservice.entity.Address;
import pl.lodz.p.it.socialfridgemicroservice.entity.Product;
import pl.lodz.p.it.socialfridgemicroservice.entity.SocialFridge;
import pl.lodz.p.it.socialfridgemicroservice.enums.*;
import pl.lodz.p.it.socialfridgemicroservice.exception.eTag.OutdatedDataException;
import pl.lodz.p.it.socialfridgemicroservice.exception.productException.DeletedProductModificationException;
import pl.lodz.p.it.socialfridgemicroservice.exception.productException.ProductNotFoundException;
import pl.lodz.p.it.socialfridgemicroservice.exception.socialFridgeException.DeletedSocialFridgeModificationException;
import pl.lodz.p.it.socialfridgemicroservice.exception.socialFridgeException.InactiveSocialFridgeException;
import pl.lodz.p.it.socialfridgemicroservice.exception.socialFridgeException.InvalidDistanceFromSocialFridgeException;
import pl.lodz.p.it.socialfridgemicroservice.exception.socialFridgeException.SocialFridgeNotFoundException;
import pl.lodz.p.it.socialfridgemicroservice.mappers.ProductMapper;
import pl.lodz.p.it.socialfridgemicroservice.model.ProductModel;
import pl.lodz.p.it.socialfridgemicroservice.repository.AccountRepository;
import pl.lodz.p.it.socialfridgemicroservice.repository.ProductRepository;
import pl.lodz.p.it.socialfridgemicroservice.repository.SocialFridgeRepository;
import pl.lodz.p.it.socialfridgemicroservice.utils.eTag.ETagCalculator;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@SpringBootTest
class ProductServiceImplTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ETagCalculator eTagCalculator;

    @Mock
    private ProductMapper productMapper;

    @Mock
    private SocialFridgeRepository socialFridgeRepository;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private EmailServiceImpl emailService;

    @InjectMocks
    private ProductServiceImpl productService;

    private final Faker faker = new Faker();

    private Account createRandomAccount() {
        List<String> roles = new ArrayList<>();
        roles.add(Roles.USER);

        return new Account(faker.name().username(), faker.name().firstName(),
                faker.name().lastName(), faker.internet().emailAddress(), faker.random().nextBoolean(), 0,
                Language.EN, new ArrayList<>(), new HashSet<>(), roles);
    }

    @Test
    void testGetProduct() throws ProductNotFoundException {
        final Product product = new Product();
        final ProductModel productModel = new ProductModel();
        productModel.setId(product.getId());

        when(productRepository.findById(product.getId())).thenReturn(Optional.of(product));

        when(productMapper.productToProductModel(product)).thenReturn(productModel);

        when(eTagCalculator.calculateETagForEntity(product)).thenReturn(EntityTag.valueOf(""));

        final ProductModel result = productService.getProduct(product.getId());

        verify(productRepository, times(1)).findById(product.getId());

        verify(productMapper, times(1)).productToProductModel(product);

        assertNotNull(result);
        assertEquals(productModel.getId(), result.getId());
    }

    @Test
    void testGetProductNotFoundException() {
        final Long productId = anyLong();

        when(productRepository.findById(productId)).thenReturn(Optional.empty());

        assertThrows(ProductNotFoundException.class, () -> productService.getProduct(productId));

        verify(productRepository, times(1)).findById(productId);
        verifyNoMoreInteractions(productMapper);
    }

    @Test
    void testGetAllProducts() {
        final String title = "product";
        final Pageable pageable = PageRequest.of(0, 10);
        final List<Product> products = Arrays.asList(new Product(), new Product());

        when(productRepository.findAllProducts(ProductState.AVAILABLE, Category.FISH, title, pageable)).thenReturn(products);

        final List<ProductModel> result = productService.getAllProducts(Category.FISH, title, pageable);

        assertEquals(products.size(), result.size());

        verify(productRepository, times(1)).findAllProducts(ProductState.AVAILABLE, Category.FISH, title, pageable);

        verify(productMapper, times(products.size())).productToProductModel(any());
    }

    @Test
    void testArchiveProduct() {
        final Account account = createRandomAccount();
        account.getRoles().add(Roles.USER);
        final String latitude = "52.5200";
        final String longitude = "13.4050";
        final Product product = new Product();
        product.setState(ProductState.AVAILABLE);
        final SocialFridge socialFridge = new SocialFridge();
        final Address address = new Address();
        address.setLatitude("52.5200");
        address.setLongitude("13.4050");
        socialFridge.setAddress(address);
        product.setSocialFridge(socialFridge);

        final Authentication authentication = Mockito.mock(Authentication.class);
        lenient().when(authentication.getName()).thenReturn(account.getUsername());
        final SecurityContext securityContext = Mockito.mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        when(productRepository.findById(product.getId())).thenReturn(Optional.of(product));
        when(eTagCalculator.verifyProvidedETag(product)).thenReturn(true);

        Assertions.assertDoesNotThrow(() -> productService.archiveProduct(product.getId(), latitude, longitude));

        verify(productRepository, times(1)).findById(product.getId());
        verify(productRepository, times(1)).save(any());
        verify(productMapper, times(1)).productToProductModel(any());
    }

    @Test
    void testArchiveProductProductNotFoundException() {
        final String latitude = "52.5200";
        final String longitude = "13.4050";
        final Product product = new Product();

        when(productRepository.findById(product.getId())).thenReturn(Optional.empty());

        assertThrows(ProductNotFoundException.class, () -> productService.archiveProduct(product.getId(), latitude, longitude));

        verify(productRepository, times(1)).findById(product.getId());
    }

    @Test
    void testArchiveProductOutdatedDataException() {
        final String latitude = "52.5200";
        final String longitude = "13.4050";
        final Product product = new Product();

        when(productRepository.findById(product.getId())).thenReturn(Optional.of(product));
        when(eTagCalculator.verifyProvidedETag(product)).thenReturn(false);

        assertThrows(OutdatedDataException.class, () -> productService.archiveProduct(product.getId(), latitude, longitude));

        verify(productRepository, times(1)).findById(product.getId());
    }

    @Test
    void testArchiveProductInvalidDistanceFromSocialFridgeException() {
        final Account account = createRandomAccount();
        account.getRoles().add(Roles.USER);
        final String latitude = "20.5200";
        final String longitude = "30.4050";
        final Product product = new Product();
        product.setState(ProductState.AVAILABLE);
        final SocialFridge socialFridge = new SocialFridge();
        final Address address = new Address();
        address.setLatitude("52.5200");
        address.setLongitude("13.4050");
        socialFridge.setAddress(address);
        product.setSocialFridge(socialFridge);

        final Authentication authentication = Mockito.mock(Authentication.class);
        lenient().when(authentication.getName()).thenReturn(account.getUsername());
        final SecurityContext securityContext = Mockito.mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        when(productRepository.findById(product.getId())).thenReturn(Optional.of(product));
        when(eTagCalculator.verifyProvidedETag(product)).thenReturn(true);

        assertThrows(InvalidDistanceFromSocialFridgeException.class, () -> productService.archiveProduct(product.getId(), latitude, longitude));

        verify(productRepository, times(1)).findById(product.getId());
    }

    @Test
    void testArchiveProductDeletedProductModificationException() {
        final Account account = createRandomAccount();
        account.getRoles().add(Roles.USER);
        final String latitude = "52.5200";
        final String longitude = "13.4050";
        final Product product = new Product();
        final SocialFridge socialFridge = new SocialFridge();
        final Address address = new Address();
        address.setLatitude("52.5200");
        address.setLongitude("13.4050");
        socialFridge.setAddress(address);
        product.setSocialFridge(socialFridge);
        product.setState(ProductState.ARCHIVED_BY_USER);

        final Authentication authentication = Mockito.mock(Authentication.class);
        lenient().when(authentication.getName()).thenReturn(account.getUsername());
        final SecurityContext securityContext = Mockito.mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        when(productRepository.findById(product.getId())).thenReturn(Optional.of(product));
        when(eTagCalculator.verifyProvidedETag(product)).thenReturn(true);

        assertThrows(DeletedProductModificationException.class, () -> productService.archiveProduct(product.getId(), latitude, longitude));

        verify(productRepository, times(1)).findById(product.getId());
    }

    @Test
    void testAddProduct() throws MessagingException {
        final SocialFridge socialFridge = new SocialFridge();
        final int pieces = faker.number().randomDigitNotZero();
        String latitude = faker.address().latitude();
        String longitude = faker.address().longitude();
        latitude = latitude.replace(",", ".");
        longitude = longitude.replace(",", ".");
        final ProductModel productModel = new ProductModel();
        productModel.setSocialFridgeId(socialFridge.getId());
        productModel.setLatitude(latitude);
        productModel.setLongitude(longitude);
        productModel.setPieces(pieces);
        productModel.setExpirationDate(LocalDateTime.now());
        productModel.setTitle(faker.food().ingredient());
        productModel.setDescription(faker.lorem().sentence());
        productModel.setProductUnit(faker.options().option(ProductUnit.KILOGRAMS, ProductUnit.LITERS));
        productModel.setSize(faker.number().randomDouble(2, (int) 0.1, (int) 10.0));
        productModel.setImage(faker.lorem().characters());
        productModel.getCategories().add(Category.DAIRY);

        final Address address = new Address();
        address.setLatitude(latitude);
        address.setLongitude(longitude);
        socialFridge.setAddress(address);
        final Account account1 = createRandomAccount();
        final Account account2 = createRandomAccount();

        final List<Account> accounts = new ArrayList<>();
        accounts.add(account2);

        final Authentication authentication = Mockito.mock(Authentication.class);
        when(authentication.getName()).thenReturn(account1.getUsername());
        final SecurityContext securityContext = Mockito.mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        when(socialFridgeRepository.findById(productModel.getSocialFridgeId())).thenReturn(Optional.of(socialFridge));
        when(accountRepository.findByFavSocialFridgesContainsAndDifferentUsername(socialFridge, account1.getUsername())).thenReturn(accounts);
        when(accountRepository.findByFavCategoriesContainingProductCategoriesAndDifferentUsername(productModel.getCategories(), account1.getUsername())).thenReturn(accounts);
        doNothing().when(emailService).sendNotificationToUsersFollowingFridge(account2.getEmail(), socialFridge.getId(), account2.getLanguage());
        doNothing().when(emailService).sendNotificationToUsersFollowingCategory(account2.getEmail(), socialFridge.getId(), account2.getLanguage());

        Assertions.assertDoesNotThrow(() -> productService.addProduct(productModel));

        verify(productRepository, times(productModel.getPieces())).save(any());
        verify(productMapper, times(pieces)).productToProductModel(any());
        verify(emailService, times(pieces * accounts.size())).sendNotificationToUsersFollowingFridge(account2.getEmail(), socialFridge.getId(), account2.getLanguage());
        verify(emailService, times(pieces * accounts.size())).sendNotificationToUsersFollowingCategory(account2.getEmail(), socialFridge.getId(), account2.getLanguage());
    }

    @Test
    void testAddProductSocialFridgeNotFound() {
        final ProductModel productModel = new ProductModel();

        when(socialFridgeRepository.findById(productModel.getSocialFridgeId())).thenReturn(Optional.empty());

        assertThrows(SocialFridgeNotFoundException.class, () -> productService.addProduct(productModel));

        verify(socialFridgeRepository, times(1)).findById(productModel.getSocialFridgeId());
    }

    @Test
    void testAddProductDeletedSocialFridge() {
        final ProductModel productModel = new ProductModel();
        final SocialFridge socialFridge = new SocialFridge();
        socialFridge.setState(SocialFridgeState.ARCHIVED);
        productModel.setSocialFridgeId(socialFridge.getId());

        when(socialFridgeRepository.findById(productModel.getSocialFridgeId())).thenReturn(Optional.of(socialFridge));

        assertThrows(DeletedSocialFridgeModificationException.class, () -> productService.addProduct(productModel));

        verify(socialFridgeRepository, times(1)).findById(productModel.getSocialFridgeId());
    }

    @Test
    void testAddProductInactiveSocialFridgeException() {
        final ProductModel productModel = new ProductModel();
        final SocialFridge socialFridge = new SocialFridge();
        socialFridge.setState(SocialFridgeState.INACTIVE);
        productModel.setSocialFridgeId(socialFridge.getId());

        when(socialFridgeRepository.findById(productModel.getSocialFridgeId())).thenReturn(Optional.of(socialFridge));

        assertThrows(InactiveSocialFridgeException.class, () -> productService.addProduct(productModel));

        verify(socialFridgeRepository, times(1)).findById(productModel.getSocialFridgeId());
    }
}
