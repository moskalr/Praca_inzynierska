package pl.lodz.p.it.socialfridgemicroservice.service.impl.test.containers;

import com.github.dockerjava.zerodep.shaded.org.apache.hc.core5.http.HttpStatus;
import com.github.dockerjava.zerodep.shaded.org.apache.hc.core5.http.Method;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import pl.lodz.p.it.socialfridgemicroservice.dto.request.AddAddress;
import pl.lodz.p.it.socialfridgemicroservice.dto.request.AddSocialFridge;
import pl.lodz.p.it.socialfridgemicroservice.dto.request.UpdateAddress;

import java.util.Random;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static pl.lodz.p.it.socialfridgemicroservice.service.impl.test.containers.Account.MANAGER;
import static pl.lodz.p.it.socialfridgemicroservice.service.impl.test.containers.Account.PASSWORD;

@SpringBootTest
class AddressEndpointTest extends BasicIntegrationConfigTest {
    private static final String BASE_URL = "http://localhost:8091/addresses";
    private static final String SOCIAL_FRIDGE_URL = "http://localhost:8091/fridges";
    Random random = new Random();
    private final String latitude = String.valueOf(-90 + (90 - (-90)) * random.nextDouble());
    private final String longitude = String.valueOf(-180 + (180 - (-180)) * random.nextDouble());

    @Test
    void getAddress() {
        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);
        final AddAddress addAddress = new AddAddress("Szkolna", "1", "Rudnik nad Sanem", "37-420", latitude, longitude);
        final AddSocialFridge addSocialFridge = new AddSocialFridge();
        addSocialFridge.setAddress(addAddress);
        addSocialFridge.setUsername(MANAGER);
        final Response response = sendRequestAndGetResponse(Method.POST, SOCIAL_FRIDGE_URL, addSocialFridge, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response.getStatusCode());

        final Integer addressId = response.jsonPath().get("address.id");
        final String addressIdAsString = String.valueOf(addressId);

        final Response response2 = sendRequestAndGetResponse(Method.GET, BASE_URL + "/" + addressIdAsString, null, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response2.getStatusCode());
    }

    @Test
    void getAddressNotFound() {
        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);
        final Response response2 = sendRequestAndGetResponse(Method.GET, BASE_URL + "/-1000", null, ContentType.JSON);
        assertEquals(HttpStatus.SC_NOT_FOUND, response2.getStatusCode());
    }

    @Test
    void updateAddress() {
        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);
        final AddAddress addAddress = new AddAddress("Szkolna", "1", "Rudnik nad Sanem", "37-420", latitude, longitude);
        final AddSocialFridge addSocialFridge = new AddSocialFridge();
        addSocialFridge.setAddress(addAddress);
        addSocialFridge.setUsername(MANAGER);
        final Response response = sendRequestAndGetResponse(Method.POST, SOCIAL_FRIDGE_URL, addSocialFridge, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response.getStatusCode());

        final Integer addressId = response.jsonPath().get("address.id");
        final String addressIdAsString = String.valueOf(addressId);

        final Response response2 = sendRequestAndGetResponse(Method.GET, BASE_URL + "/" + addressIdAsString, null, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response2.getStatusCode());

        final String newLatitude = String.valueOf(-90 + (90 - (-90)) * random.nextDouble());
        final String newLongitude = String.valueOf(-180 + (180 - (-180)) * random.nextDouble());

        final UpdateAddress updateAddress = new UpdateAddress();
        updateAddress.setId(Long.valueOf(addressId));
        updateAddress.setLatitude(newLatitude);
        updateAddress.setLongitude(newLongitude);
        updateAddress.setCity("Rudnik nad Sanem");
        updateAddress.setStreet("Szkolna");
        updateAddress.setBuildingNumber("2");
        updateAddress.setPostalCode("37-420");

        final Response response3 = sendRequestAndGetResponse(Method.PUT, BASE_URL, updateAddress, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response3.getStatusCode());
    }

    @Test
    void updateAddressAddrssException() {
        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);
        final AddAddress addAddress = new AddAddress("Szkolna", "1", "Rudnik nad Sanem", "37-420", latitude, longitude);
        final AddSocialFridge addSocialFridge = new AddSocialFridge();
        addSocialFridge.setAddress(addAddress);
        addSocialFridge.setUsername(MANAGER);
        final Response response = sendRequestAndGetResponse(Method.POST, SOCIAL_FRIDGE_URL, addSocialFridge, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response.getStatusCode());

        final Integer addressId = response.jsonPath().get("address.id");
        final String addressIdAsString = String.valueOf(addressId);

        final Response response2 = sendRequestAndGetResponse(Method.GET, BASE_URL + "/" + addressIdAsString, null, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response2.getStatusCode());

        final String newLatitude = String.valueOf(-90 + (90 - (-90)) * random.nextDouble());
        final String newLongitude = String.valueOf(-180 + (180 - (-180)) * random.nextDouble());

        final UpdateAddress updateAddress = new UpdateAddress();
        updateAddress.setId(Long.valueOf(addressId));
        updateAddress.setLatitude(newLatitude);
        updateAddress.setLongitude(newLongitude);
        updateAddress.setCity("Rudnik nad Sanem");
        updateAddress.setStreet("Szkolna");
        updateAddress.setBuildingNumber("1");
        updateAddress.setPostalCode("37-420");

        final Response response3 = sendRequestAndGetResponse(Method.PUT, BASE_URL, updateAddress, ContentType.JSON);
        assertEquals(HttpStatus.SC_BAD_REQUEST, response3.getStatusCode());
    }

    @Test
    void updateAddressLocationException() {
        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);
        final AddAddress addAddress = new AddAddress("Szkolna", "1", "Rudnik nad Sanem", "37-420", latitude, longitude);
        final AddSocialFridge addSocialFridge = new AddSocialFridge();
        addSocialFridge.setAddress(addAddress);
        addSocialFridge.setUsername(MANAGER);
        final Response response = sendRequestAndGetResponse(Method.POST, SOCIAL_FRIDGE_URL, addSocialFridge, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response.getStatusCode());

        final Integer addressId = response.jsonPath().get("address.id");
        final String addressIdAsString = String.valueOf(addressId);

        final Response response2 = sendRequestAndGetResponse(Method.GET, BASE_URL + "/" + addressIdAsString, null, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response2.getStatusCode());

        final UpdateAddress updateAddress = new UpdateAddress();
        updateAddress.setId(Long.valueOf(addressId));
        updateAddress.setLatitude(latitude);
        updateAddress.setLongitude(longitude);
        updateAddress.setCity("Rudnik nad Sanem");
        updateAddress.setStreet("Szkolna");
        updateAddress.setBuildingNumber("2");
        updateAddress.setPostalCode("37-420");

        final Response response3 = sendRequestAndGetResponse(Method.PUT, BASE_URL, updateAddress, ContentType.JSON);
        assertEquals(HttpStatus.SC_BAD_REQUEST, response3.getStatusCode());
    }

    @Test
    void updateAddressAddressIdException() {
        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);

        final UpdateAddress updateAddress = new UpdateAddress();
        updateAddress.setLatitude(latitude);
        updateAddress.setLongitude(longitude);
        updateAddress.setCity("Rudnik nad Sanem");
        updateAddress.setStreet("Szkolna");
        updateAddress.setBuildingNumber("2");
        updateAddress.setPostalCode("37-420");

        final Response response3 = sendRequestAndGetResponse(Method.PUT, BASE_URL, updateAddress, ContentType.JSON);
        assertEquals(HttpStatus.SC_BAD_REQUEST, response3.getStatusCode());
    }

    @Test
    void updateAddressLatitudeException() {
        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);

        final UpdateAddress updateAddress = new UpdateAddress();
        updateAddress.setId(-1000L);
        updateAddress.setLatitude("");
        updateAddress.setLongitude(longitude);
        updateAddress.setCity("Rudnik nad Sanem");
        updateAddress.setStreet("Szkolna");
        updateAddress.setBuildingNumber("2");
        updateAddress.setPostalCode("37-420");

        final Response response3 = sendRequestAndGetResponse(Method.PUT, BASE_URL, updateAddress, ContentType.JSON);
        assertEquals(HttpStatus.SC_BAD_REQUEST, response3.getStatusCode());
    }

    @Test
    void updateAddressLongitudeException() {
        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);

        final UpdateAddress updateAddress = new UpdateAddress();
        updateAddress.setId(-1000L);
        updateAddress.setLatitude(latitude);
        updateAddress.setLongitude("");
        updateAddress.setCity("Rudnik nad Sanem");
        updateAddress.setStreet("Szkolna");
        updateAddress.setBuildingNumber("2");
        updateAddress.setPostalCode("37-420");

        final Response response3 = sendRequestAndGetResponse(Method.PUT, BASE_URL, updateAddress, ContentType.JSON);
        assertEquals(HttpStatus.SC_BAD_REQUEST, response3.getStatusCode());
    }

    @Test
    void updateAddressCityException() {
        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);

        final UpdateAddress updateAddress = new UpdateAddress();
        updateAddress.setId(-1000L);
        updateAddress.setLatitude(latitude);
        updateAddress.setLongitude(longitude);
        updateAddress.setStreet("Szkolna");
        updateAddress.setBuildingNumber("2");
        updateAddress.setPostalCode("37-420");

        final Response response3 = sendRequestAndGetResponse(Method.PUT, BASE_URL, updateAddress, ContentType.JSON);
        assertEquals(HttpStatus.SC_BAD_REQUEST, response3.getStatusCode());
    }

    @Test
    void updateAddressStreetException() {
        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);

        final UpdateAddress updateAddress = new UpdateAddress();
        updateAddress.setId(-1000L);
        updateAddress.setLatitude(latitude);
        updateAddress.setLongitude(longitude);
        updateAddress.setCity("Rudnik nad Sanem");
        updateAddress.setBuildingNumber("2");
        updateAddress.setPostalCode("37-420");

        final Response response3 = sendRequestAndGetResponse(Method.PUT, BASE_URL, updateAddress, ContentType.JSON);
        assertEquals(HttpStatus.SC_BAD_REQUEST, response3.getStatusCode());
    }

    @Test
    void updateAddressBuildingNumberException() {
        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);

        final UpdateAddress updateAddress = new UpdateAddress();
        updateAddress.setId(-1000L);
        updateAddress.setLatitude(latitude);
        updateAddress.setLongitude(longitude);
        updateAddress.setCity("Rudnik nad Sanem");
        updateAddress.setStreet("Szkolna");
        updateAddress.setBuildingNumber("dsafd");
        updateAddress.setPostalCode("37-420");

        final Response response3 = sendRequestAndGetResponse(Method.PUT, BASE_URL, updateAddress, ContentType.JSON);
        assertEquals(HttpStatus.SC_BAD_REQUEST, response3.getStatusCode());
    }

    @Test
    void updateAddressPostalCodeException() {
        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);

        final UpdateAddress updateAddress = new UpdateAddress();
        updateAddress.setId(-1000L);
        updateAddress.setLatitude(latitude);
        updateAddress.setLongitude(longitude);
        updateAddress.setCity("Rudnik nad Sanem");
        updateAddress.setStreet("Szkolna");
        updateAddress.setBuildingNumber("2");
        updateAddress.setPostalCode("37");

        final Response response3 = sendRequestAndGetResponse(Method.PUT, BASE_URL, updateAddress, ContentType.JSON);
        assertEquals(HttpStatus.SC_BAD_REQUEST, response3.getStatusCode());
    }
}
