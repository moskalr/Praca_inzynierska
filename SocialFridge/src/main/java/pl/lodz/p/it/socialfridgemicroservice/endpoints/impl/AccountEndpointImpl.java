package pl.lodz.p.it.socialfridgemicroservice.endpoints.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.github.fge.jsonpatch.JsonPatch;
import com.github.fge.jsonpatch.JsonPatchException;
import pl.lodz.p.it.socialfridgemicroservice.dto.response.AccountFavoritesInfo;
import pl.lodz.p.it.socialfridgemicroservice.endpoints.AccountEndpoint;
import pl.lodz.p.it.socialfridgemicroservice.exception.CustomResponseStatusException;
import pl.lodz.p.it.socialfridgemicroservice.exception.accountException.AccountNotFoundException;
import pl.lodz.p.it.socialfridgemicroservice.exception.eTag.OutdatedDataException;
import pl.lodz.p.it.socialfridgemicroservice.exception.socialFridgeException.DeletedSocialFridgeModificationException;
import pl.lodz.p.it.socialfridgemicroservice.exception.socialFridgeException.InactiveSocialFridgeException;
import pl.lodz.p.it.socialfridgemicroservice.exception.socialFridgeException.SocialFridgeNotFoundException;
import pl.lodz.p.it.socialfridgemicroservice.mappers.AccountMapper;
import pl.lodz.p.it.socialfridgemicroservice.model.AccountModel;
import pl.lodz.p.it.socialfridgemicroservice.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequiredArgsConstructor
public class AccountEndpointImpl implements AccountEndpoint {
    private final AccountService accountService;
    private final AccountMapper accountMapper;

    @Override
    public ResponseEntity<AccountFavoritesInfo> patchAccount(JsonPatch jsonPatch) {
        try {
            AccountModel accountModel = accountService.patchAccount(jsonPatch);
            return ResponseEntity.ok(accountMapper.accountModelToAccountFavoritesInfo(accountModel));
        } catch (AccountNotFoundException | SocialFridgeNotFoundException e) {
            throw new CustomResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e.getKey());
        } catch (DeletedSocialFridgeModificationException | InactiveSocialFridgeException e) {
            throw new CustomResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e.getKey());
        } catch (JsonPatchException | JsonProcessingException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (OutdatedDataException e) {
            throw new CustomResponseStatusException(HttpStatus.PRECONDITION_FAILED, e.getMessage(), e.getKey());
        }
    }

    @Override
    public ResponseEntity<AccountFavoritesInfo> getFavoriteCategoriesAndSocialFridges() {
        try {
            AccountModel accountModel = accountService.getOwnAccount();
            return ResponseEntity.status(HttpStatus.OK).eTag(accountModel.getETag()).body(accountMapper.accountModelToAccountFavoritesInfo(accountModel));

        } catch (AccountNotFoundException e) {
            throw new CustomResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e.getKey());
        }
    }
}