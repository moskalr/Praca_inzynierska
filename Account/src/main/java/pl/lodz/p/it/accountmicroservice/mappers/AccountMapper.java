package pl.lodz.p.it.accountmicroservice.mappers;

import pl.lodz.p.it.accountmicroservice.dto.request.CreateAccountDto;
import pl.lodz.p.it.accountmicroservice.dto.response.AccountInfoDto;
import pl.lodz.p.it.accountmicroservice.model.Account;
import org.keycloak.representations.idm.UserRepresentation;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", uses = {RoleMapper.class}, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface AccountMapper {

    AccountInfoDto accountToAccountInfoDto(Account account);

    @Mapping(target = "roles", source = "role")
    Account mapToAccount(CreateAccountDto createAccountDto);

    @Mapping(target = "roles", source = "userRoles")
    @Mapping(target = "language", source = "language")
    Account userRepresentationToAccount(UserRepresentation userRepresentation, List<String> userRoles, String language);
}
