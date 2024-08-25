package pl.lodz.p.it.socialfridgemicroservice.service.impl;

import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import pl.lodz.p.it.socialfridgemicroservice.entity.Address;
import pl.lodz.p.it.socialfridgemicroservice.exception.AppBaseException;
import pl.lodz.p.it.socialfridgemicroservice.exception.addressException.AddressNotFoundException;
import pl.lodz.p.it.socialfridgemicroservice.exception.addressException.InvalidAddressModificationException;
import pl.lodz.p.it.socialfridgemicroservice.exception.eTag.OutdatedDataException;
import pl.lodz.p.it.socialfridgemicroservice.mappers.AddressMapper;
import pl.lodz.p.it.socialfridgemicroservice.model.AddressModel;
import pl.lodz.p.it.socialfridgemicroservice.repository.AddressRepository;
import pl.lodz.p.it.socialfridgemicroservice.service.AddressService;
import pl.lodz.p.it.socialfridgemicroservice.utils.eTag.ETagCalculator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

@Service
@RequiredArgsConstructor
public class AddressServiceImpl implements AddressService {
    private final AddressMapper addressMapper;
    private final AddressRepository addressRepository;
    private final ETagCalculator eTagCalculator;
    @Override
    public AddressModel getAddress(Long id) throws AddressNotFoundException {
        final Address address = addressRepository.findById(id).orElseThrow(() -> new AddressNotFoundException(id));
        final AddressModel addressModel = addressMapper.addressToAddressModel(address);
        addressModel.setETag(eTagCalculator.calculateETagForEntity(address).getValue());
        return addressModel;
    }

    @Override
    @Transactional(
            propagation = Propagation.REQUIRED,
            isolation = Isolation.READ_COMMITTED,
            rollbackFor = AppBaseException.class,
            transactionManager = "fridgeTransactionManager")
    public AddressModel updateAddress(AddressModel addressModel) throws InvalidAddressModificationException, AddressNotFoundException, OutdatedDataException {
        final Address address = addressRepository.findById(addressModel.getId()).orElseThrow(() -> new AddressNotFoundException(addressModel.getId()));

        if (!eTagCalculator.verifyProvidedETag(address)) {
            throw new OutdatedDataException();
        }

        throwIfInvalidAddressModification(addressModel, address);

        address.setStreet(addressModel.getStreet());
        address.setBuildingNumber(addressModel.getBuildingNumber());
        address.setCity(addressModel.getCity());
        address.setPostalCode(addressModel.getPostalCode());
        address.setLatitude(addressModel.getLatitude());
        address.setLongitude(addressModel.getLongitude());
        addressRepository.save(address);
        return addressMapper.addressToAddressModel(address);
    }

    private void throwIfInvalidAddressModification(AddressModel patchedAddressModel, Address address) throws InvalidAddressModificationException {
        if ((Objects.equals(patchedAddressModel.getLongitude(), address.getLongitude())
                && Objects.equals(patchedAddressModel.getLatitude(), address.getLatitude()))
                || (Objects.equals(patchedAddressModel.getStreet(), address.getStreet())
                && Objects.equals(patchedAddressModel.getBuildingNumber(), address.getBuildingNumber())
                && Objects.equals(patchedAddressModel.getCity(), address.getCity())
                && Objects.equals(patchedAddressModel.getPostalCode(), address.getPostalCode()))) {
            throw new InvalidAddressModificationException();
        }
    }
}
