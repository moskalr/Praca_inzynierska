package pl.lodz.p.it.accountmicroservice.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.fge.jsonpatch.JsonPatch;
import com.github.fge.jsonpatch.JsonPatchException;
import pl.lodz.p.it.accountmicroservice.config.Roles;
import pl.lodz.p.it.accountmicroservice.mappers.AccountMapper;
import pl.lodz.p.it.accountmicroservice.model.Account;
import pl.lodz.p.it.accountmicroservice.model.Language;
import pl.lodz.p.it.accountmicroservice.model.Role;
import pl.lodz.p.it.accountmicroservice.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.ClientsResource;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.ClientRepresentation;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import pl.lodz.p.it.accountmicroservice.exception.account.*;

import java.util.*;

import static pl.lodz.p.it.accountmicroservice.kafka.AccountSerializerDeserializer.deserializeUser;
import static pl.lodz.p.it.accountmicroservice.kafka.AccountSerializerDeserializer.serializeUser;
import static org.springframework.security.core.context.SecurityContextHolder.getContext;

@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {
    private static final String CREATE_USER_KEY = "create";

    private static final String UPDATE_USER_KEY = "update";

    @Value("${jwt.auth.converter.realm}")
    private String keycloakRealm;
    @Value("${jwt.auth.converter.resource-id}")
    private String clientFoodRescue;
    private final Keycloak keycloak;
    private static final String LANGUAGE = "language";
    private static final String UPDATE_PASSWORD = "UPDATE_PASSWORD";
    private static final String CREATE_TOPIC = "create_account";
    private static final String UPDATE_TOPIC_A = "update_account_A";
    private static final String ROLE_PREFIX = "ROLE_";

    private final AccountMapper accountMapper;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper mapper;
    private RealmResource keycloakRealmResource;
    private UsersResource realmUsersResource;
    private ClientsResource realmClientsResource;

    @Override
    public Account getSelfAccount(String username) throws AccountNotFoundException, KeycloakClientNotFoundException {
        UserRepresentation user = findAccount(username);
        final List<String> userRoles = getUserRoles(user.getUsername());

        return new Account(user.getUsername(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.isEnabled(),
                user.getAttributes().get(LANGUAGE).get(0),
                userRoles);

    }

    private UserRepresentation findAccount(String username) throws AccountNotFoundException {
        Optional<UserRepresentation> userRepresentation = keycloak.realm(keycloakRealm)
                .users()
                .searchByUsername(username, true)
                .stream()
                .findFirst();

        return userRepresentation.orElseThrow(() -> new AccountNotFoundException(username));
    }

    private void changeLanguage(Language language, UserRepresentation userEntity) throws AccessDeniedException, KeycloakClientNotFoundException, AccountNotFoundException, JsonProcessingException {
        final String currentPrincipalName = getPrincipalName();
        if (!currentPrincipalName.equals(userEntity.getUsername())) {
            throw new AccessDeniedException(currentPrincipalName);
        }
        Map<String, List<String>> attributes = new HashMap<>();
        attributes.put(LANGUAGE, Collections.singletonList(String.valueOf(language)));
        userEntity.setAttributes(attributes);
        final List<String> userRoles = getUserRoles(userEntity.getUsername());
        final String userJson = serializeUser(userEntity, userRoles);
        kafkaTemplate.send(UPDATE_TOPIC_A, userJson);
    }

    private void manageRoles(Role role, UserRepresentation userEntity, List<String> userEntityRoles) throws KeycloakClientNotFoundException {
        keycloakRealmResource = keycloak.realm(keycloakRealm);
        realmUsersResource = keycloakRealmResource.users();
        realmClientsResource = keycloakRealmResource.clients();

        String userId = userEntity.getId();
        ClientRepresentation keycloakClient = findClient(clientFoodRescue);
        String foodRescueClientId = keycloakClient.getId();
        List<RoleRepresentation> roleRepresentationToAdd = new ArrayList<>();
        for (String rol : role.getRoles()) {
            roleRepresentationToAdd.add(realmClientsResource.get(foodRescueClientId)
                    .roles()
                    .get(rol)
                    .toRepresentation());
        }
        List<RoleRepresentation> roleRepresentationToRemove = new ArrayList<>();
        for (String rol : userEntityRoles) {
            roleRepresentationToRemove.add(realmClientsResource.get(foodRescueClientId)
                    .roles()
                    .get(rol)
                    .toRepresentation());
        }

        realmUsersResource.get(userId)
                .roles()
                .clientLevel(foodRescueClientId)
                .remove(roleRepresentationToRemove);

        realmUsersResource.get(userId)
                .roles()
                .clientLevel(foodRescueClientId)
                .add(roleRepresentationToAdd);
    }

    private List<String> getUserRoles(String username) throws AccountNotFoundException, KeycloakClientNotFoundException {
        keycloakRealmResource = keycloak.realm(keycloakRealm);
        realmUsersResource = keycloakRealmResource.users();
        UserRepresentation user = findAccount(username);
        String userId = user.getId();
        ClientRepresentation keycloakClient = findClient(clientFoodRescue);
        String foodRescueClientId = keycloakClient.getId();
        return realmUsersResource.get(userId)
                .roles()
                .clientLevel(foodRescueClientId)
                .listAll()
                .stream()
                .map(RoleRepresentation::toString)
                .toList();
    }

    @Override
    public List<Account> getUsers(String username) throws KeycloakClientNotFoundException, AccountNotFoundException {
        final String currentPrincipalName = getPrincipalName();
        List<UserRepresentation> users;
        if (username == null) {
            users = keycloak.realm(keycloakRealm)
                    .users().list();
        } else {
            users = keycloak.realm(keycloakRealm)
                    .users()
                    .searchByUsername(username, false);
        }

        List<Account> accounts = new ArrayList<>();

        for (UserRepresentation user : users) {
            if (!user.getUsername().equals(currentPrincipalName)) {
                List<String> userRoles = getUserRoles(user.getUsername());
                accounts.add(accountMapper.userRepresentationToAccount(user, userRoles, user.getAttributes().get(LANGUAGE).get(0)));
            }
        }

        return accounts;
    }

    private void changeEmail(String email, UserRepresentation userEntity) throws EmailAlreadyTakenException, AccessDeniedException {
        final String currentPrincipalName = getPrincipalName();
        if (!currentPrincipalName.equals(userEntity.getUsername())) {
            throw new AccessDeniedException(currentPrincipalName);
        }
        List<UserRepresentation> users = keycloak.realm(keycloakRealm).users().searchByEmail(email, true);
        throwIfUsersIsNotEmpty(users);
        userEntity.setEmail(email);
    }

    private void throwIfUsersIsNotEmpty(List<UserRepresentation> users) throws EmailAlreadyTakenException {
        if (!users.isEmpty()) {
            throw new EmailAlreadyTakenException();
        }
    }

    @Override
    public void resetPassword(String email) throws AccountNotFoundByEmailException {
        UserRepresentation user = keycloak.realm(keycloakRealm)
                .users()
                .searchByEmail(email, true)
                .stream()
                .findFirst()
                .orElseThrow(() -> new AccountNotFoundByEmailException(email));

        UserResource userResource = keycloak.realm(keycloakRealm).users().get(user.getId());
        userResource.executeActionsEmail(List.of(UPDATE_PASSWORD), null);
    }

    @Override
    public Account patchAccount(String username, JsonPatch jsonPatch) throws AccountNotFoundException, KeycloakClientNotFoundException, JsonPatchException, AccessDeniedException, EmailAlreadyTakenException, SelfAccountActionException, NotAllowedRolesException, JsonProcessingException {
        UserRepresentation userEntity = findAccount(username);
        final List<String> userEntityRoles = getUserRoles(username);

        Account patchedAccount = new Account(userEntity.getUsername(),
                userEntity.getFirstName(),
                userEntity.getLastName(),
                userEntity.getEmail(),
                userEntity.isEnabled(),
                userEntity.getAttributes().get(LANGUAGE).get(0),
                new ArrayList<>());

        JsonNode patchedAccountNode = mapper.valueToTree(patchedAccount);
        final JsonNode patched = jsonPatch.apply(patchedAccountNode);
        patchedAccount = mapper.convertValue(patched, Account.class);

        return checkUpdateLogicBussiness(patchedAccount, userEntity, userEntityRoles);
    }

    private Account checkUpdateLogicBussiness(Account patchedAccount, UserRepresentation userEntity, List<String> userEntityRoles) throws AccountNotFoundException, KeycloakClientNotFoundException, EmailAlreadyTakenException, SelfAccountActionException, NotAllowedRolesException, AccessDeniedException, JsonProcessingException {
        if (!patchedAccount.getEmail().equals(userEntity.getEmail())) {
            changeEmail(patchedAccount.getEmail(), userEntity);
        }
        if (!patchedAccount.getLanguage().getStringLanguage().equals(userEntity.getAttributes().get(LANGUAGE).get(0))) {
            changeLanguage(patchedAccount.getLanguage(), userEntity);
        }
        if (!patchedAccount.getIsEnabled().equals(userEntity.isEnabled())) {
            editUserEnableFlag(getContext().getAuthentication().getName(), patchedAccount.getIsEnabled(), userEntity);
        }
        if (!patchedAccount.getRoles().isEmpty()) {
            changeRoles(new Role(patchedAccount.getUsername(), patchedAccount.getRoles()), userEntity, userEntityRoles);
        }

        keycloak.realm(keycloakRealm).users().get(userEntity.getId()).update(userEntity);

        UserRepresentation updatedUserEntity = findAccount(userEntity.getUsername());
        return new Account(updatedUserEntity.getUsername(),
                updatedUserEntity.getFirstName(),
                updatedUserEntity.getLastName(),
                updatedUserEntity.getEmail(),
                updatedUserEntity.isEnabled(),
                updatedUserEntity.getAttributes().get(LANGUAGE).get(0),
                getUserRoles(updatedUserEntity.getUsername()));
    }

    private void changeRoles(Role role, UserRepresentation userEntity, List<String> userEntityRoles) throws KeycloakClientNotFoundException, NotAllowedRolesException, AccountNotFoundException, AccessDeniedException, JsonProcessingException {
        final String currentPrincipalName = getPrincipalName();
        List<String> principalRoles = getUserRoles(currentPrincipalName);
        if (principalRoles.contains(Roles.ADMIN) && !currentPrincipalName.equals(role.getUsername())) {
            manageRoles(new Role(role.getUsername(), role.getRoles()), userEntity, userEntityRoles);
            final List<String> userRoles = getUserRoles(userEntity.getUsername());
            final String userJson = serializeUser(userEntity, userRoles);
            kafkaTemplate.send(UPDATE_TOPIC_A, userJson);
        } else if (currentPrincipalName.equals(role.getUsername())) {
            manageVolunteerUserRoles(new Role(role.getUsername(), role.getRoles()), userEntity, userEntityRoles);
            final List<String> userRoles = getUserRoles(userEntity.getUsername());
            final String userJson = serializeUser(userEntity, userRoles);
            kafkaTemplate.send(UPDATE_TOPIC_A, userJson);
        } else {
            throw new AccessDeniedException(currentPrincipalName);
        }
    }

    private void manageVolunteerUserRoles(Role role, UserRepresentation userEntity, List<String> userEntityRoles) throws KeycloakClientNotFoundException, NotAllowedRolesException {
        List<String> notAllowedRoles = new ArrayList<>(Arrays.asList(Roles.MANAGER, Roles.MODERATOR, Roles.ADMIN));
        notAllowedRoles.removeAll(userEntityRoles);
        if (!Collections.disjoint(role.getRoles(), notAllowedRoles)) {
            notAllowedRoles.retainAll(role.getRoles());
            throw new NotAllowedRolesException(role.getUsername(), notAllowedRoles);
        }
        manageRoles(role, userEntity, userEntityRoles);
    }

    private void editUserEnableFlag(String editorUsername, boolean flag, UserRepresentation userEntity) throws AccountNotFoundException, SelfAccountActionException, AccessDeniedException, KeycloakClientNotFoundException, JsonProcessingException {
        Collection<? extends GrantedAuthority> authorities = getContext().getAuthentication().getAuthorities();
        final String currentPrincipalName = getPrincipalName();
        boolean isAdmin = authorities.stream().anyMatch(a -> a.getAuthority().equals(ROLE_PREFIX + Roles.ADMIN));
        if (!isAdmin) {
            throw new AccessDeniedException(currentPrincipalName);
        }
        UserRepresentation editor = findAccount(editorUsername);
        throwIfSelfAccountAction(userEntity, editor);
        userEntity.setEnabled(flag);

        final List<String> userRoles = getUserRoles(userEntity.getUsername());
        String userJson = serializeUser(userEntity, userRoles);
        kafkaTemplate.send(UPDATE_TOPIC_A, userJson);
    }

    private void throwIfSelfAccountAction(UserRepresentation editableAccount, UserRepresentation editor) throws SelfAccountActionException {
        if (editableAccount.getId().equals(editor.getId())) {
            throw new SelfAccountActionException(editableAccount.getUsername());
        }
    }

    private void throwIfSameUsername(List<UserRepresentation> users) throws UsernameAlreadyTakenException {
        if (!users.isEmpty()) {
            throw new UsernameAlreadyTakenException();
        }
    }

    private ClientRepresentation findClient(String clientName) throws KeycloakClientNotFoundException {
        keycloakRealmResource = keycloak.realm(keycloakRealm);
        realmClientsResource = keycloakRealmResource.clients();
        Optional<ClientRepresentation> client = realmClientsResource
                .findByClientId(clientName)
                .stream()
                .findFirst();

        return client.orElseThrow(() -> new KeycloakClientNotFoundException(clientName));
    }

    @Override
    public Account register(Account registerAccount) throws KeycloakClientNotFoundException, AccountNotFoundException, EmailAlreadyTakenException, UsernameAlreadyTakenException, JsonProcessingException {
        List<UserRepresentation> usersByEmail = keycloak.realm(keycloakRealm).users().searchByEmail(registerAccount.getEmail(), true);
        throwIfUsersIsNotEmpty(usersByEmail);

        List<UserRepresentation> usersByUsername = keycloak.realm(keycloakRealm)
                .users()
                .searchByUsername(registerAccount.getUsername(), true);

        throwIfSameUsername(usersByUsername);

        UserRepresentation user = new UserRepresentation();
        user.setUsername(registerAccount.getUsername());
        user.setEmail(registerAccount.getEmail());
        user.setFirstName(registerAccount.getFirstName());
        user.setLastName(registerAccount.getLastName());
        user.setEnabled(true);

        CredentialRepresentation passwordCred = new CredentialRepresentation();
        passwordCred.setTemporary(false);
        passwordCred.setType(CredentialRepresentation.PASSWORD);
        passwordCred.setValue(registerAccount.getPassword());
        user.setCredentials(Collections.singletonList(passwordCred));

        Map<String, List<String>> attributes = new HashMap<>();
        attributes.put(LANGUAGE, Collections.singletonList(String.valueOf(registerAccount.getLanguage())));
        user.setAttributes(attributes);

        keycloak.realm(keycloakRealm).users().create(user);
        UserRepresentation userEntity = findAccount(user.getUsername());
        Role role = new Role(user.getUsername(), registerAccount.getRoles());
        manageRoles(role, userEntity, new ArrayList<>());
        final List<String> userRoles = getUserRoles(userEntity.getUsername());
        final String userJson = serializeUser(userEntity, userRoles);
        kafkaTemplate.send(CREATE_TOPIC, userJson);

        return new Account(userEntity.getUsername(),
                userEntity.getFirstName(),
                userEntity.getLastName(),
                userEntity.getEmail(),
                userEntity.isEnabled(),
                userEntity.getAttributes().get(LANGUAGE).get(0),
                userRoles);
    }

    @Override
    public void logout(String username) throws AccountNotFoundException {
        UserRepresentation user = findAccount(username);
        keycloak.realm(keycloakRealm).users().get(user.getId()).logout();
    }

    @Override
    public List<Account> getManagers() throws KeycloakClientNotFoundException, AccountNotFoundException {
        List<UserRepresentation> users;
        users = keycloak.realm(keycloakRealm)
                .users().list();

        List<Account> managers = new ArrayList<>();

        for (UserRepresentation user : users) {
            List<String> userRoles = getUserRoles(user.getUsername());
            if (userRoles.contains(Roles.MANAGER)) {
                managers.add(accountMapper.userRepresentationToAccount(user, userRoles, user.getAttributes().get(LANGUAGE).get(0)));
            }
        }
        return managers;
    }

    @Override
    public void removeAccount(String message) throws AccountNotFoundException, JsonProcessingException {
        Account accountModel = deserializeUser(message);
        final UserRepresentation userRepresentation = findAccount(accountModel.getUsername());

        if (userRepresentation != null) {
            keycloak.realm(keycloakRealm).users().get(userRepresentation.getId()).remove();
        }
    }

    private void updateEnabledStatusIfNeeded(Account account, UserRepresentation userEntity) throws JsonProcessingException, KeycloakClientNotFoundException, AccountNotFoundException {
            userEntity.setEnabled(account.getIsEnabled());
            keycloak.realm(keycloakRealm).users().get(userEntity.getId()).update(userEntity);
            final List<String> userRoles = getUserRoles(userEntity.getUsername());
            final String userJson = serializeUser(userEntity, userRoles);
            kafkaTemplate.send(UPDATE_TOPIC_A, userJson);
    }

    @Override
    public void updateAccount(String message) throws AccountNotFoundException, KeycloakClientNotFoundException, JsonProcessingException {
        Account accountModel = deserializeUser(message);
        UserRepresentation user = findAccount(accountModel.getUsername());
        List<String> roles = getUserRoles(user.getUsername());
        try {
            if (!Objects.equals(user.isEnabled(), accountModel.getIsEnabled())) {
                updateEnabledStatusIfNeeded(accountModel, user);
                user.setEnabled(accountModel.getIsEnabled());
            }
            if (!Objects.equals(user.getAttributes().get(LANGUAGE).get(0), accountModel.getLanguage())) {
                Map<String, List<String>> attributes = new HashMap<>();
                attributes.put(LANGUAGE, Collections.singletonList(String.valueOf(accountModel.getLanguage())));
                user.setAttributes(attributes);
            }
            if (!roles.equals(accountModel.getRoles())) {
                manageRoles(new Role(accountModel.getUsername(), accountModel.getRoles()), user, roles);
            }
        } catch (Exception e) {
            final List<String> userRoles = getUserRoles(accountModel.getUsername());
            final String userJson = serializeUser(user, userRoles);
            kafkaTemplate.send(UPDATE_TOPIC_A, userJson);
        }
    }

    private String getPrincipalName() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}
