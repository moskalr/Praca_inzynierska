package pl.lodz.p.it.socialfridgemicroservice.model;

import pl.lodz.p.it.socialfridgemicroservice.enums.Category;
import pl.lodz.p.it.socialfridgemicroservice.enums.SocialFridgeState;
import lombok.*;

import java.util.HashMap;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SocialFridgeStatisticModel {
    private Long id;

    private AddressModel address;

    private SocialFridgeState state;

    private SocialFridgeAverageRatingModel socialFridgeAverageRating;

    private int donatedFoodCount;

    private int archivedByUserCount;

    private int archivedBySystemCount;

    private double donatedFoodWeigh;

    private double savedFoodWeigh;

    private double wasteFoodWeigh;

    @Setter(AccessLevel.NONE)
    private Map<Category, Integer> categoryCounts = new HashMap<>();
}
