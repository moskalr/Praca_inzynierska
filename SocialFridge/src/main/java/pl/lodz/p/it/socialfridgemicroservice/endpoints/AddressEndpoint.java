package pl.lodz.p.it.socialfridgemicroservice.endpoints;

import pl.lodz.p.it.socialfridgemicroservice.dto.request.UpdateAddress;
import pl.lodz.p.it.socialfridgemicroservice.dto.response.AddressInfo;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/addresses")
public interface AddressEndpoint {

    @GetMapping("/{id}")
    @PreAuthorize("hasRole(@Roles.MANAGER)")
    ResponseEntity<AddressInfo> getAddress(@PathVariable("id") Long id);

    @PutMapping
    @PreAuthorize("hasRole(@Roles.MANAGER)")
    ResponseEntity<AddressInfo> updateAddress(@Validated @RequestBody UpdateAddress updateAddress);
}
