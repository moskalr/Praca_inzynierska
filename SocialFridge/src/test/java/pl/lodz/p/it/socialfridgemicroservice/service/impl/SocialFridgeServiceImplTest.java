package pl.lodz.p.it.socialfridgemicroservice.service.impl;

import com.github.javafaker.Faker;
import jakarta.ws.rs.core.EntityTag;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import pl.lodz.p.it.socialfridgemicroservice.config.Roles;
import pl.lodz.p.it.socialfridgemicroservice.entity.*;
import pl.lodz.p.it.socialfridgemicroservice.enums.Language;
import pl.lodz.p.it.socialfridgemicroservice.enums.ProductState;
import pl.lodz.p.it.socialfridgemicroservice.enums.SocialFridgeState;
import pl.lodz.p.it.socialfridgemicroservice.exception.accountException.AccountNotFoundException;
import pl.lodz.p.it.socialfridgemicroservice.exception.accountException.NotManagerException;
import pl.lodz.p.it.socialfridgemicroservice.exception.addressException.AddressExistException;
import pl.lodz.p.it.socialfridgemicroservice.exception.gradeException.RatingOutOfRangeException;
import pl.lodz.p.it.socialfridgemicroservice.exception.gradeException.SameRatingUpdateException;
import pl.lodz.p.it.socialfridgemicroservice.exception.socialFridgeException.DeletedSocialFridgeModificationException;
import pl.lodz.p.it.socialfridgemicroservice.exception.socialFridgeException.InactiveSocialFridgeException;
import pl.lodz.p.it.socialfridgemicroservice.exception.socialFridgeException.InvalidDistanceFromSocialFridgeException;
import pl.lodz.p.it.socialfridgemicroservice.exception.socialFridgeException.SocialFridgeNotFoundException;
import pl.lodz.p.it.socialfridgemicroservice.mappers.AddressMapper;
import pl.lodz.p.it.socialfridgemicroservice.mappers.ProductMapper;
import pl.lodz.p.it.socialfridgemicroservice.mappers.SocialFridgeAverageRatingMapper;
import pl.lodz.p.it.socialfridgemicroservice.mappers.SocialFridgeMapper;
import pl.lodz.p.it.socialfridgemicroservice.model.*;
import pl.lodz.p.it.socialfridgemicroservice.repository.*;
import pl.lodz.p.it.socialfridgemicroservice.utils.eTag.ETagCalculator;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static pl.lodz.p.it.socialfridgemicroservice.enums.Category.DAIRY;
import static pl.lodz.p.it.socialfridgemicroservice.enums.Category.VEGETABLES;

@SpringBootTest
class SocialFridgeServiceImplTest {
    @Mock
    private AccountRepository accountRepository;

    @Mock
    private SocialFridgeRepository socialFridgeRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private AddressRepository addressRepository;

    @Mock
    private GradeRepository gradeRepository;

    @Mock
    private SocialFridgeMapper socialFridgeMapper;

    @Mock
    private ProductMapper productMapper;

    @Mock
    private AddressMapper addressMapper;

    @Mock
    private SocialFridgeAverageRatingMapper socialFridgeAverageRatingMapper;

    @Mock
    private EmailServiceImpl emailService;

    @Mock
    private ETagCalculator eTagCalculator;
    @Mock
    private SocialFridgeAverageRatingRepository socialFridgeAverageRatingRepository;

    @InjectMocks
    private SocialFridgeServiceImpl socialFridgeService;

    private final Faker faker = new Faker();

    private Account createRandomAccount() {
        List<String> roles = new ArrayList<>();
        roles.add(Roles.USER);

        return new Account(faker.name().username(), faker.name().firstName(),
                faker.name().lastName(), faker.internet().emailAddress(), faker.random().nextBoolean(), 0,
                Language.EN, new ArrayList<>(), new HashSet<>(), roles);
    }

    private SocialFridge createSocialFridge(String latitude, String longitude) {
        SocialFridge socialFridge = new SocialFridge();
        Address address = new Address();
        address.setLatitude(latitude);
        address.setLongitude(longitude);
        socialFridge.setAddress(address);
        return socialFridge;
    }

    private List<SocialFridge> generateSocialFridgesWithinDistance(String userLatitude, String userLongitude) {
        List<SocialFridge> socialFridges = new ArrayList<>();
        int numberOfFridges = 5;

        for (int i = 0; i < numberOfFridges; i++) {
            double offset = i * 0.01;
            String latitude = String.valueOf(Double.parseDouble(userLatitude) + offset);
            String longitude = String.valueOf(Double.parseDouble(userLongitude) + offset);

            SocialFridge socialFridge = createSocialFridge(latitude, longitude);
            socialFridges.add(socialFridge);
        }

        return socialFridges;
    }

    @Test
    void testGetSocialFridge() throws SocialFridgeNotFoundException {
        final SocialFridge socialFridge = new SocialFridge();
        final SocialFridgeModel socialFridgeModel = new SocialFridgeModel();
        socialFridgeModel.setId(socialFridge.getId());

        when(socialFridgeRepository.findByIdWithAvailableProducts(socialFridge.getId())).thenReturn(socialFridge);
        when(socialFridgeMapper.socialFridgeToSocialFridgeModel(socialFridge)).thenReturn(socialFridgeModel);
        when(eTagCalculator.calculateETagForEntity(socialFridge)).thenReturn(EntityTag.valueOf(""));

        final SocialFridgeModel result = socialFridgeService.getSocialFridge(socialFridge.getId());

        verify(socialFridgeRepository, times(1)).findByIdWithAvailableProducts(socialFridge.getId());

        verify(socialFridgeMapper, times(1)).socialFridgeToSocialFridgeModel(socialFridge);

        assertNotNull(result);
        assertEquals(socialFridgeModel.getId(), result.getId());
    }

    @Test
    void testGetSocialFridgeNotFoundException() {
        final Long socialFridgeId = anyLong();

        when(socialFridgeRepository.findByIdWithAvailableProducts(socialFridgeId)).thenReturn(null);

        assertThrows(SocialFridgeNotFoundException.class, () -> socialFridgeService.getSocialFridge(socialFridgeId));

        verify(socialFridgeRepository, times(1)).findByIdWithAvailableProducts(socialFridgeId);
        verifyNoMoreInteractions(socialFridgeMapper);
    }

    @Test
    void testGetAllSocialFridges() {
        final List<SocialFridgeState> states = Arrays.asList(SocialFridgeState.ACTIVE, SocialFridgeState.INACTIVE);
        SocialFridge socialFridge1 = new SocialFridge();
        SocialFridge socialFridge2 = new SocialFridge();
        final List<SocialFridge> socialFridges = Arrays.asList(socialFridge1, socialFridge2);

        SocialFridgeModel socialFridgeModel1 = new SocialFridgeModel();
        SocialFridgeModel socialFridgeModel2 = new SocialFridgeModel();
        final List<SocialFridgeModel> socialFridgeModels = Arrays.asList(socialFridgeModel1, socialFridgeModel2);

        when(socialFridgeRepository.findByStates(states)).thenReturn(socialFridges);
        when(socialFridgeMapper.socialFridgeToSocialFridgeModel(socialFridge1)).thenReturn(socialFridgeModel1);
        when(socialFridgeMapper.socialFridgeToSocialFridgeModel(socialFridge2)).thenReturn(socialFridgeModel2);

        final List<SocialFridgeModel> result = socialFridgeService.getAllSocialFridges(states);

        verify(socialFridgeRepository, times(1)).findByStates(states);
        verify(socialFridgeMapper, times(socialFridges.size())).socialFridgeToSocialFridgeModel(any());

        assertNotNull(result);
        assertEquals(socialFridgeModels.size(), result.size());
        assertTrue(result.containsAll(socialFridgeModels));
    }

    @Test
    void testAddSocialFridgeAccountNotFoundException() {
        final Account account = createRandomAccount();
        final SocialFridgeModel socialFridgeModel = new SocialFridgeModel();
        socialFridgeModel.setUsername(account.getUsername());

        when(accountRepository.findByUsername(account.getUsername())).thenReturn(Optional.empty());

        assertThrows(AccountNotFoundException.class, () -> socialFridgeService.addSocialFridge(socialFridgeModel));

        verify(accountRepository, times(1)).findByUsername(account.getUsername());
    }

    @Test
    void testAddSocialFridgeAddressExist() {
        final Address address = new Address();
        address.setLongitude("20.00");
        address.setLatitude("50.000");
        final Account account = createRandomAccount();
        final SocialFridgeModel socialFridgeModel = new SocialFridgeModel();
        AddressModel addressModel = new AddressModel();
        addressModel.setLatitude(address.getLatitude());
        addressModel.setLongitude(address.getLongitude());
        socialFridgeModel.setUsername(account.getUsername());
        socialFridgeModel.setAddress(addressModel);

        when(accountRepository.findByUsername(account.getUsername())).thenReturn(Optional.of(account));
        when(addressRepository.findByLatitudeAndLongitude(address.getLatitude(), address.getLongitude())).thenReturn(Optional.of(address));

        assertThrows(AddressExistException.class, () -> socialFridgeService.addSocialFridge(socialFridgeModel));

        verify(accountRepository, times(1)).findByUsername(account.getUsername());
        verify(addressRepository, times(1)).findByLatitudeAndLongitude(address.getLatitude(), address.getLongitude());
    }


    @Test
    void addSocialFridge() {
        final SocialFridge socialFridge = new SocialFridge();
        final Address address = new Address();
        address.setLongitude("20.00");
        address.setLatitude("50.000");
        final SocialFridgeAverageRating socialFridgeAverageRating = new SocialFridgeAverageRating();
        final SocialFridgeAverageRatingModel socialFridgeAverageRatingModel = new SocialFridgeAverageRatingModel();

        socialFridge.setSocialFridgeAverageRating(socialFridgeAverageRating);
        final Account account = createRandomAccount();
        final SocialFridgeModel socialFridgeModel = new SocialFridgeModel();
        AddressModel addressModel = new AddressModel();
        addressModel.setLatitude(address.getLatitude());
        addressModel.setLongitude(address.getLongitude());
        socialFridgeModel.setUsername(account.getUsername());
        socialFridgeModel.setAddress(addressModel);
        socialFridgeModel.setId(socialFridge.getId());
        socialFridgeModel.setSocialFridgeAverageRating(socialFridgeAverageRatingModel);

        when(accountRepository.findByUsername(account.getUsername())).thenReturn(Optional.of(account));
        when(addressRepository.findByLatitudeAndLongitude(address.getLatitude(), address.getLongitude())).thenReturn(Optional.empty());

        Assertions.assertDoesNotThrow(() -> socialFridgeService.addSocialFridge(socialFridgeModel));

        verify(accountRepository, times(1)).findByUsername(account.getUsername());
        verify(addressRepository, times(1)).findByLatitudeAndLongitude(address.getLatitude(), address.getLongitude());
        verify(socialFridgeRepository, times(1)).save(any());
        verify(socialFridgeAverageRatingRepository, times(1)).save(any());
        verify(socialFridgeMapper, times(1)).socialFridgeToSocialFridgeModel(any());
    }

    @Test
    void testCheckUpdateLogicBusinessNoChange() {
        final SocialFridge socialFridge = new SocialFridge();
        socialFridge.setState(SocialFridgeState.ACTIVE);
        final SocialFridgeModel patchedSocialFridgeModel = new SocialFridgeModel();
        patchedSocialFridgeModel.setState(SocialFridgeState.ACTIVE);

        Assertions.assertDoesNotThrow(() -> socialFridgeService.checkUpdateLogicBusiness(patchedSocialFridgeModel, socialFridge));

        verifyNoInteractions(socialFridgeRepository);
        verify(socialFridgeMapper, times(1)).socialFridgeToSocialFridgeModel(any());
    }

    @Test
    void testCheckUpdateLogicBusinessChangeAccount() {
        final Account account1 = createRandomAccount();
        final Account account2 = createRandomAccount();
        account1.getRoles().add(Roles.MANAGER);
        final SocialFridge socialFridge = new SocialFridge();
        socialFridge.setAccount(account2);
        final SocialFridgeModel patchedSocialFridgeModel = new SocialFridgeModel();
        patchedSocialFridgeModel.setUsername(account1.getUsername());
        socialFridge.setState(SocialFridgeState.ACTIVE);
        patchedSocialFridgeModel.setState(SocialFridgeState.ACTIVE);

        when(accountRepository.findByUsername(account1.getUsername())).thenReturn(Optional.of(account1));

        when(eTagCalculator.verifyProvidedETag(socialFridge)).thenReturn(true);

        Assertions.assertDoesNotThrow(() -> socialFridgeService.checkUpdateLogicBusiness(patchedSocialFridgeModel, socialFridge));

        verify(accountRepository, times(1)).findByUsername(account1.getUsername());
        verify(socialFridgeRepository, times(1)).save(any());
        verify(socialFridgeMapper, times(1)).socialFridgeToSocialFridgeModel(any());
    }

    @Test
    void testCheckUpdateLogicBusinessChangeAccountDeletedSocialFridgeModificationException() {
        final Account account1 = createRandomAccount();
        final Account account2 = createRandomAccount();
        final SocialFridge socialFridge = new SocialFridge();
        socialFridge.setState(SocialFridgeState.ARCHIVED);
        socialFridge.setAccount(account2);
        final SocialFridgeModel patchedSocialFridgeModel = new SocialFridgeModel();
        patchedSocialFridgeModel.setUsername(account1.getUsername());
        patchedSocialFridgeModel.setState(SocialFridgeState.ARCHIVED);

        when(eTagCalculator.verifyProvidedETag(socialFridge)).thenReturn(true);

        assertThrows(DeletedSocialFridgeModificationException.class, () -> socialFridgeService.checkUpdateLogicBusiness(patchedSocialFridgeModel, socialFridge));
    }

    @Test
    void testCheckUpdateLogicBusinessChangeAccountNotFoundException() {
        final Account account1 = createRandomAccount();
        final Account account2 = createRandomAccount();
        final SocialFridge socialFridge = new SocialFridge();
        socialFridge.setAccount(account2);
        final SocialFridgeModel patchedSocialFridgeModel = new SocialFridgeModel();
        patchedSocialFridgeModel.setUsername(account1.getUsername());
        socialFridge.setState(SocialFridgeState.ACTIVE);
        patchedSocialFridgeModel.setState(SocialFridgeState.ACTIVE);

        when(accountRepository.findByUsername(account2.getUsername())).thenReturn(Optional.empty());
        when(eTagCalculator.verifyProvidedETag(socialFridge)).thenReturn(true);

        assertThrows(AccountNotFoundException.class, () -> socialFridgeService.checkUpdateLogicBusiness(patchedSocialFridgeModel, socialFridge));

        verify(accountRepository, times(1)).findByUsername(account1.getUsername());
    }

    @Test
    void testCheckUpdateLogicBusinessChangeAccountNotManagerException() {
        final Account account1 = createRandomAccount();
        final Account account2 = createRandomAccount();
        account1.getRoles().add(Roles.USER);
        final SocialFridge socialFridge = new SocialFridge();
        socialFridge.setAccount(account2);
        final SocialFridgeModel patchedSocialFridgeModel = new SocialFridgeModel();
        patchedSocialFridgeModel.setUsername(account1.getUsername());
        socialFridge.setState(SocialFridgeState.ACTIVE);
        patchedSocialFridgeModel.setState(SocialFridgeState.ACTIVE);

        when(eTagCalculator.verifyProvidedETag(socialFridge)).thenReturn(true);
        when(accountRepository.findByUsername(account1.getUsername())).thenReturn(Optional.of(account1));

        assertThrows(NotManagerException.class, () -> socialFridgeService.checkUpdateLogicBusiness(patchedSocialFridgeModel, socialFridge));

        verify(accountRepository, times(1)).findByUsername(account1.getUsername());
    }

    @Test
    void testCheckUpdateLogicBusinessUpdateState() {
        final SocialFridge socialFridge = new SocialFridge();
        final SocialFridgeModel patchedSocialFridgeModel = new SocialFridgeModel();
        patchedSocialFridgeModel.setState(SocialFridgeState.ARCHIVED);

        when(eTagCalculator.verifyProvidedETag(socialFridge)).thenReturn(true);

        Assertions.assertDoesNotThrow(() -> socialFridgeService.checkUpdateLogicBusiness(patchedSocialFridgeModel, socialFridge));

        verify(socialFridgeRepository, times(1)).save(any());
        verify(socialFridgeMapper, times(1)).socialFridgeToSocialFridgeModel(any());

        assertEquals(SocialFridgeState.ARCHIVED, socialFridge.getState());
    }

    @Test
    void testCheckUpdateLogicBusinessChangeGrade() {
        final Account account = createRandomAccount();
        final SocialFridge socialFridge = new SocialFridge();
        final SocialFridgeAverageRating averageRating = new SocialFridgeAverageRating();
        socialFridge.setSocialFridgeAverageRating(averageRating);
        final SocialFridgeModel patchedSocialFridgeModel = new SocialFridgeModel();
        patchedSocialFridgeModel.setRating(4);
        final Grade grade = new Grade(3F);
        grade.setCreatedBy(account.getUsername());
        socialFridge.getGrades().add(grade);

        final Authentication authentication = Mockito.mock(Authentication.class);
        when(authentication.getName()).thenReturn(account.getUsername());
        final SecurityContext securityContext = Mockito.mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        when(eTagCalculator.verifyProvidedETag(socialFridge)).thenReturn(true);
        when(eTagCalculator.verifyProvidedETag(grade)).thenReturn(true);

        Assertions.assertDoesNotThrow(() -> socialFridgeService.checkUpdateLogicBusiness(patchedSocialFridgeModel, socialFridge));

        verify(gradeRepository, times(1)).save(grade);
        verify(socialFridgeRepository, times(1)).save(any());
        verify(socialFridgeMapper, times(1)).socialFridgeToSocialFridgeModel(any());

        assertEquals(4F, socialFridge.getSocialFridgeAverageRating().getAverageRating());
    }

    @Test
    void testCheckUpdateLogicBusinessChangeGradeNull() {
        final Account account = createRandomAccount();
        final SocialFridge socialFridge = new SocialFridge();
        final SocialFridgeAverageRating socialFridgeAverageRating = new SocialFridgeAverageRating();
        socialFridge.setSocialFridgeAverageRating(socialFridgeAverageRating);
        final SocialFridgeModel patchedSocialFridgeModel = new SocialFridgeModel();
        patchedSocialFridgeModel.setRating(4);

        final Authentication authentication = Mockito.mock(Authentication.class);
        when(authentication.getName()).thenReturn(account.getUsername());
        final SecurityContext securityContext = Mockito.mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        Assertions.assertDoesNotThrow(() -> socialFridgeService.checkUpdateLogicBusiness(patchedSocialFridgeModel, socialFridge));

        verify(gradeRepository, times(1)).save(any());
        verify(socialFridgeRepository, times(1)).save(any());
        verify(socialFridgeMapper, times(1)).socialFridgeToSocialFridgeModel(any());

        assertEquals(4F, socialFridge.getSocialFridgeAverageRating().getAverageRating());
    }

    @Test
    void testCheckUpdateLogicBusinessChangeGradeSameRatingUpdateException() {
        final Account account = createRandomAccount();
        final SocialFridge socialFridge = new SocialFridge();
        final SocialFridgeModel patchedSocialFridgeModel = new SocialFridgeModel();
        patchedSocialFridgeModel.setRating(4);
        final Grade grade = new Grade(4F);
        grade.setCreatedBy(account.getUsername());
        socialFridge.getGrades().add(grade);

        final Authentication authentication = Mockito.mock(Authentication.class);
        when(authentication.getName()).thenReturn(account.getUsername());
        final SecurityContext securityContext = Mockito.mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        when(eTagCalculator.verifyProvidedETag(grade)).thenReturn(true);

        assertThrows(SameRatingUpdateException.class, () -> socialFridgeService.checkUpdateLogicBusiness(patchedSocialFridgeModel, socialFridge));
    }

    @Test
    void testCheckUpdateLogicBusinessChangeGradeDeletedSocialFridgeModificationException() {
        final SocialFridge socialFridge = new SocialFridge();
        socialFridge.setState(SocialFridgeState.ARCHIVED);

        final SocialFridgeModel patchedSocialFridgeModel = new SocialFridgeModel();
        patchedSocialFridgeModel.setRating(4);

        assertThrows(DeletedSocialFridgeModificationException.class, () -> socialFridgeService.checkUpdateLogicBusiness(patchedSocialFridgeModel, socialFridge));
    }

    @Test
    void testCheckUpdateLogicBusinessChangeGradeInactiveSocialFridgeException() {
        final SocialFridge socialFridge = new SocialFridge();
        socialFridge.setState(SocialFridgeState.INACTIVE);

        final SocialFridgeModel patchedSocialFridgeModel = new SocialFridgeModel();
        patchedSocialFridgeModel.setRating(4);

        assertThrows(InactiveSocialFridgeException.class, () -> socialFridgeService.checkUpdateLogicBusiness(patchedSocialFridgeModel, socialFridge));
    }

    @Test
    void testCheckUpdateLogicBusinessChangeGradeRatingOutOfRangeException() {
        final SocialFridge socialFridge = new SocialFridge();

        final SocialFridgeModel patchedSocialFridgeModel = new SocialFridgeModel();
        patchedSocialFridgeModel.setRating(6);

        assertThrows(RatingOutOfRangeException.class, () -> socialFridgeService.checkUpdateLogicBusiness(patchedSocialFridgeModel, socialFridge));
    }

    @Test
    void testGetSocialFridgesWithinDistance() {
        final String userLatitude = "10.0";
        final String userLongitude = "20.0";
        final Double maxDistanceKm = 10.0;

        final List<SocialFridge> allSocialFridges = generateSocialFridgesWithinDistance(userLatitude, userLongitude);

        when(socialFridgeRepository.findByState(SocialFridgeState.ACTIVE)).thenReturn(allSocialFridges);

        when(socialFridgeMapper.socialFridgeToSocialFridgeModel(any())).thenReturn(new SocialFridgeModel());

        final List<SocialFridgeModel> result = socialFridgeService.getSocialFridgesWithinDistance(userLatitude, userLongitude, maxDistanceKm);

        assertEquals(allSocialFridges.size(), result.size());

        verify(socialFridgeRepository, times(1)).findByState(SocialFridgeState.ACTIVE);
        verify(socialFridgeMapper, times(allSocialFridges.size())).socialFridgeToSocialFridgeModel(any());
    }


    @Test
    void testGetStatistics() {
        final int months = 5;
        final AddressModel addressModel = new AddressModel();
        final LocalDateTime cutoffDateTime = LocalDateTime.now().minusMonths(2);
        final SocialFridge socialFridge1 = new SocialFridge();
        final SocialFridgeAverageRating socialFridgeAverageRating = new SocialFridgeAverageRating();
        final SocialFridgeAverageRatingModel socialFridgeAverageRatingModel = new SocialFridgeAverageRatingModel();
        socialFridge1.setSocialFridgeAverageRating(socialFridgeAverageRating);
        final List<SocialFridge> socialFridges = new ArrayList<>();
        final Product product1 = new Product();
        product1.setCreationDateTime(cutoffDateTime);
        product1.setState(ProductState.ARCHIVED_BY_USER);
        product1.setSize(10.0);
        product1.getCategories().add(DAIRY);
        final Product product2 = new Product();
        product2.setCreationDateTime(cutoffDateTime);
        product2.setState(ProductState.ARCHIVED_BY_SYSTEM);
        product2.setSize(5.0);
        product2.getCategories().add(VEGETABLES);

        socialFridge1.getProducts().add(product1);
        socialFridge1.getProducts().add(product2);
        socialFridges.add(socialFridge1);

        when(socialFridgeRepository.findAll()).thenReturn(socialFridges);
        when(addressMapper.addressToAddressModel(any())).thenReturn(addressModel);
        when(socialFridgeAverageRatingMapper.averageRatingToAverageRatingModel(any())).thenReturn(socialFridgeAverageRatingModel);

        final List<SocialFridgeStatisticModel> result = socialFridgeService.getStatistics(months);

        verify(socialFridgeRepository, times(1)).findAll();

        assertEquals(1, result.size());
        final SocialFridgeStatisticModel socialFridgeStatisticModel = result.get(0);

        assertEquals(2, socialFridgeStatisticModel.getDonatedFoodCount());
        assertEquals(15, socialFridgeStatisticModel.getDonatedFoodWeigh());
        assertEquals(1, socialFridgeStatisticModel.getArchivedBySystemCount());
        assertEquals(1, socialFridgeStatisticModel.getArchivedByUserCount());
        assertEquals(10, socialFridgeStatisticModel.getSavedFoodWeigh());
        assertEquals(5, socialFridgeStatisticModel.getWasteFoodWeigh());
        assertEquals(1, socialFridgeStatisticModel.getCategoryCounts().get(VEGETABLES));
        assertEquals(1, socialFridgeStatisticModel.getCategoryCounts().get(DAIRY));
    }

    @Test
    void testSendUpdateSocialFridgeNotificationSocialFridgeNotFoundException() {
        final UpdateSocialFridgeModel updateSocialFridgeModel = new UpdateSocialFridgeModel();
        final SocialFridge socialFridge = new SocialFridge();
        updateSocialFridgeModel.setSocialFridgeId(socialFridge.getId());

        when(socialFridgeRepository.findById(updateSocialFridgeModel.getSocialFridgeId())).thenReturn(Optional.empty());

        assertThrows(SocialFridgeNotFoundException.class, () -> socialFridgeService.sendUpdateSocialFridgeNotification(updateSocialFridgeModel));

        verify(socialFridgeRepository, times(1)).findById(updateSocialFridgeModel.getSocialFridgeId());
    }

    @Test
    void testSendUpdateSocialFridgeNotificationInvalidDistanceFromSocialFridgeException() {
        final UpdateSocialFridgeModel updateSocialFridgeModel = new UpdateSocialFridgeModel();
        updateSocialFridgeModel.setLongitude("20.00");
        updateSocialFridgeModel.setLatitude("50.000");
        final SocialFridge socialFridge = new SocialFridge();
        final Address address = new Address();
        address.setLongitude("2.00");
        address.setLatitude("5.000");
        socialFridge.setAddress(address);
        updateSocialFridgeModel.setSocialFridgeId(socialFridge.getId());
        when(socialFridgeRepository.findById(updateSocialFridgeModel.getSocialFridgeId())).thenReturn(Optional.of(socialFridge));

        assertThrows(InvalidDistanceFromSocialFridgeException.class, () -> socialFridgeService.sendUpdateSocialFridgeNotification(updateSocialFridgeModel));

        verify(socialFridgeRepository, times(1)).findById(updateSocialFridgeModel.getSocialFridgeId());
    }

    @Test
    void testSendUpdateSocialFridgeNotification() throws Exception {
        final Account account = new Account();
        account.setUpdateCounter(0);
        final Account manager = new Account();
        final UpdateSocialFridgeModel updateSocialFridgeModel = new UpdateSocialFridgeModel();
        updateSocialFridgeModel.setLongitude("20.00");
        updateSocialFridgeModel.setLatitude("50.000");
        final SocialFridge socialFridge = new SocialFridge();
        socialFridge.setAccount(manager);
        final Address address = new Address();
        address.setLongitude("20.00");
        address.setLatitude("50.000");
        socialFridge.setAddress(address);
        final Product product = new Product();
        final ProductModel productModel = new ProductModel();
        productModel.setId(product.getId());
        final List<Product> products = new ArrayList<>();
        final List<ProductModel> productModels = new ArrayList<>();
        final List<Long> productsId = new ArrayList<>();
        products.add(product);
        productsId.add(product.getId());
        updateSocialFridgeModel.setSocialFridgeId(socialFridge.getId());
        updateSocialFridgeModel.setProducts(productsId);
        productModels.add(productModel);

        when(socialFridgeRepository.findById(updateSocialFridgeModel.getSocialFridgeId())).thenReturn(Optional.of(socialFridge));
        when(productRepository.findAllByIdIn(updateSocialFridgeModel.getProducts())).thenReturn(products);
        when(accountRepository.findByUsername(account.getUsername())).thenReturn(Optional.of(account));
        when(productMapper.productToProductModel(any())).thenReturn(productModel);
        doNothing().when(emailService).sendUpdateNotificationToManager(any(), any(), any(), any(), any(), any(), any(), any(), any());

        final Authentication authentication = Mockito.mock(Authentication.class);
        when(authentication.getName()).thenReturn(account.getUsername());
        final SecurityContext securityContext = Mockito.mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        assertDoesNotThrow(() -> socialFridgeService.sendUpdateSocialFridgeNotification(updateSocialFridgeModel));

        verify(socialFridgeRepository, times(1)).findById(updateSocialFridgeModel.getSocialFridgeId());
        verify(productRepository, times(1)).findAllByIdIn(updateSocialFridgeModel.getProducts());
        verify(accountRepository, times(1)).save(account);
        verify(accountRepository, times(1)).findByUsername(account.getUsername());

        assertEquals(1, account.getUpdateCounter());
    }

    @Test
    void testSendUpdateSocialFridgeNotificationAccountNotFoundException() throws Exception {
        final Account account = new Account();
        account.setUpdateCounter(0);
        final Account manager = new Account();
        final UpdateSocialFridgeModel updateSocialFridgeModel = new UpdateSocialFridgeModel();
        updateSocialFridgeModel.setLongitude("20.00");
        updateSocialFridgeModel.setLatitude("50.000");
        final SocialFridge socialFridge = new SocialFridge();
        socialFridge.setAccount(manager);
        final Address address = new Address();
        address.setLongitude("20.00");
        address.setLatitude("50.000");
        socialFridge.setAddress(address);
        final Product product = new Product();
        final ProductModel productModel = new ProductModel();
        productModel.setId(product.getId());
        final List<Product> products = new ArrayList<>();
        final List<ProductModel> productModels = new ArrayList<>();
        final List<Long> productsId = new ArrayList<>();
        products.add(product);
        productsId.add(product.getId());
        updateSocialFridgeModel.setSocialFridgeId(socialFridge.getId());
        updateSocialFridgeModel.setProducts(productsId);
        productModels.add(productModel);

        when(socialFridgeRepository.findById(updateSocialFridgeModel.getSocialFridgeId())).thenReturn(Optional.of(socialFridge));
        when(productRepository.findAllByIdIn(updateSocialFridgeModel.getProducts())).thenReturn(products);
        when(accountRepository.findByUsername(account.getUsername())).thenReturn(Optional.empty());
        when(productMapper.productToProductModel(any())).thenReturn(productModel);
        doNothing().when(emailService).sendUpdateNotificationToManager(any(), any(), any(), any(), any(), any(), any(), any(), any());

        final Authentication authentication = Mockito.mock(Authentication.class);
        when(authentication.getName()).thenReturn(account.getUsername());
        final SecurityContext securityContext = Mockito.mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        assertThrows(AccountNotFoundException.class, () -> socialFridgeService.sendUpdateSocialFridgeNotification(updateSocialFridgeModel));

        verify(socialFridgeRepository, times(1)).findById(updateSocialFridgeModel.getSocialFridgeId());
        verify(productRepository, times(1)).findAllByIdIn(updateSocialFridgeModel.getProducts());
        verify(accountRepository, times(0)).save(account);
        verify(accountRepository, times(1)).findByUsername(account.getUsername());
        assertEquals(0, account.getUpdateCounter());
    }

    @Test
    void testGetAllManagedSocialFridges() throws AccountNotFoundException {
        Account account = new Account();

        final Authentication authentication = Mockito.mock(Authentication.class);
        when(authentication.getName()).thenReturn(account.getUsername());
        final SecurityContext securityContext = Mockito.mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        final List<SocialFridgeState> states = List.of(SocialFridgeState.ACTIVE);
        final Pageable pageable = Pageable.unpaged();
        final List<SocialFridge> socialFridges = new ArrayList<>();
        final List<SocialFridgeModel> expectedModels = new ArrayList<>();

        when(accountRepository.findByUsername(account.getUsername())).thenReturn(java.util.Optional.of(account));
        when(socialFridgeRepository.findManagedSocialFridges(states, account.getId(), pageable))
                .thenReturn(socialFridges);
        when(socialFridgeMapper.socialFridgeToSocialFridgeModel(any())).thenReturn(new SocialFridgeModel());

        final List<SocialFridgeModel> result = socialFridgeService.getAllManagedSocialFridges(pageable, states);

        verify(accountRepository, times(1)).findByUsername(account.getUsername());
        verify(socialFridgeRepository, times(1)).findManagedSocialFridges(states, account.getId(), pageable);
        verify(socialFridgeMapper, times(socialFridges.size())).socialFridgeToSocialFridgeModel(any());

        assertEquals(expectedModels, result);
    }

    @Test
    void testGetAllManagedSocialFridgesAccountNotFoundException() {
        final List<SocialFridgeState> states = List.of(SocialFridgeState.ACTIVE);
        final Pageable pageable = Pageable.unpaged();
        final Account account = new Account();
        final Authentication authentication = Mockito.mock(Authentication.class);
        when(authentication.getName()).thenReturn(account.getUsername());
        final SecurityContext securityContext = Mockito.mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        when(accountRepository.findByUsername(account.getUsername())).thenReturn(Optional.empty());

        assertThrows(AccountNotFoundException.class, () -> socialFridgeService.getAllManagedSocialFridges(pageable, states));

        verify(accountRepository, times(1)).findByUsername(account.getUsername());
    }

    @Test
    void testGetSelfSocialFridgeRating() throws SocialFridgeNotFoundException {
        final Account account = createRandomAccount();
        final Authentication authentication = Mockito.mock(Authentication.class);
        when(authentication.getName()).thenReturn(account.getUsername());
        final SecurityContext securityContext = Mockito.mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
        final SocialFridge socialFridge = new SocialFridge();
        final Grade grade = new Grade(4.5F);
        grade.setCreatedBy(account.getUsername());
        socialFridge.getGrades().add(grade);

        when(accountRepository.findByUsername(account.getUsername())).thenReturn(Optional.of(account));
        when(socialFridgeRepository.findById(socialFridge.getId())).thenReturn(Optional.of(socialFridge));
        when(eTagCalculator.calculateETagForEntity(grade)).thenReturn(EntityTag.valueOf(""));

        GradeModel result = socialFridgeService.getSelfSocialFridgeRating(socialFridge.getId());

        assertEquals(4.5F, result.getRating());
        verify(socialFridgeRepository, times(1)).findById(socialFridge.getId());
    }

    @Test
    void testGetSelfSocialFridgeRatingNoRating() throws SocialFridgeNotFoundException {
        final Account account = createRandomAccount();
        final Authentication authentication = Mockito.mock(Authentication.class);
        when(authentication.getName()).thenReturn(account.getUsername());
        final SecurityContext securityContext = Mockito.mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
        final SocialFridge socialFridge = new SocialFridge();

        when(accountRepository.findByUsername(account.getUsername())).thenReturn(Optional.of(account));
        when(socialFridgeRepository.findById(socialFridge.getId())).thenReturn(Optional.of(socialFridge));

        GradeModel result = socialFridgeService.getSelfSocialFridgeRating(socialFridge.getId());

        assertEquals(0F, result.getRating());
        verify(socialFridgeRepository, times(1)).findById(socialFridge.getId());
    }

    @Test
    void testGetSelfSocialFridgeRatingSocialFridgeNotFoundException() {
        final Account account = createRandomAccount();
        final Authentication authentication = Mockito.mock(Authentication.class);
        when(authentication.getName()).thenReturn(account.getUsername());
        final SecurityContext securityContext = Mockito.mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
        final SocialFridge socialFridge = new SocialFridge();

        when(socialFridgeRepository.findById(socialFridge.getId())).thenReturn(Optional.empty());

        assertThrows(SocialFridgeNotFoundException.class, () -> socialFridgeService.getSelfSocialFridgeRating(socialFridge.getId()));

        verify(socialFridgeRepository, times(1)).findById(socialFridge.getId());
    }
}