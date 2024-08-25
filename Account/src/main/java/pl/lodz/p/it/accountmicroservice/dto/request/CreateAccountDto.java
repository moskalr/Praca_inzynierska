package pl.lodz.p.it.accountmicroservice.dto.request;

import pl.lodz.p.it.accountmicroservice.model.Language;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateAccountDto {
    private static final String EMAIL_PATTERN = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
    private static final String PASSWORD_PATTERN =
            "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[!@#$%^&*()_+])(?!.*\\s).{8,}$";
    private static final String ROLE_PATTERN = "^(CLIENT_USER|CLIENT_VOLUNTEER)$";
    @NotNull
    @Size(min = 6, max = 16)
    private String username;
    @NotNull
    @Size(max = 255)
    @Pattern(regexp = EMAIL_PATTERN)
    private String email;
    @NotNull
    @Size(max = 32)
    private String firstName;
    @NotNull
    @Size(max = 32)
    private String lastName;
    @NotNull
    @Pattern(regexp = PASSWORD_PATTERN)
    private String password;
    @NotNull
    private Language language;
    @NotNull
    @Pattern(regexp = ROLE_PATTERN)
    private String role;
}
