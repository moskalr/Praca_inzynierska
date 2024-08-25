package pl.lodz.p.it.socialfridgemicroservice.entity;

import pl.lodz.p.it.socialfridgemicroservice.common.AbstractEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Entity
public class Address extends AbstractEntity {
    private static final String POSTAL_CODE_PATTERN = "^\\d{2}-\\d{3}$";

    private static final String BUILDING_NUMBER_PATTERN = "^\\d+(\\/\\d+)?[A-Za-z]?$";

    private static final String COORDINATE_PATTERN = "^-?\\d{1,3}(\\.\\d+)?$";

    @Column(nullable = false, length = 64)
    private String street;

    @Pattern(regexp = BUILDING_NUMBER_PATTERN)
    @Column(nullable = false, name = "building_number")
    private String buildingNumber;

    @Column(nullable = false, length = 64)
    private String city;

    @Pattern(regexp = POSTAL_CODE_PATTERN)
    @Column(nullable = false, length = 6, name = "postal_code")
    private String postalCode;

    @Pattern(regexp = COORDINATE_PATTERN)
    @Column(nullable = false)
    private String latitude;

    @Pattern(regexp = COORDINATE_PATTERN)
    @Column(nullable = false)
    private String longitude;
}