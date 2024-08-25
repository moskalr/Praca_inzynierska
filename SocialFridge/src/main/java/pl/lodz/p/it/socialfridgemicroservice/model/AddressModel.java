package pl.lodz.p.it.socialfridgemicroservice.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AddressModel {
    private Long id;

    private String street;

    private String buildingNumber;

    private String city;

    private String postalCode;

    private String latitude;

    private String longitude;

    private String eTag;
}
