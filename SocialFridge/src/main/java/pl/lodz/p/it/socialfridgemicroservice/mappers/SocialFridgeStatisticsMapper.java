package pl.lodz.p.it.socialfridgemicroservice.mappers;

import pl.lodz.p.it.socialfridgemicroservice.dto.response.SocialFridgeStatisticInfo;
import pl.lodz.p.it.socialfridgemicroservice.model.SocialFridgeStatisticModel;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface SocialFridgeStatisticsMapper {
    SocialFridgeStatisticInfo statisticsModelToStatisticsInfo(SocialFridgeStatisticModel socialFridgeStatisticModel);
}