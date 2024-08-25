package pl.lodz.p.it.accountmicroservice.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SelfRoleChangeDto {
    private static final String ROLE_PATTERN = "^(CLIENT_USER|CLIENT_VOLUNTEER)$";
    @NotNull
    @Pattern(regexp = ROLE_PATTERN)
    private String role;
}
