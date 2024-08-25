package pl.lodz.p.it.socialfridgemicroservice.service.impl;

import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import pl.lodz.p.it.socialfridgemicroservice.entity.Account;
import pl.lodz.p.it.socialfridgemicroservice.entity.Product;
import pl.lodz.p.it.socialfridgemicroservice.entity.SocialFridge;
import pl.lodz.p.it.socialfridgemicroservice.enums.Category;
import pl.lodz.p.it.socialfridgemicroservice.enums.ProductState;
import pl.lodz.p.it.socialfridgemicroservice.enums.SocialFridgeState;
import pl.lodz.p.it.socialfridgemicroservice.exception.AppBaseException;
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
import pl.lodz.p.it.socialfridgemicroservice.service.ProductService;
import pl.lodz.p.it.socialfridgemicroservice.utils.eTag.ETagCalculator;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Point;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.lodz.p.it.socialfridgemicroservice.config.Roles;
import pl.lodz.p.it.socialfridgemicroservice.utils.GeometryUtils;
import pl.lodz.p.it.socialfridgemicroservice.utils.RoleChecker;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {
    private static final double DEGREES_PER_M = 111000.0;
    private static final double DISTANCE = 20.0;
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final SocialFridgeRepository socialFridgeRepository;
    private final AccountRepository accountRepository;
    private final EmailServiceImpl emailService;
    private final ETagCalculator eTagCalculator;

    @Override
    public List<ProductModel> getAllProducts(Category category, String title, Pageable pageable) {
        return productRepository.findAllProducts(ProductState.AVAILABLE, category, title, pageable)
                .stream()
                .map(productMapper::productToProductModel)
                .toList();
    }


    @Override
    public ProductModel getProduct(Long id) throws ProductNotFoundException {
        final Product product = productRepository.findById(id).orElseThrow(() -> new ProductNotFoundException(id));
        final ProductModel productModel = productMapper.productToProductModel(product);
        productModel.setETag(eTagCalculator.calculateETagForEntity(product).getValue());
        return productModel;
    }

    @Override
    @Transactional(
            propagation = Propagation.REQUIRED,
            isolation = Isolation.READ_COMMITTED,
            rollbackFor = AppBaseException.class,
            transactionManager = "fridgeTransactionManager")
    public List<ProductModel> addProduct(ProductModel addProduct) throws SocialFridgeNotFoundException, InvalidDistanceFromSocialFridgeException, InactiveSocialFridgeException, DeletedSocialFridgeModificationException, MessagingException {
        final SocialFridge socialFridge = socialFridgeRepository.findById(addProduct.getSocialFridgeId()).orElseThrow(
                () -> new SocialFridgeNotFoundException(addProduct.getSocialFridgeId())
        );

        throwIfDeletedSocialFridge(socialFridge);
        throwIfInactiveSocialFridge(socialFridge);

        final Point fridgePoint = GeometryUtils.createPoint(socialFridge.getAddress().getLatitude(), socialFridge.getAddress().getLongitude());
        final Point productPoint = GeometryUtils.createPoint(addProduct.getLatitude(), addProduct.getLongitude());

        throwIfInvalidDistance(productPoint, fridgePoint, addProduct.getSocialFridgeId());

        List<Product> products = new ArrayList<>();

        for (int i = 0; i < addProduct.getPieces(); i++) {
            final Product product = new Product();
            product.setExpirationDate(addProduct.getExpirationDate());
            product.setTitle(addProduct.getTitle());
            product.setDescription(addProduct.getDescription());
            product.setProductUnit(addProduct.getProductUnit());
            product.setSize(addProduct.getSize());
            product.setImage(addProduct.getImage());
            product.setSocialFridge(socialFridge);
            product.setCategories(addProduct.getCategories());

            productRepository.save(product);

            products.add(product);

            final String currentPrincipalName = SecurityContextHolder.getContext().getAuthentication().getName();
            final List<Account> accountsWithFridge = accountRepository.findByFavSocialFridgesContainsAndDifferentUsername(socialFridge, currentPrincipalName);
            final List<Account> accountsWithMatchingCategories = accountRepository.findByFavCategoriesContainingProductCategoriesAndDifferentUsername(product.getCategories(), currentPrincipalName);

            for (Account account : accountsWithFridge) {
                emailService.sendNotificationToUsersFollowingFridge(account.getEmail(), socialFridge.getId(), account.getLanguage());
            }

            for (Account account : accountsWithMatchingCategories) {
                emailService.sendNotificationToUsersFollowingCategory(account.getEmail(), socialFridge.getId(), account.getLanguage());
            }
        }

        return products.stream()
                .map(productMapper::productToProductModel)
                .toList();
    }

    private void throwIfDeletedSocialFridge(SocialFridge socialFridge) throws DeletedSocialFridgeModificationException {
        if (SocialFridgeState.ARCHIVED.equals(socialFridge.getState())) {
            throw new DeletedSocialFridgeModificationException(socialFridge.getId());
        }
    }

    private void throwIfInactiveSocialFridge(SocialFridge socialFridge) throws InactiveSocialFridgeException {
        if (SocialFridgeState.INACTIVE.equals(socialFridge.getState())) {
            throw new InactiveSocialFridgeException(socialFridge.getId());
        }
    }

    private void throwIfInvalidDistance(Point productPoint, Point fridgePoint, Long id) throws InvalidDistanceFromSocialFridgeException {
        if (!RoleChecker.hasRole(Roles.MANAGER) && productPoint.distance(fridgePoint) > DISTANCE / DEGREES_PER_M) {
            throw new InvalidDistanceFromSocialFridgeException(id);
        }
    }

    @Override
    @Transactional(
            propagation = Propagation.REQUIRED,
            isolation = Isolation.READ_COMMITTED,
            rollbackFor = AppBaseException.class,
            transactionManager = "fridgeTransactionManager")
    public ProductModel archiveProduct(Long id, String latitude, String longitude) throws ProductNotFoundException, DeletedProductModificationException, InvalidDistanceFromSocialFridgeException, OutdatedDataException {
        final Product product = productRepository.findById(id).orElseThrow(
                () -> new ProductNotFoundException(id)
        );

        if (!eTagCalculator.verifyProvidedETag(product)) {
            throw new OutdatedDataException();
        }

        final Point productPoint = GeometryUtils.createPoint(latitude, longitude);
        final Point fridgePoint = GeometryUtils.createPoint(product.getSocialFridge().getAddress().getLatitude(), product.getSocialFridge().getAddress().getLongitude());

        throwIfInvalidDistance(productPoint, fridgePoint, product.getSocialFridge().getId());

        throwIfTryingToModifyDeletedProduct(product.getState(), id);

        product.setState(ProductState.ARCHIVED_BY_USER);
        productRepository.save(product);
        return productMapper.productToProductModel(product);
    }

    private void throwIfTryingToModifyDeletedProduct(ProductState state, Long id) throws DeletedProductModificationException {
        if (!ProductState.AVAILABLE.equals(state)) {
            throw new DeletedProductModificationException(id);
        }
    }
}
