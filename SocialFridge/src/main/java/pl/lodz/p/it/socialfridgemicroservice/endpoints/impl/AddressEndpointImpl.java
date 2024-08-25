package pl.lodz.p.it.socialfridgemicroservice.endpoints.impl;

import pl.lodz.p.it.socialfridgemicroservice.dto.request.UpdateAddress;
import pl.lodz.p.it.socialfridgemicroservice.dto.response.AddressInfo;
import pl.lodz.p.it.socialfridgemicroservice.endpoints.AddressEndpoint;
import pl.lodz.p.it.socialfridgemicroservice.exception.CustomResponseStatusException;
import pl.lodz.p.it.socialfridgemicroservice.exception.addressException.AddressNotFoundException;
import pl.lodz.p.it.socialfridgemicroservice.exception.addressException.InvalidAddressModificationException;
import pl.lodz.p.it.socialfridgemicroservice.exception.eTag.OutdatedDataException;
import pl.lodz.p.it.socialfridgemicroservice.mappers.AddressMapper;
import pl.lodz.p.it.socialfridgemicroservice.model.AddressModel;
import pl.lodz.p.it.socialfridgemicroservice.service.AddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class AddressEndpointImpl implements AddressEndpoint {
    private final AddressService addressService;
    private final AddressMapper addressMapper;

    @Override
    public ResponseEntity<AddressInfo> getAddress(Long id) {
        try {
            final AddressModel addressModel = addressService.getAddress(id);
            return ResponseEntity.status(HttpStatus.OK).eTag(addressModel.getETag()).body(addressMapper.addressModelToAddressInfo(addressModel));
        } catch (AddressNotFoundException e) {
            throw new CustomResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e.getKey());
        }
    }

    @Override
    public ResponseEntity<AddressInfo> updateAddress(UpdateAddress updateAddress) {
        try {
            AddressModel addressModel = addressService.updateAddress(addressMapper.updateAddressToAddressModel(updateAddress));
            return ResponseEntity.ok(addressMapper.addressModelToAddressInfo(addressModel));
        } catch (AddressNotFoundException e) {
            throw new CustomResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e.getKey());
        } catch (InvalidAddressModificationException e) {
            throw new CustomResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e.getKey());
        } catch (OutdatedDataException e) {
            throw new CustomResponseStatusException(HttpStatus.PRECONDITION_FAILED, e.getMessage(), e.getKey());
        }
    }
}
