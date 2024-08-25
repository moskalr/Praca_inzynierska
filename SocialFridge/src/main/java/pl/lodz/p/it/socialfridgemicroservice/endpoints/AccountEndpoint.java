package pl.lodz.p.it.socialfridgemicroservice.endpoints;

import com.github.fge.jsonpatch.JsonPatch;
import pl.lodz.p.it.socialfridgemicroservice.dto.response.AccountFavoritesInfo;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@RequestMapping("/accounts")
public interface AccountEndpoint {
    @PatchMapping(consumes = "application/json")
    @PreAuthorize("hasRole(@Roles.USER)")
    ResponseEntity<AccountFavoritesInfo> patchAccount(@RequestBody JsonPatch jsonPatch);

    @GetMapping("/preferences")
    @PreAuthorize("hasRole(@Roles.USER)")
    ResponseEntity<AccountFavoritesInfo> getFavoriteCategoriesAndSocialFridges();
}