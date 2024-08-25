package pl.lodz.p.it.socialfridgemicroservice.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.validation.annotation.Validated;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AddSocialFridge {
    @Valid
    @NotNull
    private AddAddress address;

    @NotBlank
    private String username;
}
