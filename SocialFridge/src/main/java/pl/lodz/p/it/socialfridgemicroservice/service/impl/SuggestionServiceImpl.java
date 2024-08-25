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
import pl.lodz.p.it.socialfridgemicroservice.entity.Suggestion;
import pl.lodz.p.it.socialfridgemicroservice.enums.SocialFridgeState;
import pl.lodz.p.it.socialfridgemicroservice.exception.AppBaseException;
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
import pl.lodz.p.it.socialfridgemicroservice.repository.AccountRepository;
import pl.lodz.p.it.socialfridgemicroservice.repository.SocialFridgeRepository;
import pl.lodz.p.it.socialfridgemicroservice.repository.SuggestionRepository;
import pl.lodz.p.it.socialfridgemicroservice.service.SuggestionService;
import pl.lodz.p.it.socialfridgemicroservice.utils.eTag.ETagCalculator;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Point;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.lodz.p.it.socialfridgemicroservice.utils.GeometryUtils;

import java.util.List;
import java.util.Objects;

import static org.keycloak.util.JsonSerialization.mapper;

@Service
@RequiredArgsConstructor
public class SuggestionServiceImpl implements SuggestionService {
    private static final double DEGREES_PER_M = 111000.0;
    private static final double DISTANCE = 50.0;
    private final SuggestionRepository suggestionRepository;
    private final SuggestionMapper suggestionMapper;
    private final SocialFridgeRepository socialFridgeRepository;
    private final ObjectMapper objectMapper;
    private final AccountRepository accountRepository;
    private final ETagCalculator eTagCalculator;

    @Override
    public List<SuggestionModel> getAllManagedFridgeSuggestions(Pageable pageable, Boolean isNew) throws AccountNotFoundException {
        final String currentPrincipalName = SecurityContextHolder.getContext().getAuthentication().getName();

        final Account account = accountRepository.findByUsername(currentPrincipalName).orElseThrow(
                () -> new AccountNotFoundException(currentPrincipalName)
        );

        return suggestionRepository.findSuggestionsForCurrentUser(account.getId(), pageable, isNew)
                .stream()
                .map(suggestion -> {
                    final SuggestionModel suggestionModel = suggestionMapper.suggestionToSuggestionModel(suggestion);
                    suggestionModel.setETag(eTagCalculator.calculateETagForEntity(suggestion).getValue());
                    return suggestionModel;
                })
                .toList();
    }

    @Override
    @Transactional(
            propagation = Propagation.REQUIRED,
            isolation = Isolation.READ_COMMITTED,
            rollbackFor = AppBaseException.class,
            transactionManager = "fridgeTransactionManager")
    public SuggestionModel addSuggestion(SuggestionModel suggestionModel, String latitude, String longitude) throws DeletedSocialFridgeModificationException, InactiveSocialFridgeException, SocialFridgeNotFoundException, InvalidDistanceFromSocialFridgeException {
        final SocialFridge socialFridge = socialFridgeRepository.findById(suggestionModel.getSocialFridgeId()).orElseThrow(
                () -> new SocialFridgeNotFoundException(suggestionModel.getSocialFridgeId())
        );

        throwIfArchive(socialFridge.getState(), socialFridge.getId());
        throwIfInactive(socialFridge.getState(), socialFridge.getId());

        final Point productPoint = GeometryUtils.createPoint(latitude, longitude);
        final Point fridgePoint = GeometryUtils.createPoint(socialFridge.getAddress().getLatitude(), socialFridge.getAddress().getLongitude());
        throwIfInvalidDistance(productPoint, fridgePoint, suggestionModel.getSocialFridgeId());

        final Suggestion suggestion = new Suggestion(socialFridge, suggestionModel.getDescription(), true, suggestionModel.getImage());
        suggestionRepository.save(suggestion);
        return suggestionMapper.suggestionToSuggestionModel(suggestion);
    }

    private void throwIfInvalidDistance(Point productPoint, Point fridgePoint, Long id) throws InvalidDistanceFromSocialFridgeException {
        if (productPoint.distance(fridgePoint) > DISTANCE / DEGREES_PER_M) {
            throw new InvalidDistanceFromSocialFridgeException(id);
        }
    }

    @Override
    @Transactional(
            propagation = Propagation.REQUIRED,
            isolation = Isolation.READ_COMMITTED,
            rollbackFor = AppBaseException.class,
            transactionManager = "fridgeTransactionManager")
    public SuggestionModel patchSuggestion(Long id, JsonPatch jsonPatch) throws JsonProcessingException, JsonPatchException, SuggestionNotFoundException, OldSuggestionModificationException, NotFridgeManagerException, OutdatedDataException {
        final Suggestion suggestion = suggestionRepository.findById(id).orElseThrow(
                () -> new SuggestionNotFoundException(id)
        );

        if (!eTagCalculator.verifyProvidedETag(suggestion)) {
            throw new OutdatedDataException();
        }

        SuggestionModel patchedSuggestionModel = suggestionMapper.suggestionToSuggestionModel(suggestion);
        String originalJson = objectMapper.writeValueAsString(patchedSuggestionModel);
        JsonNode patchedNode = jsonPatch.apply(mapper.readTree(originalJson));
        patchedSuggestionModel = objectMapper.treeToValue(patchedNode, SuggestionModel.class);

        return checkUpdateLogicBusiness(patchedSuggestionModel, suggestion);
    }

    SuggestionModel checkUpdateLogicBusiness(SuggestionModel patchedSuggestionModel, Suggestion suggestion) throws OldSuggestionModificationException, NotFridgeManagerException {
        if (!patchedSuggestionModel.getIsNew().equals(suggestion.getIsNew())) {
            throwIfOldSuggestionModification(patchedSuggestionModel, suggestion);
            throwIfNotFridgeManager(suggestion);

            return updateIsNewStatusOfProduct(suggestion);
        }

        return suggestionMapper.suggestionToSuggestionModel(suggestion);
    }

    private SuggestionModel updateIsNewStatusOfProduct(Suggestion suggestion) {
        suggestion.setIsNew(false);
        suggestionRepository.save(suggestion);
        return suggestionMapper.suggestionToSuggestionModel(suggestion);
    }

    private void throwIfArchive(SocialFridgeState state, Long id) throws DeletedSocialFridgeModificationException {
        if (SocialFridgeState.ARCHIVED.equals(state)) {
            throw new DeletedSocialFridgeModificationException(id);
        }
    }

    private void throwIfInactive(SocialFridgeState state, Long id) throws InactiveSocialFridgeException {
        if (SocialFridgeState.INACTIVE.equals(state)) {
            throw new InactiveSocialFridgeException(id);
        }
    }

    private void throwIfOldSuggestionModification(SuggestionModel patchedSuggestionModel, Suggestion suggestion) throws OldSuggestionModificationException {
        if (!patchedSuggestionModel.getIsNew().equals(suggestion.getIsNew()) &&
                Boolean.TRUE.equals(patchedSuggestionModel.getIsNew())) {
            throw new OldSuggestionModificationException(suggestion.getId());
        }
    }

    private void throwIfNotFridgeManager(Suggestion suggestion) throws NotFridgeManagerException {
        final String currentPrincipalName = SecurityContextHolder.getContext().getAuthentication().getName();

        if (!Objects.equals(suggestion.getSocialFridge().getAccount().getUsername(), currentPrincipalName)) {
            throw new NotFridgeManagerException(currentPrincipalName);
        }
    }
}
