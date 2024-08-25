package pl.lodz.p.it.accountmicroservice.endpoints.impl;

import pl.lodz.p.it.accountmicroservice.endpoints.AuthEndpoint;
import pl.lodz.p.it.accountmicroservice.exception.account.AccountNotFoundException;
import pl.lodz.p.it.accountmicroservice.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;

@RestController
@RequiredArgsConstructor
public class AuthEndpointImpl implements AuthEndpoint {
    private final AccountService accountService;

    @Override
    public ResponseEntity<Void> logout(Principal principal) {
        try {
            accountService.logout(principal.getName());
            return ResponseEntity.noContent().build();
        } catch (AccountNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }
}
