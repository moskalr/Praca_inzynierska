package pl.lodz.p.it.accountmicroservice.dto.response;

import pl.lodz.p.it.accountmicroservice.model.Language;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AccountInfoDto {
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private Boolean isEnabled;
    private Language language;
    private List<String> roles;
}
