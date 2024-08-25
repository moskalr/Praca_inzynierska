package pl.lodz.p.it.accountmicroservice.mappers;

import java.util.Collections;
import java.util.List;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    default List<String> mapToRoles(String role) {
        return Collections.singletonList(role);
    }
}
