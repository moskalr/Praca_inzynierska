package pl.lodz.p.it.socialfridgemicroservice.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import pl.lodz.p.it.socialfridgemicroservice.dto.request.AddSocialFridge;
import pl.lodz.p.it.socialfridgemicroservice.dto.request.UpdateSocialFridge;
import pl.lodz.p.it.socialfridgemicroservice.dto.response.SocialFridgeInfo;
import pl.lodz.p.it.socialfridgemicroservice.dto.response.SocialFridgeStatisticInfo;
import pl.lodz.p.it.socialfridgemicroservice.entity.SocialFridge;
import pl.lodz.p.it.socialfridgemicroservice.model.SocialFridgeModel;
import pl.lodz.p.it.socialfridgemicroservice.model.UpdateSocialFridgeModel;

@Mapper(componentModel = "spring", uses = ProductListMapper.class)
public interface SocialFridgeMapper {
    SocialFridgeInfo socialFridgeToSocialFridgeInfo(SocialFridgeModel socialFridgeModel);

    @Mapping(target = "account.favSocialFridges", ignore = true)
    @Mapping(target = "account.favCategories", ignore = true)
    SocialFridgeModel socialFridgeToSocialFridgeModel(SocialFridge socialFridge);

    SocialFridgeModel addSocialFridgeToSocialFridgeModel(AddSocialFridge addSocialFridge);

    SocialFridgeStatisticInfo socialFridgesModelToStatisticsInfo(SocialFridgeModel socialFridgeModel);

    @Mapping(target = "account", ignore = true)
    @Mapping(target = "products", ignore = true)
    @Mapping(target = "address", ignore = true)
    SocialFridgeModel socialFridgeToSocialFridgeStatistics(SocialFridge socialFridge);

    UpdateSocialFridgeModel updateSocialFridgeToModel(UpdateSocialFridge updateSocialFridge);
}
