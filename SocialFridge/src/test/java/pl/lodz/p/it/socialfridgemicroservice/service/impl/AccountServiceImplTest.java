package pl.lodz.p.it.socialfridgemicroservice.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.github.javafaker.Faker;
import jakarta.ws.rs.core.EntityTag;
import org.apache.commons.lang3.RandomStringUtils;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import pl.lodz.p.it.socialfridgemicroservice.config.Roles;
import pl.lodz.p.it.socialfridgemicroservice.entity.Account;
import pl.lodz.p.it.socialfridgemicroservice.entity.SocialFridge;
import pl.lodz.p.it.socialfridgemicroservice.enums.Category;
import pl.lodz.p.it.socialfridgemicroservice.enums.Language;
import pl.lodz.p.it.socialfridgemicroservice.exception.accountException.AccountNotFoundException;
import pl.lodz.p.it.socialfridgemicroservice.exception.socialFridgeException.SocialFridgeNotFoundException;
import pl.lodz.p.it.socialfridgemicroservice.kafka.AccountSerializerDeserializer;
import pl.lodz.p.it.socialfridgemicroservice.mappers.AccountMapper;
import pl.lodz.p.it.socialfridgemicroservice.mappers.SocialFridgeMapper;
import pl.lodz.p.it.socialfridgemicroservice.model.AccountModel;
import pl.lodz.p.it.socialfridgemicroservice.repository.AccountRepository;
import pl.lodz.p.it.socialfridgemicroservice.repository.SocialFridgeRepository;
import pl.lodz.p.it.socialfridgemicroservice.utils.eTag.ETagCalculator;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@SpringBootTest
class AccountServiceImplTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private ETagCalculator eTagCalculator;

    @Mock
    private AccountMapper accountMapper;

    @Mock
    private SocialFridgeMapper socialFridgeMapper;

    @Mock
    private SocialFridgeRepository socialFridgeRepository;

    @Mock
    private KafkaTemplate<String, String> kafkaTemplate;

    @InjectMocks
    private AccountServiceImpl accountService;

    private final Faker faker = new Faker();

    private AccountModel createRandomAccountModel() {
        AccountModel accountModel = new AccountModel();
        accountModel.setUsername(faker.name().username());
        accountModel.setFirstName(faker.name().firstName());
        accountModel.setLastName(faker.name().lastName());
        accountModel.setEmail(faker.internet().emailAddress());
        accountModel.setIsEnabled(faker.random().nextBoolean());
        accountModel.setLanguage(Language.EN);
        accountModel.getRoles().add(Roles.USER);

        return accountModel;
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

    private Account createRandomAccount() {
        List<String> roles = new ArrayList<>();
        roles.add(Roles.USER);

        return new Account(faker.name().username(), faker.name().firstName(),
                faker.name().lastName(), faker.internet().emailAddress(), faker.random().nextBoolean(), 0,
                Language.EN, new ArrayList<>(), new HashSet<>(), roles);
    }

    @Test
    void testCheckUpdateLogicBusinessNoChanges() throws SocialFridgeNotFoundException, AccountNotFoundException {
        final Account account = createRandomAccount();
        account.getFavCategories().add(Category.DAIRY);
        final AccountModel patchedAccountModel = createAccountModel(account);

        final AccountModel result = accountService.checkUpdateLogicBusiness(patchedAccountModel, account);
        verifyNoInteractions(accountRepository);
        verify(accountMapper, times(1));
        assertEquals(accountMapper.accountToAccountModel(account), result);
    }

    @Test
    void testGetOwnAccount() throws AccountNotFoundException {
        final Account account = new Account();
        when(accountRepository.findByUsername(any())).thenReturn(java.util.Optional.of(account));

        final AccountModel expectedResult = Mockito.mock(AccountModel.class);
        when(accountMapper.accountToAccountModel(any())).thenReturn(expectedResult);

        final Authentication authentication = Mockito.mock(Authentication.class);
        when(authentication.getName()).thenReturn(RandomStringUtils.randomAlphanumeric(8));
        final SecurityContext securityContext = Mockito.mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        when(eTagCalculator.calculateETagForEntity(account)).thenReturn(EntityTag.valueOf(""));

        final AccountModel result = accountService.getOwnAccount();
        assertEquals(expectedResult, result);

        SecurityContextHolder.clearContext();
    }

    @Test
    void testGetOwnAccountNotFoundException() {
        when(accountRepository.findByUsername(any())).thenReturn(Optional.empty());

        final AccountModel expectedResult = Mockito.mock(AccountModel.class);
        when(accountMapper.accountToAccountModel(any())).thenReturn(expectedResult);

        final Authentication authentication = Mockito.mock(Authentication.class);
        when(authentication.getName()).thenReturn(RandomStringUtils.randomAlphanumeric(8));
        final SecurityContext securityContext = Mockito.mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        assertThrows(AccountNotFoundException.class, () -> accountService.getOwnAccount());

        SecurityContextHolder.clearContext();
    }

    @Test
    void testCreateAccount() throws JsonProcessingException {
        final AccountModel accountModel = createRandomAccountModel();

        final String serializedUser = AccountSerializerDeserializer.serializeUser(accountModel);

        assertDoesNotThrow(() -> accountService.createAccount(serializedUser));

        verify(accountRepository, times(1)).save(any());
        verifyNoMoreInteractions(kafkaTemplate);
    }

    @Test
    void testRemoveAccount() throws JsonProcessingException {
        final Account account = createRandomAccount();
        final AccountModel accountModel = createAccountModel(account);
        final String message = AccountSerializerDeserializer.serializeUser(accountModel);

        when(accountRepository.findByUsername(accountModel.getUsername())).thenReturn(Optional.of(account));

        assertDoesNotThrow(() -> accountService.removeAccount(message));

        verify(accountRepository, times(1)).findByUsername(accountModel.getUsername());
        verify(accountRepository, times(1)).delete(account);
        verifyNoMoreInteractions(kafkaTemplate);
    }

    @Test
    void testRemoveAccountAccountNotFoundException() throws JsonProcessingException {
        final Account account = createRandomAccount();
        final AccountModel accountModel = createAccountModel(account);
        final String message = AccountSerializerDeserializer.serializeUser(accountModel);

        when(accountRepository.findByUsername(accountModel.getUsername())).thenReturn(Optional.empty());

        assertThrows(AccountNotFoundException.class, () -> accountService.removeAccount(message));

        verify(accountRepository, times(1)).findByUsername(accountModel.getUsername());
        verifyNoMoreInteractions(accountRepository, kafkaTemplate);
    }

    @Test
    void testUpdateAccount() {
        final Account account = createRandomAccount();
        final AccountModel accountModel = createAccountModel(account);
        final boolean enabledFlag = !account.getIsEnabled();
        accountModel.setIsEnabled(enabledFlag);
        accountModel.setLanguage(Language.PL);
        accountModel.getRoles().add(Roles.VOLUNTEER);
        accountModel.getRoles().add(Roles.USER);

        final List<String> roles = new ArrayList<>();
        roles.add(Roles.USER);
        roles.add(Roles.VOLUNTEER);

        when(accountRepository.findByUsername(accountModel.getUsername())).thenReturn(Optional.of(account));

        assertDoesNotThrow(() -> accountService.updateAccount(AccountSerializerDeserializer.serializeUser(accountModel)));

        assertEquals(enabledFlag, account.getIsEnabled());
        assertEquals(Language.PL, account.getLanguage());
        assertEquals(roles, account.getRoles());

        verify(accountRepository, times(3)).save(account);
        verifyNoInteractions(kafkaTemplate);
    }

    @Test
    void testUpdateAccountAccountNotFoundAccount() throws JsonProcessingException {
        final Account account = createRandomAccount();
        final AccountModel accountModel = createAccountModel(account);
        final String message = AccountSerializerDeserializer.serializeUser(accountModel);

        when(accountRepository.findByUsername(accountModel.getUsername())).thenReturn(Optional.empty());

        assertThrows(AccountNotFoundException.class, () -> accountService.updateAccount(message));

        verify(accountRepository, times(1)).findByUsername(accountModel.getUsername());
        verifyNoMoreInteractions(accountRepository, kafkaTemplate);
    }

    @Test
    void testChangeFavCategories() {
        final Account account = createRandomAccount();
        account.getFavCategories().add(Category.DAIRY);

        final AccountModel patchedAccountModel = createAccountModel(account);
        patchedAccountModel.getFavCategories().add(Category.DAIRY);
        patchedAccountModel.getFavCategories().add(Category.MEAT);

        when(accountRepository.save(any(Account.class))).thenReturn(account);

        Assertions.assertDoesNotThrow(() -> accountService.changeFavCategories(patchedAccountModel, account));

        assertEquals(patchedAccountModel.getFavCategories().size(), account.getFavCategories().size());
        assertEquals(account.getFavCategories(), patchedAccountModel.getFavCategories());

        verify(accountRepository, times(1)).save(account);
        verify(accountMapper, times(1)).accountToAccountModel(account);
    }

    @Test
    void testChangeFavSocialFridges() {
        final Account account = new Account();
        final SocialFridge socialFridge1 = new SocialFridge();
        account.getFavSocialFridges().add(socialFridge1);

        final SocialFridge socialFridge2 = new SocialFridge();
        final SocialFridge socialFridge3 = new SocialFridge();


        final AccountModel patchedAccountModel = new AccountModel();
        patchedAccountModel.getFavSocialFridgesId().add(2L);
        patchedAccountModel.getFavSocialFridgesId().add(3L);

        when(socialFridgeRepository.findById(2L)).thenReturn(Optional.of(socialFridge2));
        when(socialFridgeRepository.findById(3L)).thenReturn(Optional.of(socialFridge3));

        Assertions.assertDoesNotThrow(() -> accountService.changeFavSocialFridges(patchedAccountModel, account));

        assertEquals(3, account.getFavSocialFridges().size());

        verify(accountRepository, times(1)).save(account);
        verify(accountMapper, times(1)).accountToAccountModel(account);
        verify(socialFridgeRepository, times(1)).findById(2L);
        verify(socialFridgeRepository, times(1)).findById(3L);
    }

    @Test
    void testChangeFavSocialFridgesNotFoundSocialFridge() {
        final Account account = new Account();
        final SocialFridge socialFridge1 = new SocialFridge();
        account.getFavSocialFridges().add(socialFridge1);

        final AccountModel patchedAccountModel = new AccountModel();
        patchedAccountModel.getFavSocialFridgesId().add(2L);

        assertThrows(SocialFridgeNotFoundException.class, () -> accountService.changeFavSocialFridges(patchedAccountModel, account));

        verify(socialFridgeRepository, times(1)).findById(2L);
        verifyNoMoreInteractions(accountRepository, kafkaTemplate);
    }


    @Test
    void testCheckUpdateLogicBusinessChangeFavCategories() {
        final Account account = createRandomAccount();
        account.getFavCategories().add(Category.DAIRY);

        final AccountModel patchedAccountModel = createAccountModel(account);
        patchedAccountModel.getFavCategories().add(Category.DAIRY);
        patchedAccountModel.getFavCategories().add(Category.MEAT);

        when(accountRepository.save(any(Account.class))).thenReturn(account);

        Assertions.assertDoesNotThrow(() -> accountService.checkUpdateLogicBusiness(patchedAccountModel, account));

        assertEquals(patchedAccountModel.getFavCategories().size(), account.getFavCategories().size());
        assertEquals(account.getFavCategories(), patchedAccountModel.getFavCategories());

        verify(accountRepository, times(1)).save(account);
        verify(accountMapper, times(2)).accountToAccountModel(account);
    }

    @Test
    void testCheckUpdateLogicBusinessChangeFavSocialFridges() {
        final Account account = new Account();
        final SocialFridge socialFridge1 = new SocialFridge();
        account.getFavSocialFridges().add(socialFridge1);

        final SocialFridge socialFridge2 = new SocialFridge();
        final SocialFridge socialFridge3 = new SocialFridge();


        final AccountModel patchedAccountModel = new AccountModel();
        patchedAccountModel.getFavSocialFridgesId().add(2L);
        patchedAccountModel.getFavSocialFridgesId().add(3L);

        when(socialFridgeRepository.findById(2L)).thenReturn(Optional.of(socialFridge2));
        when(socialFridgeRepository.findById(3L)).thenReturn(Optional.of(socialFridge3));


        Assertions.assertDoesNotThrow(() -> accountService.checkUpdateLogicBusiness(patchedAccountModel, account));

        assertEquals(3, account.getFavSocialFridges().size());

        verify(accountRepository, times(1)).save(account);
        verify(accountMapper, times(2)).accountToAccountModel(account);
        verify(socialFridgeRepository, times(1)).findById(2L);
        verify(socialFridgeRepository, times(1)).findById(3L);
    }
}