package pl.lodz.p.it.accountmicroservice.endpoints;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.security.Principal;

@RequestMapping("/auth")
public interface AuthEndpoint {
    @PostMapping("/logout")
    @PreAuthorize("hasRole(@Roles.ADMIN) or hasRole(@Roles.USER) or hasRole(@Roles.MANAGER) or hasRole(@Roles.MODERATOR) or hasRole(@Roles.VOLUNTEER)")
    ResponseEntity<Void> logout(Principal principal);
}
