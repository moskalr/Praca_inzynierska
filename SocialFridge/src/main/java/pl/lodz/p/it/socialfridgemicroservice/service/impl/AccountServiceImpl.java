package pl.lodz.p.it.socialfridgemicroservice.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.fge.jsonpatch.JsonPatch;
import com.github.fge.jsonpatch.JsonPatchException;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import pl.lodz.p.it.socialfridgemicroservice.entity.Account;
import pl.lodz.p.it.socialfridgemicroservice.entity.SocialFridge;
import pl.lodz.p.it.socialfridgemicroservice.enums.Category;
import pl.lodz.p.it.socialfridgemicroservice.exception.AppBaseException;
import pl.lodz.p.it.socialfridgemicroservice.exception.accountException.AccountNotFoundException;
import pl.lodz.p.it.socialfridgemicroservice.exception.eTag.OutdatedDataException;
import pl.lodz.p.it.socialfridgemicroservice.exception.socialFridgeException.SocialFridgeNotFoundException;
import pl.lodz.p.it.socialfridgemicroservice.mappers.AccountMapper;
import pl.lodz.p.it.socialfridgemicroservice.model.AccountModel;
import pl.lodz.p.it.socialfridgemicroservice.repository.AccountRepository;
import pl.lodz.p.it.socialfridgemicroservice.repository.SocialFridgeRepository;
import pl.lodz.p.it.socialfridgemicroservice.service.AccountService;
import pl.lodz.p.it.socialfridgemicroservice.utils.eTag.ETagCalculator;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.lodz.p.it.socialfridgemicroservice.kafka.AccountSerializerDeserializer;

import java.util.*;

import static org.keycloak.util.JsonSerialization.mapper;

@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {
    private static final String REMOVE_TOPIC_SF = "remove_account_SF";
    private static final String UPDATE_TOPIC_SF = "update_account_SF";

    private final AccountRepository accountRepository;
    private final AccountMapper accountMapper;
    private final ObjectMapper objectMapper;
    private final SocialFridgeRepository socialFridgeRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ETagCalculator eTagCalculator;

    @Override
    @Transactional(
            propagation = Propagation.REQUIRED,
            isolation = Isolation.READ_COMMITTED,
            rollbackFor = AppBaseException.class,
            transactionManager = "fridgeTransactionManager")
    public AccountModel patchAccount(JsonPatch jsonPatch) throws AccountNotFoundException, JsonProcessingException, JsonPatchException, SocialFridgeNotFoundException, OutdatedDataException {
        final String currentPrincipalName = SecurityContextHolder.getContext().getAuthentication().getName();
        final Account account = accountRepository.findByUsername(currentPrincipalName).orElseThrow(
                () -> new AccountNotFoundException(currentPrincipalName)
        );

        if (!eTagCalculator.verifyProvidedETag(account)) {
            throw new OutdatedDataException();
        }

        AccountModel patchedAccountModel = accountMapper.accountToAccountModel(account);
        String originalJson = objectMapper.writeValueAsString(patchedAccountModel);
        JsonNode patchedNode = jsonPatch.apply(mapper.readTree(originalJson));
        patchedAccountModel = objectMapper.treeToValue(patchedNode, AccountModel.class);

        return checkUpdateLogicBusiness(patchedAccountModel, account);
    }

    @Override
    public AccountModel getOwnAccount() throws AccountNotFoundException {
        final String currentPrincipalName = SecurityContextHolder.getContext().getAuthentication().getName();
        final Account account = accountRepository.findByUsername(currentPrincipalName).orElseThrow(() -> new AccountNotFoundException(currentPrincipalName));
        final AccountModel accountModel = accountMapper.accountToAccountModel(account);

        accountModel.setETag(eTagCalculator.calculateETagForEntity(account).getValue());

        return accountModel;
    }

    @Override
    @Transactional(
            propagation = Propagation.REQUIRED,
            isolation = Isolation.READ_COMMITTED,
            rollbackFor = AppBaseException.class,
            transactionManager = "fridgeTransactionManager")
    public void createAccount(String message) throws JsonProcessingException {
        AccountModel accountModel = AccountSerializerDeserializer.deserializeUser(message);

        try {
            Account account = new Account(accountModel.getUsername(),
                    accountModel.getFirstName(),
                    accountModel.getLastName(),
                    accountModel.getEmail(),
                    accountModel.getIsEnabled(),
                    0,
                    accountModel.getLanguage(),
                    new ArrayList<>(),
                    new HashSet<>(),
                    accountModel.getRoles());
            accountRepository.save(account);

        } catch (Exception e) {
            kafkaTemplate.send(REMOVE_TOPIC_SF, message);
        }
    }

    @Override
    @Transactional(
            propagation = Propagation.REQUIRED,
            isolation = Isolation.READ_COMMITTED,
            rollbackFor = AppBaseException.class,
            transactionManager = "fridgeTransactionManager")
    public void removeAccount(String message) throws AccountNotFoundException, JsonProcessingException {
        AccountModel accountModel = AccountSerializerDeserializer.deserializeUser(message);
        Account account = accountRepository.findByUsername(accountModel.getUsername()).orElseThrow(
                () -> new AccountNotFoundException(accountModel.getUsername()));
        accountRepository.delete(account);
    }

    @Override
    @Transactional(
            propagation = Propagation.REQUIRED,
            isolation = Isolation.READ_COMMITTED,
            rollbackFor = AppBaseException.class,
            transactionManager = "fridgeTransactionManager")
    public void updateAccount(String message) throws AccountNotFoundException, JsonProcessingException {
        AccountModel accountModel = AccountSerializerDeserializer.deserializeUser(message);

        Account account = accountRepository.findByUsername(accountModel.getUsername()).orElseThrow(
                () -> new AccountNotFoundException(accountModel.getUsername()));
        try {
            if (!Objects.equals(account.getIsEnabled(), accountModel.getIsEnabled())) {
                account.setIsEnabled(accountModel.getIsEnabled());
                accountRepository.save(account);
            }
            if (account.getLanguage() != accountModel.getLanguage()) {
                account.setLanguage(accountModel.getLanguage());
                accountRepository.save(account);
            }
            if (!Objects.equals(account.getRoles(), accountModel.getRoles())) {
                account.getRoles().removeIf(role -> !accountModel.getRoles().contains(role));

                accountModel.getRoles().forEach(role -> {
                    if (!account.getRoles().contains(role)) {
                        account.getRoles().add(role);
                    }
                });
                accountRepository.save(account);
            }
        } catch (Exception e) {
            final String userJson = AccountSerializerDeserializer.serializeUser(accountMapper.accountToAccountModel(account));
            kafkaTemplate.send(UPDATE_TOPIC_SF, userJson);
        }
    }

    AccountModel checkUpdateLogicBusiness(AccountModel patchedAccountModel, Account account) throws SocialFridgeNotFoundException {
        AccountModel newAccount = null;
        if (!account.getFavCategories().equals(patchedAccountModel.getFavCategories())) {
            newAccount = changeFavCategories(patchedAccountModel, account);
        }

        if (!patchedAccountModel.getFavSocialFridgesId().isEmpty()) {
            newAccount = changeFavSocialFridges(patchedAccountModel, account);
        }
        if (newAccount == null) {
            newAccount = accountMapper.accountToAccountModel(account);
        }
        return newAccount;
    }

    AccountModel changeFavCategories(AccountModel patchedAccountModel, Account account) {
        Set<Category> existingFavCategories = account.getFavCategories();
        Set<Category> newFavCategories = patchedAccountModel.getFavCategories();

        existingFavCategories.retainAll(newFavCategories);

        for (Category newCategory : newFavCategories) {
            if (!existingFavCategories.contains(newCategory)) {
                existingFavCategories.add(newCategory);
            }
        }

        accountRepository.save(account);
        return accountMapper.accountToAccountModel(account);
    }

    AccountModel changeFavSocialFridges(AccountModel patchedAccountModel, Account account) throws SocialFridgeNotFoundException {
        List<SocialFridge> existingFavSocialFridge = account.getFavSocialFridges();
        List<Long> newFavSocialFridgesId = patchedAccountModel.getFavSocialFridgesId();

        for (Long newSocialFridgeId : newFavSocialFridgesId) {
            final boolean containsFridge = existingFavSocialFridge.removeIf(fridge -> Objects.equals(fridge.getId(), newSocialFridgeId));

            if (!containsFridge) {
                final SocialFridge socialFridge = socialFridgeRepository.findById(newSocialFridgeId).orElseThrow(
                        () -> new SocialFridgeNotFoundException(newSocialFridgeId)
                );
                existingFavSocialFridge.add(socialFridge);
            }
        }

        accountRepository.save(account);
        return accountMapper.accountToAccountModel(account);
    }
}