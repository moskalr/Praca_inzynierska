package pl.lodz.p.it.socialfridgemicroservice.dto.response;

import pl.lodz.p.it.socialfridgemicroservice.enums.Category;
import pl.lodz.p.it.socialfridgemicroservice.enums.SocialFridgeState;
import lombok.*;

import java.util.HashMap;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SocialFridgeStatisticInfo {
    private Long id;

    private AddressInfo address;

    private SocialFridgeState state;

    private SocialFridgeAverageRatingInfo socialFridgeAverageRating;

    private int donatedFoodCount;

    private int archivedByUserCount;

    private int archivedBySystemCount;

    private double donatedFoodWeigh;

    private double savedFoodWeigh;

    private double wasteFoodWeigh;

    @Setter(AccessLevel.NONE)
    private Map<Category, Integer> categoryCounts = new HashMap<>();
}
