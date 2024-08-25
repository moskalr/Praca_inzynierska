package pl.lodz.p.it.accountmicroservice.endpoints;

import com.github.fge.jsonpatch.JsonPatch;
import com.github.fge.jsonpatch.JsonPatchException;
import pl.lodz.p.it.accountmicroservice.dto.request.CreateAccountDto;
import pl.lodz.p.it.accountmicroservice.dto.request.EmailActionDto;
import pl.lodz.p.it.accountmicroservice.dto.response.AccountInfoDto;
import java.io.IOException;
import java.security.Principal;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import pl.lodz.p.it.accountmicroservice.exception.account.*;


@RequestMapping("/accounts")
public interface AccountEndpoint {
    @GetMapping("/_self")
    @PreAuthorize("hasRole(@Roles.ADMIN) or hasRole(@Roles.USER) or hasRole(@Roles.MANAGER) or hasRole(@Roles.MODERATOR) or hasRole(@Roles.VOLUNTEER)")
    ResponseEntity<AccountInfoDto> getSelfAccount(Principal principal);

    @GetMapping
    @PreAuthorize("hasRole(@Roles.ADMIN)")
    ResponseEntity<List<AccountInfoDto>> getUsers(@RequestParam(name = "username", required = false) String username);

    @GetMapping("/managers")
    @PreAuthorize("hasRole(@Roles.MANAGER)")
    ResponseEntity<List<AccountInfoDto>> getManagers();

    @PostMapping("/password")
    @PreAuthorize("hasRole(@Roles.ADMIN) or hasRole(@Roles.USER) or hasRole(@Roles.MANAGER) or hasRole(@Roles.MODERATOR) or hasRole(@Roles.VOLUNTEER)")
    ResponseEntity<Void> changePassword(Principal principal);

    @PostMapping("/reset-password")
    ResponseEntity<Void> resetPassword(@RequestBody @Validated EmailActionDto emailActionDto);

    @PostMapping
    ResponseEntity<AccountInfoDto> register(@RequestBody @Validated CreateAccountDto createAccountDto);

    @PatchMapping(path = "/{username}", consumes = "application/json")
    @PreAuthorize("hasRole(@Roles.ADMIN) or hasRole(@Roles.USER) or hasRole(@Roles.MANAGER) or hasRole(@Roles.MODERATOR) or hasRole(@Roles.VOLUNTEER)")
    ResponseEntity<AccountInfoDto> patchAccount(@PathVariable("username") String username, @RequestBody JsonPatch jsonPatch) throws IOException, JsonPatchException, KeycloakClientNotFoundException, AccountNotFoundException, AccountAlreadyEnabledException, AccountAlreadyDisabledException, SameEmailsException, EmailAlreadyTakenException, SelfAccountActionException, AccountHasNoRolesException, LanguageIsAlreadyInUseException, AccountHasRolesException, NotAllowedRolesException, AccessDeniedException;
}
