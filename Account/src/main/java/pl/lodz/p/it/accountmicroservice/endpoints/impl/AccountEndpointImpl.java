package pl.lodz.p.it.accountmicroservice.endpoints.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.github.fge.jsonpatch.JsonPatch;
import com.github.fge.jsonpatch.JsonPatchException;
import pl.lodz.p.it.accountmicroservice.dto.request.CreateAccountDto;
import pl.lodz.p.it.accountmicroservice.dto.request.EmailActionDto;
import pl.lodz.p.it.accountmicroservice.dto.response.AccountInfoDto;
import pl.lodz.p.it.accountmicroservice.endpoints.AccountEndpoint;
import pl.lodz.p.it.accountmicroservice.mappers.AccountMapper;
import pl.lodz.p.it.accountmicroservice.model.Account;
import pl.lodz.p.it.accountmicroservice.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import pl.lodz.p.it.accountmicroservice.exception.account.*;

import java.net.URI;
import java.security.Principal;
import java.util.List;


@RestController
@RequiredArgsConstructor
public class AccountEndpointImpl implements AccountEndpoint {
    private final AccountService accountService;
    private final AccountMapper accountMapper;
    private static final String ACCOUNTS = " /accounts/";

    @Override
    public ResponseEntity<AccountInfoDto> getSelfAccount(Principal principal) {
        try {
            Account account = accountService.getSelfAccount(principal.getName());
            return ResponseEntity.ok(accountMapper.accountToAccountInfoDto(account));
        } catch (AccountNotFoundException | KeycloakClientNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    @Override
    public ResponseEntity<List<AccountInfoDto>> getUsers(String username) {
        try {
            final List<AccountInfoDto> listOfAccounts = accountService.getUsers(username)
                    .stream()
                    .map(accountMapper::accountToAccountInfoDto)
                    .toList();
            return ResponseEntity.ok(listOfAccounts);
        } catch (AccountNotFoundException | KeycloakClientNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    @Override
    public ResponseEntity<List<AccountInfoDto>> getManagers() {
        try {
            final List<AccountInfoDto> listOfAccounts = accountService.getManagers()
                    .stream()
                    .map(accountMapper::accountToAccountInfoDto)
                    .toList();
            return ResponseEntity.ok(listOfAccounts);
        } catch (AccountNotFoundException | KeycloakClientNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }


    @Override
    public ResponseEntity<AccountInfoDto> register(CreateAccountDto createAccountDto) {
        try {
            Account account = accountService.register(accountMapper.mapToAccount(createAccountDto));
            String uriString = ACCOUNTS + account.getUsername();
            URI location = ServletUriComponentsBuilder.fromCurrentContextPath().path(uriString).build().toUri();
            return ResponseEntity.created(location).body(accountMapper.accountToAccountInfoDto(account));
        } catch (AccountNotFoundException | KeycloakClientNotFoundException | JsonProcessingException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        } catch (EmailAlreadyTakenException | UsernameAlreadyTakenException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage());
        }
    }

    @Override
    public ResponseEntity<Void> changePassword(Principal principal) {
        try {
            Account account = accountService.getSelfAccount(principal.getName());
            accountService.resetPassword(account.getEmail());
            return ResponseEntity.noContent().build();
        } catch (AccountNotFoundByEmailException | AccountNotFoundException | KeycloakClientNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    @Override
    public ResponseEntity<AccountInfoDto> patchAccount(String username, JsonPatch jsonPatch) {
        try {
            Account patchedAccount = accountService.patchAccount(username, jsonPatch);
            return ResponseEntity.ok(accountMapper.accountToAccountInfoDto(patchedAccount));
        } catch (AccountNotFoundException | KeycloakClientNotFoundException | JsonPatchException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        } catch (AccessDeniedException | SelfAccountActionException | NotAllowedRolesException |
                 JsonProcessingException e) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, e.getMessage());
        } catch (EmailAlreadyTakenException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage());
        }
    }

    @Override
    public ResponseEntity<Void> resetPassword(EmailActionDto emailActionDto) {
        try {
            accountService.resetPassword(emailActionDto.getEmail());
            return ResponseEntity.noContent().build();
        } catch (AccountNotFoundByEmailException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }
}