package pl.lodz.p.it.socialfridgemicroservice.mappers;

import pl.lodz.p.it.socialfridgemicroservice.dto.response.SocialFridgeInfo;
import pl.lodz.p.it.socialfridgemicroservice.entity.SocialFridge;
import pl.lodz.p.it.socialfridgemicroservice.model.SocialFridgeModel;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface FavSocialFridgeListMapper {
    SocialFridgeInfo socialFridgeToSocialFridgeInfo(SocialFridgeModel socialFridgeModel);

    @Mapping(target = "products", ignore = true)
    @Mapping(target = "account.favSocialFridges", ignore = true)
    @Mapping(target = "account.favCategories", ignore = true)
    SocialFridgeModel socialFridgeToSocialFridgeModel(SocialFridge socialFridge);
}