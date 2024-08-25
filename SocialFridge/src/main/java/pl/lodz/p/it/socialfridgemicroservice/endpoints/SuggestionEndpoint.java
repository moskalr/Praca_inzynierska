package pl.lodz.p.it.socialfridgemicroservice.endpoints;

import com.github.fge.jsonpatch.JsonPatch;
import pl.lodz.p.it.socialfridgemicroservice.dto.request.AddSuggestion;
import pl.lodz.p.it.socialfridgemicroservice.dto.response.SuggestionInfo;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/suggestions")
public interface SuggestionEndpoint {
    @GetMapping
    @PreAuthorize("hasRole(@Roles.MANAGER)")
    ResponseEntity<List<SuggestionInfo>> getAllManagedFridgeSuggestions(Pageable pageable, @RequestParam Boolean isNew);

    @PostMapping
    @PreAuthorize("hasRole(@Roles.USER)")
    ResponseEntity<SuggestionInfo> addSuggestion(@Validated @RequestBody AddSuggestion addSuggestion);

    @PatchMapping(path = "/{id}", consumes = "application/json")
    @PreAuthorize("hasRole(@Roles.MANAGER)")
    ResponseEntity<SuggestionInfo> patchSuggestion(@PathVariable("id") Long id, @RequestBody JsonPatch jsonPatch);
}
