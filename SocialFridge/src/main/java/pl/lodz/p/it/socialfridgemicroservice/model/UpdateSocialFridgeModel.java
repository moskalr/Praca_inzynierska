package pl.lodz.p.it.socialfridgemicroservice.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateSocialFridgeModel {
    private List<Long> products;

    private String image;

    private String description;

    private Long socialFridgeId;

    private String latitude;

    private String longitude;
}
