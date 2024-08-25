package pl.lodz.p.it.accountmicroservice.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.github.fge.jsonpatch.JsonPatch;
import com.github.fge.jsonpatch.JsonPatchException;
import pl.lodz.p.it.accountmicroservice.model.Account;
import jakarta.annotation.security.PermitAll;
import org.springframework.security.access.prepost.PreAuthorize;
import pl.lodz.p.it.accountmicroservice.exception.account.*;

import java.util.List;

public interface AccountService {
    @PreAuthorize("hasRole(@Roles.ADMIN) or hasRole(@Roles.USER) or hasRole(@Roles.MANAGER) or hasRole(@Roles.MODERATOR) or hasRole(@Roles.VOLUNTEER)")
    Account getSelfAccount(String username) throws AccountNotFoundException, KeycloakClientNotFoundException;

    @PreAuthorize("hasRole(@Roles.ADMIN)")
    List<Account> getUsers(String username) throws KeycloakClientNotFoundException, AccountNotFoundException;

    @PermitAll
    Account register(Account registerAccount) throws KeycloakClientNotFoundException, AccountNotFoundException, EmailAlreadyTakenException, UsernameAlreadyTakenException, JsonProcessingException;

    @PreAuthorize("hasRole(@Roles.ADMIN) or hasRole(@Roles.USER) or hasRole(@Roles.MANAGER) or hasRole(@Roles.MODERATOR) or hasRole(@Roles.VOLUNTEER)")
    Account patchAccount(String username, JsonPatch jsonPatch) throws AccountNotFoundException, KeycloakClientNotFoundException, JsonPatchException, AccessDeniedException, EmailAlreadyTakenException, SelfAccountActionException, NotAllowedRolesException, JsonProcessingException;

    void resetPassword(String email) throws AccountNotFoundByEmailException;

    void logout(String username) throws AccountNotFoundException;

    List<Account> getManagers() throws KeycloakClientNotFoundException, AccountNotFoundException;

    void removeAccount(String message) throws AccountNotFoundException, JsonProcessingException;

    void updateAccount(String message) throws AccountNotFoundException, KeycloakClientNotFoundException, JsonProcessingException;

}