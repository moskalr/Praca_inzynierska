package pl.lodz.p.it.socialfridgemicroservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SuggestionInfo {
    private Long id;

    private SocialFridgeInfo socialFridge;

    private String description;

    private Boolean isNew;

    private String image;

    private String eTag;
}
