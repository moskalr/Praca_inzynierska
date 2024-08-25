package pl.lodz.p.it.socialfridgemicroservice.model;

import pl.lodz.p.it.socialfridgemicroservice.enums.SocialFridgeState;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SocialFridgeModel {
    private Long id;

    @Setter(AccessLevel.NONE)
    private List<ProductModel> products = new ArrayList<>();

    private AddressModel address;

    private SocialFridgeState state;

    private AccountModel account;

    private SocialFridgeAverageRatingModel socialFridgeAverageRating;

    private String username;

    private float rating;

    private String eTag;
}
