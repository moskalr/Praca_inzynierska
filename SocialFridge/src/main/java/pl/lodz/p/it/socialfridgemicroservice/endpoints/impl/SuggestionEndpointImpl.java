package pl.lodz.p.it.socialfridgemicroservice.endpoints.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.github.fge.jsonpatch.JsonPatch;
import com.github.fge.jsonpatch.JsonPatchException;
import pl.lodz.p.it.socialfridgemicroservice.dto.request.AddSuggestion;
import pl.lodz.p.it.socialfridgemicroservice.dto.response.SuggestionInfo;
import pl.lodz.p.it.socialfridgemicroservice.endpoints.SuggestionEndpoint;
import pl.lodz.p.it.socialfridgemicroservice.exception.CustomResponseStatusException;
import pl.lodz.p.it.socialfridgemicroservice.exception.accountException.AccountNotFoundException;
import pl.lodz.p.it.socialfridgemicroservice.exception.accountException.NotFridgeManagerException;
import pl.lodz.p.it.socialfridgemicroservice.exception.eTag.OutdatedDataException;
import pl.lodz.p.it.socialfridgemicroservice.exception.socialFridgeException.DeletedSocialFridgeModificationException;
import pl.lodz.p.it.socialfridgemicroservice.exception.socialFridgeException.InactiveSocialFridgeException;
import pl.lodz.p.it.socialfridgemicroservice.exception.socialFridgeException.InvalidDistanceFromSocialFridgeException;
import pl.lodz.p.it.socialfridgemicroservice.exception.socialFridgeException.SocialFridgeNotFoundException;
import pl.lodz.p.it.socialfridgemicroservice.exception.suggestionException.OldSuggestionModificationException;
import pl.lodz.p.it.socialfridgemicroservice.exception.suggestionException.SuggestionNotFoundException;
import pl.lodz.p.it.socialfridgemicroservice.mappers.SuggestionMapper;
import pl.lodz.p.it.socialfridgemicroservice.model.SuggestionModel;
import pl.lodz.p.it.socialfridgemicroservice.service.SuggestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class SuggestionEndpointImpl implements SuggestionEndpoint {
    private final SuggestionService suggestionService;
    private final SuggestionMapper suggestionMapper;

    @Override
    public ResponseEntity<List<SuggestionInfo>> getAllManagedFridgeSuggestions(Pageable pageable, Boolean isNew) {
        try {
            return ResponseEntity.ok(suggestionService.getAllManagedFridgeSuggestions(pageable, isNew)
                    .stream()
                    .map(suggestionMapper::suggestionToSuggestionInfo)
                    .toList());
        } catch (AccountNotFoundException e) {
            throw new CustomResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e.getKey());
        }
    }

    @Override
    public ResponseEntity<SuggestionInfo> addSuggestion(AddSuggestion addSuggestion) {
        try {
            SuggestionModel suggestionModel = suggestionService.addSuggestion(suggestionMapper.addSuggestionToSuggestionModel(addSuggestion), addSuggestion.getLatitude(), addSuggestion.getLongitude());
            return ResponseEntity.ok(suggestionMapper.suggestionToSuggestionInfo(suggestionModel));
        } catch (SocialFridgeNotFoundException e) {
            throw new CustomResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e.getKey());
        } catch (DeletedSocialFridgeModificationException | InactiveSocialFridgeException |
                 InvalidDistanceFromSocialFridgeException e) {
            throw new CustomResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e.getKey());
        }
    }

    @Override
    public ResponseEntity<SuggestionInfo> patchSuggestion(Long id, JsonPatch jsonPatch) {
        try {
            SuggestionModel suggestionModel = suggestionService.patchSuggestion(id, jsonPatch);
            return ResponseEntity.ok(suggestionMapper.suggestionToSuggestionInfo(suggestionModel));
        } catch (SuggestionNotFoundException e) {
            throw new CustomResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e.getKey());
        } catch (OldSuggestionModificationException | NotFridgeManagerException e) {
            throw new CustomResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e.getKey());
        } catch (JsonPatchException | JsonProcessingException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (OutdatedDataException e) {
            throw new CustomResponseStatusException(HttpStatus.PRECONDITION_FAILED, e.getMessage(), e.getKey());
        }
    }
}
