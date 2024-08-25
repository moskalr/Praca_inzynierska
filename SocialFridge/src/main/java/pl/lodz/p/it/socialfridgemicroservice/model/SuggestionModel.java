package pl.lodz.p.it.socialfridgemicroservice.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SuggestionModel {
    private Long id;

    private SocialFridgeModel socialFridge;

    private String description;

    private Boolean isNew;

    private Long socialFridgeId;

    private String image;

    private String eTag;
}
