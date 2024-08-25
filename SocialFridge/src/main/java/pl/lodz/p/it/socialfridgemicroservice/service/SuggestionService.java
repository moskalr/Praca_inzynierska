package pl.lodz.p.it.socialfridgemicroservice.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.github.fge.jsonpatch.JsonPatch;
import com.github.fge.jsonpatch.JsonPatchException;
import org.springframework.security.access.prepost.PreAuthorize;
import pl.lodz.p.it.socialfridgemicroservice.exception.accountException.AccountNotFoundException;
import pl.lodz.p.it.socialfridgemicroservice.exception.accountException.NotFridgeManagerException;
import pl.lodz.p.it.socialfridgemicroservice.exception.eTag.OutdatedDataException;
import pl.lodz.p.it.socialfridgemicroservice.exception.socialFridgeException.DeletedSocialFridgeModificationException;
import pl.lodz.p.it.socialfridgemicroservice.exception.socialFridgeException.InactiveSocialFridgeException;
import pl.lodz.p.it.socialfridgemicroservice.exception.socialFridgeException.InvalidDistanceFromSocialFridgeException;
import pl.lodz.p.it.socialfridgemicroservice.exception.socialFridgeException.SocialFridgeNotFoundException;
import pl.lodz.p.it.socialfridgemicroservice.exception.suggestionException.OldSuggestionModificationException;
import pl.lodz.p.it.socialfridgemicroservice.exception.suggestionException.SuggestionNotFoundException;
import pl.lodz.p.it.socialfridgemicroservice.model.SuggestionModel;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface SuggestionService {
    @PreAuthorize("hasRole(@Roles.MANAGER)")
    List<SuggestionModel> getAllManagedFridgeSuggestions(Pageable pageable, Boolean isNew) throws AccountNotFoundException;

    @PreAuthorize("hasRole(@Roles.USER)")
    SuggestionModel addSuggestion(SuggestionModel suggestionModel, String latitude, String longitude) throws DeletedSocialFridgeModificationException, InactiveSocialFridgeException, SocialFridgeNotFoundException, InvalidDistanceFromSocialFridgeException;

    @PreAuthorize("hasRole(@Roles.MANAGER)")
    SuggestionModel patchSuggestion(Long id, JsonPatch jsonPatch) throws JsonProcessingException, JsonPatchException, SuggestionNotFoundException, OldSuggestionModificationException, NotFridgeManagerException, OutdatedDataException;
}
