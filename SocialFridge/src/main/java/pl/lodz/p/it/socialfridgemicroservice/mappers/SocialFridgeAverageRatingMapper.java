package pl.lodz.p.it.socialfridgemicroservice.mappers;

import pl.lodz.p.it.socialfridgemicroservice.dto.response.SocialFridgeAverageRatingInfo;
import pl.lodz.p.it.socialfridgemicroservice.entity.SocialFridgeAverageRating;
import pl.lodz.p.it.socialfridgemicroservice.model.SocialFridgeAverageRatingModel;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface SocialFridgeAverageRatingMapper {
    SocialFridgeAverageRatingModel averageRatingToAverageRatingModel(SocialFridgeAverageRating socialFridgeAverageRating);

    SocialFridgeAverageRatingInfo averageRatingModelToAverageRatingInfo(SocialFridgeAverageRatingModel socialFridgeAverageRatingModel);
}
