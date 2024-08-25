package pl.lodz.p.it.socialfridgemicroservice.endpoints;


import com.github.fge.jsonpatch.JsonPatch;
import jakarta.annotation.security.PermitAll;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import pl.lodz.p.it.socialfridgemicroservice.dto.request.AddSocialFridge;
import pl.lodz.p.it.socialfridgemicroservice.dto.request.UpdateSocialFridge;
import pl.lodz.p.it.socialfridgemicroservice.dto.request.UserLocation;
import pl.lodz.p.it.socialfridgemicroservice.dto.response.SocialFridgeInfo;
import pl.lodz.p.it.socialfridgemicroservice.dto.response.SocialFridgeStatisticInfo;
import pl.lodz.p.it.socialfridgemicroservice.enums.SocialFridgeState;

import java.util.List;

@RequestMapping("/fridges")
public interface SocialFridgeEndpoint {

    @GetMapping
    @PermitAll
    ResponseEntity<List<SocialFridgeInfo>> getAllSocialFridges(@RequestParam List<SocialFridgeState> states);

    @GetMapping("/managed-social-fridges")
    @PreAuthorize("hasRole(@Roles.MANAGER)")
    ResponseEntity<List<SocialFridgeInfo>> getAllManagedSocialFridges(@RequestParam List<SocialFridgeState> states, Pageable pageable);

    @GetMapping("/{id}")
    @PermitAll
    ResponseEntity<SocialFridgeInfo> getSocialFridge(@PathVariable Long id);

    @PostMapping
    @PreAuthorize("hasRole(@Roles.MANAGER)")
    ResponseEntity<SocialFridgeInfo> addSocialFridge(@Validated @RequestBody AddSocialFridge addSocialFridge);

    @PatchMapping(path = "/{id}", consumes = "application/json")
    @PreAuthorize("hasRole(@Roles.USER) or hasRole(@Roles.MANAGER)")
    ResponseEntity<SocialFridgeInfo> patchSocialFridge(@PathVariable("id") Long id, @RequestBody JsonPatch jsonPatch);

    @GetMapping("/area")
    @PermitAll
    ResponseEntity<List<SocialFridgeInfo>> getSocialFridgesWithinDistance(@Validated UserLocation userLocation);

    @GetMapping("/statistics")
    @PermitAll
    ResponseEntity<List<SocialFridgeStatisticInfo>> getStatistics(@RequestParam int months);

    @PutMapping("/notifications")
    @PreAuthorize("hasRole(@Roles.USER)")
    ResponseEntity<Void> sendUpdateSocialFridgeNotification(@Validated @RequestBody UpdateSocialFridge updateSocialFridge);

    @GetMapping("/{id}/my-rating")
    @PreAuthorize("hasRole(@Roles.USER)")
    ResponseEntity<Float> getSelfSocialFridgeRating(@PathVariable("id") Long id);
}
