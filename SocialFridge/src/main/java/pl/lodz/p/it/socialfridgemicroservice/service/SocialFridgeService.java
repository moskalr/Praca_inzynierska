package pl.lodz.p.it.socialfridgemicroservice.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.github.fge.jsonpatch.JsonPatch;
import com.github.fge.jsonpatch.JsonPatchException;
import org.springframework.security.access.prepost.PreAuthorize;
import pl.lodz.p.it.socialfridgemicroservice.enums.SocialFridgeState;
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
import pl.lodz.p.it.socialfridgemicroservice.model.GradeModel;
import pl.lodz.p.it.socialfridgemicroservice.model.SocialFridgeModel;
import pl.lodz.p.it.socialfridgemicroservice.model.SocialFridgeStatisticModel;
import pl.lodz.p.it.socialfridgemicroservice.model.UpdateSocialFridgeModel;
import jakarta.annotation.security.PermitAll;
import jakarta.mail.MessagingException;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface SocialFridgeService {
    @PermitAll
    SocialFridgeModel getSocialFridge(Long id) throws SocialFridgeNotFoundException;

    @PermitAll
    List<SocialFridgeModel> getAllSocialFridges(List<SocialFridgeState> states);

    @PreAuthorize("hasRole(@Roles.MANAGER)")
    SocialFridgeModel addSocialFridge(SocialFridgeModel socialFridgeModel) throws AccountNotFoundException, AddressExistException;

    @PreAuthorize("hasRole(@Roles.USER) or hasRole(@Roles.MANAGER)")
    SocialFridgeModel patchSocialFridge(Long id, JsonPatch jsonPatch) throws SocialFridgeNotFoundException, JsonPatchException, SameRatingUpdateException, InactiveSocialFridgeException, JsonProcessingException, RatingOutOfRangeException, DeletedSocialFridgeModificationException, NotManagerException, AccountNotFoundException, OutdatedDataException;

    @PermitAll
    List<SocialFridgeModel> getSocialFridgesWithinDistance(String latitude, String longitude, Double maxDistance);

    @PermitAll
    List<SocialFridgeStatisticModel> getStatistics(int months);

    @PreAuthorize("hasRole(@Roles.USER)")
    void sendUpdateSocialFridgeNotification(UpdateSocialFridgeModel updateSocialFridgeModel) throws SocialFridgeNotFoundException, MessagingException, InvalidDistanceFromSocialFridgeException, AccountNotFoundException;

    @PreAuthorize("hasRole(@Roles.MANAGER)")
    List<SocialFridgeModel> getAllManagedSocialFridges(Pageable pageable, List<SocialFridgeState> states) throws AccountNotFoundException;

    @PreAuthorize("hasRole(@Roles.USER)")
    GradeModel getSelfSocialFridgeRating(Long id) throws SocialFridgeNotFoundException;
}
