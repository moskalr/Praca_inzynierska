package pl.lodz.p.it.socialfridgemicroservice.service.impl;

import com.github.javafaker.Faker;
import pl.lodz.p.it.socialfridgemicroservice.config.Roles;
import pl.lodz.p.it.socialfridgemicroservice.entity.Account;
import pl.lodz.p.it.socialfridgemicroservice.entity.Address;
import pl.lodz.p.it.socialfridgemicroservice.entity.Product;
import pl.lodz.p.it.socialfridgemicroservice.entity.SocialFridge;
import pl.lodz.p.it.socialfridgemicroservice.enums.Category;
import pl.lodz.p.it.socialfridgemicroservice.enums.Language;
import pl.lodz.p.it.socialfridgemicroservice.enums.ProductState;
import pl.lodz.p.it.socialfridgemicroservice.mappers.AccountMapper;
import pl.lodz.p.it.socialfridgemicroservice.mappers.SocialFridgeMapper;
import pl.lodz.p.it.socialfridgemicroservice.model.AccountModel;
import pl.lodz.p.it.socialfridgemicroservice.repository.AccountRepository;
import pl.lodz.p.it.socialfridgemicroservice.repository.ProductRepository;
import jakarta.mail.MessagingException;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.kafka.core.KafkaTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@SpringBootTest
class SystemSchedulerTest {

    @InjectMocks
    private SystemScheduler systemScheduler;

    @Mock
    private EmailServiceImpl emailService;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private SocialFridgeMapper socialFridgeMapper;

    @Mock
    private AccountMapper accountMapper;

    @Mock
    private KafkaTemplate<String, String> kafkaTemplate;

    private final Faker faker = new Faker();

    private static final String UPDATE_TOPIC_SF = "update_account_SF";

    private Account createRandomAccount() {
        List<String> roles = new ArrayList<>();
        roles.add(Roles.USER);

        return new Account(faker.name().username(), faker.name().firstName(),
                faker.name().lastName(), faker.internet().emailAddress(), faker.random().nextBoolean(), 0,
                Language.EN, new ArrayList<>(), new HashSet<>(), roles);
    }

    private AccountModel createAccountModel(Account account) {
        AccountModel accountModel = new AccountModel();
        accountModel.setId(account.getId());
        accountModel.setUsername(account.getUsername());
        accountModel.setFirstName(account.getFirstName());
        accountModel.setLastName(account.getLastName());
        accountModel.setEmail(account.getEmail());
        accountModel.setIsEnabled(account.getIsEnabled());
        accountModel.setLanguage(account.getLanguage());
        if (account.getFavSocialFridges().size() > 0) {
            for (int i = 0; i < account.getFavSocialFridges().size(); i++) {
                accountModel.getFavSocialFridges().add(socialFridgeMapper.socialFridgeToSocialFridgeModel(account.getFavSocialFridges().get(i)));

            }
        }
        if (account.getFavCategories().size() > 0) {
            for (Category category : account.getFavCategories()) {
                accountModel.getFavCategories().add(category);
            }
        }
        if (accountModel.getRoles().size() > 0) {
            for (int i = 0; i < accountModel.getRoles().size(); i++) {
                accountModel.getRoles().add(account.getRoles().get(i));
            }
        }
        return accountModel;
    }

    @Test
    void testDeleteExpiredProductsShouldArchiveExpiredProductsAndSendEmails() throws MessagingException {
        final Address address = new Address();
        address.setCity(faker.address().city());
        address.setStreet(faker.address().streetName());
        address.setBuildingNumber(faker.address().buildingNumber());
        address.setPostalCode(faker.address().zipCode());
        address.setLongitude(faker.address().longitude());
        address.setLatitude(faker.address().latitude());
        final Account account = createRandomAccount();
        final SocialFridge socialFridge = new SocialFridge();
        final List<Product> products = new ArrayList<>();
        final Product expiredProduct = new Product();
        socialFridge.setAccount(account);
        expiredProduct.setTitle("Expired Product");
        expiredProduct.setExpirationDate(LocalDateTime.now().minusDays(1));
        expiredProduct.setSocialFridge(socialFridge);
        products.add(expiredProduct);
        socialFridge.setAddress(address);

        doNothing().when(emailService).sendExpirationNotificationToManager(expiredProduct.getSocialFridge().getAccount().getEmail(), expiredProduct.getTitle(),
                expiredProduct.getId(), expiredProduct.getSocialFridge().getAddress().getBuildingNumber(), expiredProduct.getSocialFridge().getAddress().getStreet(),
                expiredProduct.getSocialFridge().getAddress().getCity(), expiredProduct.getSocialFridge().getAccount().getLanguage());


        when(productRepository.findByState(ProductState.AVAILABLE)).thenReturn(products);

        assertEquals(ProductState.AVAILABLE, expiredProduct.getState());

        assertDoesNotThrow(() -> systemScheduler.deleteExpiredProducts());

        verify(productRepository, times(1)).save(expiredProduct);
        verify(emailService, times(1)).sendExpirationNotificationToManager(expiredProduct.getSocialFridge().getAccount().getEmail(), expiredProduct.getTitle(),
                expiredProduct.getId(), expiredProduct.getSocialFridge().getAddress().getBuildingNumber(), expiredProduct.getSocialFridge().getAddress().getStreet(),
                expiredProduct.getSocialFridge().getAddress().getCity(), expiredProduct.getSocialFridge().getAccount().getLanguage());

        assertEquals(ProductState.ARCHIVED_BY_SYSTEM, expiredProduct.getState());
    }

    @Test
    void testDynamicallyGrantAccessLevelAddRole() {
        final Account account = createRandomAccount();
        account.setUpdateCounter(5);
        account.getRoles().add(Roles.ELITE_USER);
        final List<String> roles = account.getRoles();
        final List<Account> accounts = new ArrayList<>();
        accounts.add(account);

        when(accountRepository.findAll()).thenReturn(accounts);

        assertEquals(5, account.getUpdateCounter());
        assertEquals(roles, account.getRoles());

        assertDoesNotThrow(() -> systemScheduler.dynamicallyGrantAccessLevel());

        verify(accountRepository, times(1)).save(account);

        assertEquals(0, account.getUpdateCounter());
        assertEquals(roles, account.getRoles());
    }

    @Test
    void testDynamicallyGrantAccessLevelAddRoleAndSendEmails() throws MessagingException {
        final Account account = createRandomAccount();
        account.setUpdateCounter(5);
        final List<String> roles = account.getRoles();
        final List<Account> accounts = new ArrayList<>();
        accounts.add(account);
        final AccountModel accountModel = createAccountModel(account);

        when(accountMapper.accountToAccountModel(any())).thenReturn(accountModel);
        when(accountRepository.findAll()).thenReturn(accounts);
        doNothing().when(emailService).addEliteUserAccessLevel(account.getFirstName(), account.getLastName(),
                account.getEmail(), account.getLanguage());

        assertEquals(5, account.getUpdateCounter());
        assertEquals(roles, account.getRoles());

        assertDoesNotThrow(() -> systemScheduler.dynamicallyGrantAccessLevel());

        verify(accountRepository, times(1)).save(account);
        verify(emailService, times(1)).addEliteUserAccessLevel(account.getFirstName(), account.getLastName(),
                account.getEmail(), account.getLanguage());
        verify(kafkaTemplate, times(1)).send(eq(UPDATE_TOPIC_SF), anyString());

        roles.add(Roles.ELITE_USER);
        assertEquals(0, account.getUpdateCounter());
        assertEquals(roles, account.getRoles());
    }

    @Test
    void testDynamicallyGrantAccessLevelRemoveRoleAndSendEmails() throws MessagingException {
        final Account account = createRandomAccount();
        account.setUpdateCounter(3);
        account.getRoles().add(Roles.ELITE_USER);
        final List<String> roles = account.getRoles();
        final List<Account> accounts = new ArrayList<>();
        accounts.add(account);
        final AccountModel accountModel = createAccountModel(account);

        when(accountMapper.accountToAccountModel(any())).thenReturn(accountModel);
        when(accountRepository.findAll()).thenReturn(accounts);
        doNothing().when(emailService).removeEliteUserAccessLevel(account.getFirstName(), account.getLastName(),
                account.getEmail(), account.getLanguage());

        assertEquals(3, account.getUpdateCounter());
        assertEquals(roles, account.getRoles());

        assertDoesNotThrow(() -> systemScheduler.dynamicallyGrantAccessLevel());

        verify(accountRepository, times(1)).save(account);
        verify(emailService, times(1)).removeEliteUserAccessLevel(account.getFirstName(), account.getLastName(),
                account.getEmail(), account.getLanguage());
        verify(kafkaTemplate, times(1)).send(eq(UPDATE_TOPIC_SF), anyString());

        roles.remove(Roles.ELITE_USER);
        assertEquals(0, account.getUpdateCounter());
        assertEquals(roles, account.getRoles());
    }
}
