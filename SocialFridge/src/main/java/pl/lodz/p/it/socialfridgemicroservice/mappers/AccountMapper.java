package pl.lodz.p.it.socialfridgemicroservice.mappers;

import pl.lodz.p.it.socialfridgemicroservice.dto.response.AccountFavoritesInfo;
import pl.lodz.p.it.socialfridgemicroservice.dto.response.AccountInfo;
import pl.lodz.p.it.socialfridgemicroservice.entity.Account;
import pl.lodz.p.it.socialfridgemicroservice.model.AccountModel;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = FavSocialFridgeListMapper.class)
public interface AccountMapper {
    AccountInfo accountModelToAccountInfo(AccountModel accountModel);

    AccountModel accountToAccountModel(Account account);

    AccountFavoritesInfo accountModelToAccountFavoritesInfo(AccountModel accountModel);
}