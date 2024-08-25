package pl.lodz.p.it.accountmicroservice.model;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.ArrayList;
import java.util.List;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Account {
    private static final String EMAIL_PATTERN = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
    private static final String ROLE_PATTERN = "^(CLIENT_USER|CLIENT_ADMIN|CLIENT_VOLUNTEER|CLIENT_MANAGER|CLIENT_MODERATOR)$";
    private static final String PASSWORD_PATTERN = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[!@#$%^&*()_+])(?!.*\\s).{8,}$";
    @NotNull
    @Size(min = 6, max = 16)
    private String username;
    @NotNull
    @Size(max = 32)
    private String firstName;
    @NotNull
    @Size(max = 32)
    private String lastName;
    @NotNull
    @Size(max = 255)
    @Pattern(regexp = EMAIL_PATTERN)
    private String email;
    private Boolean isEnabled;
    @NotNull
    @Pattern(regexp = PASSWORD_PATTERN)
    private String password;
    @NotNull
    private Language language;
    @NotNull
    @Setter(AccessLevel.NONE)
    private List<String> roles= new ArrayList<>();

    public Account(String username, String firstName, String lastName, String email, Boolean isEnabled, String language, List<String> roles) {
        this.username = username;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.isEnabled = isEnabled;
        this.language = Language.valueOf(language);
        this.roles = roles;
    }
}
