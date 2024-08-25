package pl.lodz.p.it.socialfridgemicroservice.service.impl;

import com.github.javafaker.Faker;
import pl.lodz.p.it.socialfridgemicroservice.entity.Address;
import pl.lodz.p.it.socialfridgemicroservice.exception.addressException.AddressNotFoundException;
import pl.lodz.p.it.socialfridgemicroservice.exception.addressException.InvalidAddressModificationException;
import pl.lodz.p.it.socialfridgemicroservice.exception.eTag.OutdatedDataException;
import pl.lodz.p.it.socialfridgemicroservice.mappers.AddressMapper;
import pl.lodz.p.it.socialfridgemicroservice.model.AddressModel;
import pl.lodz.p.it.socialfridgemicroservice.repository.AddressRepository;
import pl.lodz.p.it.socialfridgemicroservice.utils.eTag.ETagCalculator;
import jakarta.ws.rs.core.EntityTag;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Optional;
import java.util.Random;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@SpringBootTest
class AddressServiceImplTest {

    @Mock
    private AddressMapper addressMapper;

    @Mock
    private AddressRepository addressRepository;

    @Mock
    private ETagCalculator eTagCalculator;

    @InjectMocks
    private AddressServiceImpl addressService;

    private final Faker faker = new Faker();

    @Test
    void testUpdateAddress() {
        final Address address = new Address();
        address.setCity(faker.address().city());
        address.setStreet(faker.address().streetName());
        address.setBuildingNumber(faker.address().buildingNumber());
        address.setPostalCode(faker.address().zipCode());
        address.setLongitude(faker.address().longitude());
        address.setLatitude(faker.address().latitude());

        final AddressModel addressModel = new AddressModel();
        addressModel.setId(address.getId());
        addressModel.setCity(faker.address().city());
        addressModel.setStreet(faker.address().streetName());
        addressModel.setBuildingNumber(faker.address().buildingNumber());
        addressModel.setPostalCode(faker.address().zipCode());
        addressModel.setLongitude(faker.address().longitude());
        addressModel.setLatitude(faker.address().latitude());

        when(addressRepository.findById(address.getId())).thenReturn(Optional.of(address));
        when(addressMapper.addressToAddressModel(address)).thenReturn(addressModel);
        when(eTagCalculator.verifyProvidedETag(address)).thenReturn(true);

        Assertions.assertDoesNotThrow(() -> addressService.updateAddress(addressModel));

        verify(addressRepository, times(1)).save(Mockito.any());

        verify(addressMapper, times(1)).addressToAddressModel(Mockito.any());
    }

    @Test
    void testGetAddress() {
        final Address address = new Address();
        final AddressModel addressModel = new AddressModel();

        when(addressMapper.addressToAddressModel(address)).thenReturn(addressModel);
        when(addressRepository.findById(address.getId())).thenReturn(Optional.of(address));
        when(eTagCalculator.calculateETagForEntity(address)).thenReturn(EntityTag.valueOf(""));

        Assertions.assertDoesNotThrow(() -> addressService.getAddress(address.getId()));

        verify(addressRepository, times(1)).findById(address.getId());
    }

    @Test
    void testGetAddressNotFoundException() {
        final Address address = new Address();

        when(addressRepository.findById(address.getId())).thenReturn(Optional.empty());

        assertThrows(AddressNotFoundException.class, () -> addressService.getAddress(address.getId()));

        verify(addressRepository, times(1)).findById(address.getId());
    }

    @Test
    void testUpdateAddressAddressNotFoundException() {
        final AddressModel addressModel = new AddressModel();
        addressModel.setId(new Random().nextLong());
        addressModel.setCity(faker.address().city());
        addressModel.setStreet(faker.address().streetName());
        addressModel.setBuildingNumber(faker.address().buildingNumber());
        addressModel.setPostalCode(faker.address().zipCode());
        addressModel.setLongitude(faker.address().longitude());
        addressModel.setLatitude(faker.address().latitude());

        Mockito.when(addressRepository.findById(anyLong())).thenReturn(Optional.empty());

        assertThrows(AddressNotFoundException.class, () -> addressService.updateAddress(addressModel));

        verify(addressRepository, Mockito.never()).save(Mockito.any());

        verify(addressMapper, Mockito.never()).addressToAddressModel(Mockito.any());
    }

    @Test
    void testInvalidAddressModification() {
        final Address address = new Address();
        address.setCity(faker.address().city());
        address.setStreet(faker.address().streetName());
        address.setBuildingNumber(faker.address().buildingNumber());
        address.setPostalCode(faker.address().zipCode());
        address.setLongitude(faker.address().longitude());
        address.setLatitude(faker.address().latitude());

        final AddressModel addressModel = new AddressModel();
        addressModel.setId(address.getId());
        addressModel.setCity(address.getCity());
        addressModel.setStreet(address.getStreet());
        addressModel.setBuildingNumber(faker.address().buildingNumber());
        addressModel.setPostalCode(address.getPostalCode());
        addressModel.setLongitude(address.getLongitude());
        addressModel.setLatitude(address.getLatitude());

        when(addressRepository.findById(address.getId())).thenReturn(Optional.of(address));
        when(eTagCalculator.verifyProvidedETag(address)).thenReturn(true);
        when(addressMapper.addressToAddressModel(address)).thenReturn(addressModel);

        assertThrows(InvalidAddressModificationException.class, () -> addressService.updateAddress(addressModel));

        verify(addressRepository, Mockito.never()).save(Mockito.any());
        verify(addressMapper, Mockito.never()).addressToAddressModel(Mockito.any());

        final AddressModel addressModel2 = new AddressModel();
        addressModel2.setId(address.getId());
        addressModel2.setCity(address.getCity());
        addressModel2.setStreet(address.getStreet());
        addressModel2.setBuildingNumber(address.getBuildingNumber());
        addressModel2.setPostalCode(address.getPostalCode());
        addressModel2.setLongitude(faker.address().longitude());
        addressModel2.setLatitude(faker.address().latitude());

        Mockito.when(addressRepository.findById(address.getId())).thenReturn(Optional.of(address));

        Mockito.when(addressMapper.addressToAddressModel(address)).thenReturn(addressModel2);

        assertThrows(InvalidAddressModificationException.class, () -> addressService.updateAddress(addressModel2));

        verify(addressRepository, Mockito.never()).save(Mockito.any());

        verify(addressMapper, Mockito.never()).addressToAddressModel(Mockito.any());
    }

    @Test
    void testInvalidAddressModificationOutdatedDataException() {
        final Address address = new Address();
        address.setCity(faker.address().city());
        address.setStreet(faker.address().streetName());
        address.setBuildingNumber(faker.address().buildingNumber());
        address.setPostalCode(faker.address().zipCode());
        address.setLongitude(faker.address().longitude());
        address.setLatitude(faker.address().latitude());

        final AddressModel addressModel = new AddressModel();
        addressModel.setId(address.getId());
        addressModel.setCity(address.getCity());
        addressModel.setStreet(address.getStreet());
        addressModel.setBuildingNumber(faker.address().buildingNumber());
        addressModel.setPostalCode(address.getPostalCode());
        addressModel.setLongitude(address.getLongitude());
        addressModel.setLatitude(address.getLatitude());

        when(addressRepository.findById(address.getId())).thenReturn(Optional.of(address));
        when(eTagCalculator.verifyProvidedETag(address)).thenReturn(false);


        assertThrows(OutdatedDataException.class, () -> addressService.updateAddress(addressModel));

        verify(addressRepository, times(1)).findById(address.getId());
    }
}