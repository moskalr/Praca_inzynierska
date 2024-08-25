package pl.lodz.p.it.socialfridgemicroservice.service;

import org.springframework.security.access.prepost.PreAuthorize;
import pl.lodz.p.it.socialfridgemicroservice.exception.addressException.AddressNotFoundException;
import pl.lodz.p.it.socialfridgemicroservice.exception.addressException.InvalidAddressModificationException;
import pl.lodz.p.it.socialfridgemicroservice.exception.eTag.OutdatedDataException;
import pl.lodz.p.it.socialfridgemicroservice.model.AddressModel;

public interface AddressService {
    @PreAuthorize("hasRole(@Roles.MANAGER)")
    AddressModel updateAddress(AddressModel addressModel) throws InvalidAddressModificationException, AddressNotFoundException, OutdatedDataException;

    @PreAuthorize("hasRole(@Roles.MANAGER)")
    AddressModel getAddress(Long id) throws AddressNotFoundException;
}
