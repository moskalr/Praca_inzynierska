package pl.lodz.p.it.socialfridgemicroservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AccountInfo {
    private Long id;

    private String username;

    private String firstName;

    private String lastName;

    private String email;
}
