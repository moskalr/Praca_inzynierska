package pl.lodz.p.it.socialfridgemicroservice.dto.response;

import pl.lodz.p.it.socialfridgemicroservice.enums.Category;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AccountFavoritesInfo {
    @Setter(AccessLevel.NONE)
    private List<SocialFridgeInfo> favSocialFridges = new ArrayList<>();

    @Setter(AccessLevel.NONE)
    private List<Category> favCategories = new ArrayList<>();
}
