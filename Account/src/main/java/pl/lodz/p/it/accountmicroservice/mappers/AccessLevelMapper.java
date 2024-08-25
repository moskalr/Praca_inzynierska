package pl.lodz.p.it.accountmicroservice.mappers;

import pl.lodz.p.it.accountmicroservice.dto.request.AccessLevelDto;
import pl.lodz.p.it.accountmicroservice.model.Role;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", uses = {AccessLevelMapper.class}, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface AccessLevelMapper {
    Role mapToRole(AccessLevelDto accessLevelDto);
}
