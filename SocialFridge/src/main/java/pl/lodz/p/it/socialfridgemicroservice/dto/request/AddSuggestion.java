package pl.lodz.p.it.socialfridgemicroservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AddSuggestion {
    private static final String COORDINATE_PATTERN = "^-?\\d{1,3}(\\.\\d+)?$";

    @NotNull
    private Long socialFridgeId;

    @NotBlank
    @Size(min = 10, max = 2000)
    private String description;

    @NotBlank
    @Pattern(regexp = COORDINATE_PATTERN)
    private String latitude;

    @NotBlank
    @Pattern(regexp = COORDINATE_PATTERN)
    private String longitude;

    private String image;
}
