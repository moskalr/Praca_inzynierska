package pl.lodz.p.it.socialfridgemicroservice.dto.response;

import pl.lodz.p.it.socialfridgemicroservice.enums.SocialFridgeState;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SocialFridgeInfo {
    private Long id;

    @Setter(AccessLevel.NONE)
    private List<ProductListInfo> products = new ArrayList<>();

    private SocialFridgeState state;

    private SocialFridgeAverageRatingInfo socialFridgeAverageRating;

    private AddressInfo address;

    private AccountInfo account;

}
