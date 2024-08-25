package pl.lodz.p.it.socialfridgemicroservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserLocation {
    private static final String COORDINATE_PATTERN = "^-?\\d{1,3}(\\.\\d+)?$";

    @Pattern(regexp = COORDINATE_PATTERN)
    @NotBlank
    private String latitude;

    @Pattern(regexp = COORDINATE_PATTERN)
    @NotBlank
    private String longitude;

    @NotNull
    private Double maxDistance;
}