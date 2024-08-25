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
public class UpdateAddress {
    private static final String POSTAL_CODE_PATTERN = "^\\d{2}-\\d{3}$";

    private static final String BUILDING_NUMBER_PATTERN = "^\\d+(\\/\\d+)?[A-Za-z]?$";

    private static final String COORDINATE_PATTERN = "^-?\\d{1,3}(\\.\\d+)?$";

    @NotNull
    private Long id;

    @Size(max = 64)
    @NotBlank
    private String street;

    @Pattern(regexp = BUILDING_NUMBER_PATTERN)
    @NotBlank
    private String buildingNumber;

    @Size(max = 64)
    @NotBlank
    private String city;

    @Pattern(regexp = POSTAL_CODE_PATTERN)
    @NotBlank
    private String postalCode;

    @Pattern(regexp = COORDINATE_PATTERN)
    @NotBlank
    private String latitude;

    @Pattern(regexp = COORDINATE_PATTERN)
    @NotBlank
    private String longitude;
}