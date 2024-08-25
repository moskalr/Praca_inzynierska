package pl.lodz.p.it.socialfridgemicroservice.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.github.fge.jsonpatch.JsonPatch;
import com.github.fge.jsonpatch.JsonPatchException;
import jakarta.annotation.security.PermitAll;
import org.springframework.security.access.prepost.PreAuthorize;
import pl.lodz.p.it.socialfridgemicroservice.exception.accountException.AccountNotFoundException;
import pl.lodz.p.it.socialfridgemicroservice.exception.eTag.OutdatedDataException;
import pl.lodz.p.it.socialfridgemicroservice.exception.socialFridgeException.DeletedSocialFridgeModificationException;
import pl.lodz.p.it.socialfridgemicroservice.exception.socialFridgeException.InactiveSocialFridgeException;
import pl.lodz.p.it.socialfridgemicroservice.exception.socialFridgeException.SocialFridgeNotFoundException;
import pl.lodz.p.it.socialfridgemicroservice.model.AccountModel;

public interface AccountService {
    @PreAuthorize("hasRole(@Roles.USER)")
    AccountModel patchAccount(JsonPatch jsonPatch) throws AccountNotFoundException, JsonProcessingException, JsonPatchException, DeletedSocialFridgeModificationException, InactiveSocialFridgeException, SocialFridgeNotFoundException, OutdatedDataException;

    @PreAuthorize("hasRole(@Roles.USER)")
    AccountModel getOwnAccount() throws AccountNotFoundException;

    @PermitAll
    void createAccount(String message) throws JsonProcessingException;

    @PermitAll
    void removeAccount(String message) throws AccountNotFoundException, JsonProcessingException;

    @PermitAll
    void updateAccount(String message) throws AccountNotFoundException, JsonProcessingException;
}