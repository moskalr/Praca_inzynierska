package pl.lodz.p.it.socialfridgemicroservice.mappers;

import pl.lodz.p.it.socialfridgemicroservice.dto.request.UpdateAddress;
import pl.lodz.p.it.socialfridgemicroservice.dto.request.UserLocation;
import pl.lodz.p.it.socialfridgemicroservice.dto.response.AddressInfo;
import pl.lodz.p.it.socialfridgemicroservice.entity.Address;
import pl.lodz.p.it.socialfridgemicroservice.model.AddressModel;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AddressMapper {
    AddressInfo addressModelToAddressInfo(AddressModel addressModel);

    AddressModel addressToAddressModel(Address address);

    AddressModel updateAddressToAddressModel(UpdateAddress updateAddress);

    AddressModel userLocationToAddress(UserLocation userLocation);
}
