package pl.lodz.p.it.socialfridgemicroservice.endpoints.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.github.fge.jsonpatch.JsonPatch;
import com.github.fge.jsonpatch.JsonPatchException;
import pl.lodz.p.it.socialfridgemicroservice.dto.request.AddSocialFridge;
import pl.lodz.p.it.socialfridgemicroservice.dto.request.UpdateSocialFridge;
import pl.lodz.p.it.socialfridgemicroservice.dto.request.UserLocation;
import pl.lodz.p.it.socialfridgemicroservice.dto.response.SocialFridgeInfo;
import pl.lodz.p.it.socialfridgemicroservice.dto.response.SocialFridgeStatisticInfo;
import pl.lodz.p.it.socialfridgemicroservice.endpoints.SocialFridgeEndpoint;
import pl.lodz.p.it.socialfridgemicroservice.enums.SocialFridgeState;
import pl.lodz.p.it.socialfridgemicroservice.exception.CustomResponseStatusException;
import pl.lodz.p.it.socialfridgemicroservice.exception.accountException.AccountNotFoundException;
import pl.lodz.p.it.socialfridgemicroservice.exception.accountException.NotManagerException;
import pl.lodz.p.it.socialfridgemicroservice.exception.addressException.AddressExistException;
import pl.lodz.p.it.socialfridgemicroservice.exception.eTag.OutdatedDataException;
import pl.lodz.p.it.socialfridgemicroservice.exception.gradeException.RatingOutOfRangeException;
import pl.lodz.p.it.socialfridgemicroservice.exception.gradeException.SameRatingUpdateException;
import pl.lodz.p.it.socialfridgemicroservice.exception.socialFridgeException.DeletedSocialFridgeModificationException;
import pl.lodz.p.it.socialfridgemicroservice.exception.socialFridgeException.InactiveSocialFridgeException;
import pl.lodz.p.it.socialfridgemicroservice.exception.socialFridgeException.InvalidDistanceFromSocialFridgeException;
import pl.lodz.p.it.socialfridgemicroservice.exception.socialFridgeException.SocialFridgeNotFoundException;
import pl.lodz.p.it.socialfridgemicroservice.mappers.SocialFridgeMapper;
import pl.lodz.p.it.socialfridgemicroservice.mappers.SocialFridgeStatisticsMapper;
import pl.lodz.p.it.socialfridgemicroservice.model.GradeModel;
import pl.lodz.p.it.socialfridgemicroservice.model.SocialFridgeModel;
import pl.lodz.p.it.socialfridgemicroservice.service.SocialFridgeService;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class SocialFridgeEndpointImpl implements SocialFridgeEndpoint {
    private final SocialFridgeService socialFridgeService;
    private final SocialFridgeMapper socialFridgeMapper;
    private final SocialFridgeStatisticsMapper socialFridgeStatisticsMapper;

    @Override
    public ResponseEntity<List<SocialFridgeInfo>> getAllSocialFridges(List<SocialFridgeState> states) {
        return ResponseEntity.ok(socialFridgeService.getAllSocialFridges(states).stream().map(socialFridgeMapper::socialFridgeToSocialFridgeInfo).toList());
    }

    @Override
    public ResponseEntity<List<SocialFridgeInfo>> getAllManagedSocialFridges(List<SocialFridgeState> states, Pageable pageable) {
        try {
            return ResponseEntity.ok(socialFridgeService.getAllManagedSocialFridges(pageable, states)
                    .stream()
                    .map(socialFridgeMapper::socialFridgeToSocialFridgeInfo)
                    .toList());
        } catch (AccountNotFoundException e) {
            throw new CustomResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e.getKey());
        }
    }

    @Override
    public ResponseEntity<SocialFridgeInfo> getSocialFridge(Long id) {
        try {
            final SocialFridgeModel socialFridgeModel = socialFridgeService.getSocialFridge(id);
            return ResponseEntity.status(HttpStatus.OK).eTag(socialFridgeModel.getETag()).body(socialFridgeMapper.socialFridgeToSocialFridgeInfo(socialFridgeModel));
        } catch (SocialFridgeNotFoundException e) {
            throw new CustomResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e.getKey());
        }
    }

    @Override
    public ResponseEntity<SocialFridgeInfo> addSocialFridge(AddSocialFridge addSocialFridge) {
        try {
            final SocialFridgeModel socialFridgeModel = socialFridgeService.addSocialFridge(socialFridgeMapper.addSocialFridgeToSocialFridgeModel(addSocialFridge));
            return ResponseEntity.ok(socialFridgeMapper.socialFridgeToSocialFridgeInfo(socialFridgeModel));
        } catch (AccountNotFoundException e) {
            throw new CustomResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e.getKey());
        } catch (AddressExistException e) {
            throw new CustomResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e.getKey());
        }
    }

    @Override
    public ResponseEntity<SocialFridgeInfo> patchSocialFridge(Long id, JsonPatch jsonPatch) {
        try {
            final SocialFridgeModel socialFridgeModel = socialFridgeService.patchSocialFridge(id, jsonPatch);
            return ResponseEntity.ok(socialFridgeMapper.socialFridgeToSocialFridgeInfo(socialFridgeModel));
        } catch (SocialFridgeNotFoundException | AccountNotFoundException e) {
            throw new CustomResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e.getKey());
        } catch (SameRatingUpdateException | DeletedSocialFridgeModificationException | InactiveSocialFridgeException |
                 RatingOutOfRangeException | NotManagerException e) {
            throw new CustomResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e.getKey());
        } catch (JsonPatchException | JsonProcessingException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (OutdatedDataException e) {
            throw new CustomResponseStatusException(HttpStatus.PRECONDITION_FAILED, e.getMessage(), e.getKey());
        }
    }

    @Override
    public ResponseEntity<List<SocialFridgeInfo>> getSocialFridgesWithinDistance(UserLocation userLocation) {
        final List<SocialFridgeModel> socialFridgeModel = socialFridgeService.getSocialFridgesWithinDistance(userLocation.getLatitude(),
                userLocation.getLongitude(), userLocation.getMaxDistance());
        return ResponseEntity.ok(socialFridgeModel.stream().map(socialFridgeMapper::socialFridgeToSocialFridgeInfo).toList());
    }

    @Override
    public ResponseEntity<List<SocialFridgeStatisticInfo>> getStatistics(int months) {
        return ResponseEntity.ok(socialFridgeService.getStatistics(months)
                .stream()
                .map(socialFridgeStatisticsMapper::statisticsModelToStatisticsInfo)
                .toList());
    }

    @Override
    public ResponseEntity<Void> sendUpdateSocialFridgeNotification(UpdateSocialFridge updateSocialFridge) {
        try {
            socialFridgeService.sendUpdateSocialFridgeNotification(socialFridgeMapper.updateSocialFridgeToModel(updateSocialFridge));
            return ResponseEntity.noContent().build();
        } catch (SocialFridgeNotFoundException | AccountNotFoundException e) {
            throw new CustomResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e.getKey());
        } catch (MessagingException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (InvalidDistanceFromSocialFridgeException e) {
            throw new CustomResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e.getKey());
        }
    }

    @Override
    public ResponseEntity<Float> getSelfSocialFridgeRating(Long id) {
        try {
            final GradeModel gradeModel = socialFridgeService.getSelfSocialFridgeRating(id);
            return ResponseEntity.status(HttpStatus.OK).eTag(gradeModel.getETag()).body(gradeModel.getRating());
        } catch (SocialFridgeNotFoundException e) {
            throw new CustomResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e.getKey());
        }
    }
}
