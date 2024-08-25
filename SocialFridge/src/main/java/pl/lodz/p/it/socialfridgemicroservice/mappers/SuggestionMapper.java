package pl.lodz.p.it.socialfridgemicroservice.mappers;

import pl.lodz.p.it.socialfridgemicroservice.dto.request.AddSuggestion;
import pl.lodz.p.it.socialfridgemicroservice.dto.response.SuggestionInfo;
import pl.lodz.p.it.socialfridgemicroservice.entity.Suggestion;
import pl.lodz.p.it.socialfridgemicroservice.model.SuggestionModel;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = FavSocialFridgeListMapper.class)
public interface SuggestionMapper {
    SuggestionInfo suggestionToSuggestionInfo(SuggestionModel suggestionModel);

    SuggestionModel suggestionToSuggestionModel(Suggestion suggestion);

    SuggestionModel addSuggestionToSuggestionModel(AddSuggestion addSuggestion);
}
