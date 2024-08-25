package pl.lodz.p.it.socialfridgemicroservice.service.impl.test.containers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.dockerjava.zerodep.shaded.org.apache.hc.core5.http.HttpStatus;
import com.github.dockerjava.zerodep.shaded.org.apache.hc.core5.http.Method;
import com.github.fge.jsonpatch.JsonPatch;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import pl.lodz.p.it.socialfridgemicroservice.dto.request.AddAddress;
import pl.lodz.p.it.socialfridgemicroservice.dto.request.AddSocialFridge;
import pl.lodz.p.it.socialfridgemicroservice.dto.request.UpdateSocialFridge;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Random;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static pl.lodz.p.it.socialfridgemicroservice.service.impl.test.containers.Account.*;

@SpringBootTest
class SocialFridgeEndpointTest extends BasicIntegrationConfigTest {
    private static final String BASE_URL = "http://localhost:8091/fridges";
    Random random = new Random();
    private final String latitude = String.valueOf(-90 + (90 - (-90)) * random.nextDouble());
    private final String longitude = String.valueOf(-180 + (180 - (-180)) * random.nextDouble());

    @Test
    void getSocialFridges() {
        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);
        final Response response = sendRequestAndGetResponse(Method.GET, BASE_URL + "?states=ARCHIVED,ACTIVE,INACTIVE", null, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response.getStatusCode());
    }

    @Test
    void getSocialFridgeNotFound() {
        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);
        final Response response = sendRequestAndGetResponse(Method.GET, BASE_URL + "/-100", null, ContentType.JSON);
        assertEquals(HttpStatus.SC_NOT_FOUND, response.getStatusCode());
    }

    @Test
    void getSocialFridge() {
        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);
        final AddAddress addAddress = new AddAddress("Szkolna", "1", "Rudnik nad Sanem", "37-420", latitude, latitude);
        final AddSocialFridge addSocialFridge = new AddSocialFridge();
        addSocialFridge.setAddress(addAddress);
        addSocialFridge.setUsername(MANAGER);
        final Response response = sendRequestAndGetResponse(Method.POST, BASE_URL, addSocialFridge, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response.getStatusCode());

        final Integer fridgeId = response.jsonPath().get("id");
        final String fridgeIdAsString = String.valueOf(fridgeId);

        final Response response2 = sendRequestAndGetResponse(Method.GET, BASE_URL + "/" + fridgeIdAsString, null, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response2.getStatusCode());
    }

    @Test
    void getAllManagedSocialFridges() {
        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);
        final Response response = sendRequestAndGetResponse(Method.GET, BASE_URL + "/managed-social-fridges?states=ARCHIVED,ACTIVE,INACTIVE", null, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response.getStatusCode());
    }

    @Test
    void getStatistics() {
        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);
        final Response response = sendRequestAndGetResponse(Method.GET, BASE_URL + "/statistics?months=12", null, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response.getStatusCode());
    }

    @Test
    void getSocialFridgesWithinDistance() {
        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);
        final Response response = sendRequestAndGetResponse(Method.GET, BASE_URL + "/area?latitude=51.746878&longitude=19.496755&maxDistance=50", null, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response.getStatusCode());
    }

    @Test
    void getSocialFridgesWithinDistanceLatitudeException() {
        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);
        final Response response = sendRequestAndGetResponse(Method.GET, BASE_URL + "/area?latitude=fsada&longitude=19.496755&maxDistance=50", null, ContentType.JSON);
        assertEquals(HttpStatus.SC_BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void getSocialFridgesWithinDistanceLongitudeException() {
        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);
        final Response response = sendRequestAndGetResponse(Method.GET, BASE_URL + "/area?latitude=19.496755&longitude=sdfsdf&maxDistance=50", null, ContentType.JSON);
        assertEquals(HttpStatus.SC_BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void getSocialFridgesWithinDistanceMaxDistanceException() {
        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);
        final Response response = sendRequestAndGetResponse(Method.GET, BASE_URL + "/area?latitude=19.496755&longitude=19.496755&maxDistance=ds", null, ContentType.JSON);
        assertEquals(HttpStatus.SC_BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void addSocialFridge() {
        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);
        final AddAddress addAddress = new AddAddress("Szkolna", "1", "Rudnik nad Sanem", "37-420", latitude, longitude);
        final AddSocialFridge addSocialFridge = new AddSocialFridge();
        addSocialFridge.setAddress(addAddress);
        addSocialFridge.setUsername(MANAGER);
        final Response response = sendRequestAndGetResponse(Method.POST, BASE_URL, addSocialFridge, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response.getStatusCode());
    }

    @Test
    void addSocialFridgePostCodeException() {
        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);
        final AddAddress addAddress = new AddAddress("Szkolna", "1", "Rudnik nad Sanem", "37", latitude, longitude);
        final AddSocialFridge addSocialFridge = new AddSocialFridge();
        addSocialFridge.setAddress(addAddress);
        addSocialFridge.setUsername(MANAGER);
        final Response response = sendRequestAndGetResponse(Method.POST, BASE_URL, addSocialFridge, ContentType.JSON);
        assertEquals(HttpStatus.SC_BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void addSocialFridgeAddressException() {
        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);
        final AddAddress addAddress = new AddAddress("Szkolna", "1", "Rudnik nad Sanem", "37-420", "51.7414138", "19.5655864");
        final AddSocialFridge addSocialFridge = new AddSocialFridge();
        addSocialFridge.setAddress(addAddress);
        addSocialFridge.setUsername(MANAGER);
        final Response response = sendRequestAndGetResponse(Method.POST, BASE_URL, addSocialFridge, ContentType.JSON);
        assertEquals(HttpStatus.SC_BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void addSocialFridgeExceptionBuildingNumberBadRequest() {
        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);
        final AddAddress addAddress = new AddAddress("Szkolna", "bfb", "Rudnik nad Sanem", "37-420", latitude, longitude);
        final AddSocialFridge addSocialFridge = new AddSocialFridge();
        addSocialFridge.setAddress(addAddress);
        addSocialFridge.setUsername(MANAGER);
        final Response response = sendRequestAndGetResponse(Method.POST, BASE_URL, addSocialFridge, ContentType.JSON);
        assertEquals(HttpStatus.SC_BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void addSocialFridgeExceptionLongitudeBadRequest() {
        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);
        final AddAddress addAddress = new AddAddress("Szkolna", "1", "Rudnik nad Sanem", "37-420", latitude, "");
        final AddSocialFridge addSocialFridge = new AddSocialFridge();
        addSocialFridge.setAddress(addAddress);
        addSocialFridge.setUsername(MANAGER);
        final Response response = sendRequestAndGetResponse(Method.POST, BASE_URL, addSocialFridge, ContentType.JSON);
        assertEquals(HttpStatus.SC_BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void addSocialFridgeExceptionLatitudeBadRequest() {
        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);
        final AddAddress addAddress = new AddAddress("Szkolna", "1", "Rudnik nad Sanem", "37-420", "", longitude);
        final AddSocialFridge addSocialFridge = new AddSocialFridge();
        addSocialFridge.setAddress(addAddress);
        addSocialFridge.setUsername(MANAGER);
        final Response response = sendRequestAndGetResponse(Method.POST, BASE_URL, addSocialFridge, ContentType.JSON);
        assertEquals(HttpStatus.SC_BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void addSocialFridgeExceptionCityBadRequest() {
        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);
        final AddAddress addAddress = new AddAddress("Szkolna", "1", "", "37-420", latitude, longitude);
        final AddSocialFridge addSocialFridge = new AddSocialFridge();
        addSocialFridge.setAddress(addAddress);
        addSocialFridge.setUsername(MANAGER);
        final Response response = sendRequestAndGetResponse(Method.POST, BASE_URL, addSocialFridge, ContentType.JSON);
        assertEquals(HttpStatus.SC_BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void addSocialFridgeExceptionStreetBadRequest() {
        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);
        final AddAddress addAddress = new AddAddress("", "1", "Rudnik nad Sanem", "37-420", latitude, longitude);
        final AddSocialFridge addSocialFridge = new AddSocialFridge();
        addSocialFridge.setAddress(addAddress);
        addSocialFridge.setUsername(MANAGER);
        final Response response = sendRequestAndGetResponse(Method.POST, BASE_URL, addSocialFridge, ContentType.JSON);
        assertEquals(HttpStatus.SC_BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void patchSocialFridgeChangeState() throws IOException {
        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);
        final AddAddress addAddress = new AddAddress("Szkolna", "1", "Rudnik nad Sanem", "37-420", latitude, latitude);
        final AddSocialFridge addSocialFridge = new AddSocialFridge();
        addSocialFridge.setAddress(addAddress);
        addSocialFridge.setUsername(MANAGER);
        final Response response = sendRequestAndGetResponse(Method.POST, BASE_URL, addSocialFridge, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response.getStatusCode());

        final String jsonPatchString = "[{\"op\": \"replace\", \"path\": \"/state\", \"value\": \"INACTIVE\"}]";
        final JsonNode patchNode = new ObjectMapper().readTree(jsonPatchString);
        final JsonPatch jsonPatch = JsonPatch.fromJson(patchNode);

        final Integer fridgeId = response.jsonPath().get("id");
        final String fridgeIdAsString = String.valueOf(fridgeId);

        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);
        final Response response_3 = sendRequestAndGetResponse(Method.GET, BASE_URL + "/" + fridgeIdAsString, null, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response_3.getStatusCode());

        final Response response_2 = sendRequestAndGetResponse(Method.PATCH, BASE_URL + "/" + fridgeIdAsString, jsonPatch, ContentType.JSON);
        final String state = response_2.jsonPath().get("state");

        assertEquals(HttpStatus.SC_OK, response_2.getStatusCode());
        assertEquals("INACTIVE", state);
    }

    @Test
    void patchSocialFridgeChangeAccount() throws IOException {
        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);
        final AddAddress addAddress = new AddAddress("Szkolna", "1", "Rudnik nad Sanem", "37-420", latitude, latitude);
        final AddSocialFridge addSocialFridge = new AddSocialFridge();
        addSocialFridge.setAddress(addAddress);
        addSocialFridge.setUsername(MANAGER);
        final Response response = sendRequestAndGetResponse(Method.POST, BASE_URL, addSocialFridge, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response.getStatusCode());

        final String jsonPatchString = "[{\"op\": \"replace\", \"path\": \"/username\", \"value\": \"clientmanager2\"}]";
        final JsonNode patchNode = new ObjectMapper().readTree(jsonPatchString);
        final JsonPatch jsonPatch = JsonPatch.fromJson(patchNode);

        final Integer fridgeId = response.jsonPath().get("id");
        final String fridgeIdAsString = String.valueOf(fridgeId);

        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);
        final Response response_3 = sendRequestAndGetResponse(Method.GET, BASE_URL + "/" + fridgeIdAsString, null, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response_3.getStatusCode());

        final Response response_2 = sendRequestAndGetResponse(Method.PATCH, BASE_URL + "/" + fridgeIdAsString, jsonPatch, ContentType.JSON);
        final String username = response_2.jsonPath().get("account.username");

        assertEquals(HttpStatus.SC_OK, response_2.getStatusCode());
        assertEquals("clientmanager2", username);
    }

    @Test
    void patchSocialFridgeChangeAccountETagException() throws IOException {
        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);
        final AddAddress addAddress = new AddAddress("Szkolna", "1", "Rudnik nad Sanem", "37-420", latitude, latitude);
        final AddSocialFridge addSocialFridge = new AddSocialFridge();
        addSocialFridge.setAddress(addAddress);
        addSocialFridge.setUsername(MANAGER);
        final Response response = sendRequestAndGetResponse(Method.POST, BASE_URL, addSocialFridge, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response.getStatusCode());

        final String jsonPatchString = "[{\"op\": \"replace\", \"path\": \"/username\", \"value\": \"clientmanager2\"}]";
        final JsonNode patchNode = new ObjectMapper().readTree(jsonPatchString);
        final JsonPatch jsonPatch = JsonPatch.fromJson(patchNode);

        final Integer fridgeId = response.jsonPath().get("id");
        final String fridgeIdAsString = String.valueOf(fridgeId);

        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);

        final Response response_2 = sendRequestAndGetResponse(Method.PATCH, BASE_URL + "/" + fridgeIdAsString, jsonPatch, ContentType.JSON);
        assertEquals(HttpStatus.SC_PRECONDITION_FAILED, response_2.getStatusCode());
    }

    @Test
    void patchSocialFridgeChangeAccountNotFound() throws IOException {
        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);
        final AddAddress addAddress = new AddAddress("Szkolna", "1", "Rudnik nad Sanem", "37-420", latitude, latitude);
        final AddSocialFridge addSocialFridge = new AddSocialFridge();
        addSocialFridge.setAddress(addAddress);
        addSocialFridge.setUsername(MANAGER);
        final Response response = sendRequestAndGetResponse(Method.POST, BASE_URL, addSocialFridge, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response.getStatusCode());

        final String jsonPatchString = "[{\"op\": \"replace\", \"path\": \"/username\", \"value\": \"clientmanager3\"}]";
        final JsonNode patchNode = new ObjectMapper().readTree(jsonPatchString);
        final JsonPatch jsonPatch = JsonPatch.fromJson(patchNode);

        final Integer fridgeId = response.jsonPath().get("id");
        final String fridgeIdAsString = String.valueOf(fridgeId);

        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);
        final Response response_3 = sendRequestAndGetResponse(Method.GET, BASE_URL + "/" + fridgeIdAsString, null, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response_3.getStatusCode());

        final Response response_2 = sendRequestAndGetResponse(Method.PATCH, BASE_URL + "/" + fridgeIdAsString, jsonPatch, ContentType.JSON);

        assertEquals(HttpStatus.SC_NOT_FOUND, response_2.getStatusCode());
    }

    @Test
    void patchSocialFridgeChangeGrade() throws IOException {
        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);
        final AddAddress addAddress = new AddAddress("Szkolna", "1", "Rudnik nad Sanem", "37-420", latitude, latitude);
        final AddSocialFridge addSocialFridge = new AddSocialFridge();
        addSocialFridge.setAddress(addAddress);
        addSocialFridge.setUsername(MANAGER);
        final Response response = sendRequestAndGetResponse(Method.POST, BASE_URL, addSocialFridge, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response.getStatusCode());

        final Float averageRating = response.jsonPath().get("socialFridgeAverageRating.averageRating");
        assertEquals(0.0F, averageRating);

        final Integer fridgeId = response.jsonPath().get("id");
        final String fridgeIdAsString = String.valueOf(fridgeId);

        sendLoginRequestAndGetResponse(USER, PASSWORD);

        final Response response_3 = sendRequestAndGetResponse(Method.GET, BASE_URL + "/" + fridgeIdAsString + "/my-rating", null, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response_3.getStatusCode());

        final String jsonPatchString = "[{\"op\": \"replace\", \"path\": \"/rating\", \"value\": \"2.137\"}]";
        final JsonNode patchNode = new ObjectMapper().readTree(jsonPatchString);
        final JsonPatch jsonPatch = JsonPatch.fromJson(patchNode);

        final Response response_2 = sendRequestAndGetResponse(Method.PATCH, BASE_URL + "/" + fridgeIdAsString, jsonPatch, ContentType.JSON);
        final Float newAverageRating = response_2.jsonPath().get("socialFridgeAverageRating.averageRating");

        assertEquals(HttpStatus.SC_OK, response_2.getStatusCode());
        assertNotEquals(averageRating, newAverageRating);
    }

    @Test
    void patchSocialFridgeChangeGradeETagException() throws IOException {
        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);
        final AddAddress addAddress = new AddAddress("Szkolna", "1", "Rudnik nad Sanem", "37-420", latitude, latitude);
        final AddSocialFridge addSocialFridge = new AddSocialFridge();
        addSocialFridge.setAddress(addAddress);
        addSocialFridge.setUsername(MANAGER);
        final Response response = sendRequestAndGetResponse(Method.POST, BASE_URL, addSocialFridge, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response.getStatusCode());

        final Float averageRating = response.jsonPath().get("socialFridgeAverageRating.averageRating");
        assertEquals(0.0F, averageRating);

        final Integer fridgeId = response.jsonPath().get("id");
        final String fridgeIdAsString = String.valueOf(fridgeId);

        sendLoginRequestAndGetResponse(USER, PASSWORD);

        final String jsonPatchString = "[{\"op\": \"replace\", \"path\": \"/rating\", \"value\": \"2.137\"}]";
        final JsonNode patchNode = new ObjectMapper().readTree(jsonPatchString);
        final JsonPatch jsonPatch = JsonPatch.fromJson(patchNode);

        final Response response_2 = sendRequestAndGetResponse(Method.PATCH, BASE_URL + "/" + fridgeIdAsString, jsonPatch, ContentType.JSON);
        final Float newAverageRating = response_2.jsonPath().get("socialFridgeAverageRating.averageRating");

        assertEquals(HttpStatus.SC_OK, response_2.getStatusCode());
        assertNotEquals(averageRating, newAverageRating);

        final String jsonPatchString2 = "[{\"op\": \"replace\", \"path\": \"/rating\", \"value\": \"3.137\"}]";
        final JsonNode patchNode2 = new ObjectMapper().readTree(jsonPatchString2);
        final JsonPatch jsonPatch2 = JsonPatch.fromJson(patchNode2);

        final Response response_3 = sendRequestAndGetResponse(Method.PATCH, BASE_URL + "/" + fridgeIdAsString, jsonPatch2, ContentType.JSON);
        assertEquals(HttpStatus.SC_PRECONDITION_FAILED, response_3.getStatusCode());
    }

    @Test
    void sendUpdateSocialFridgeNotification() {
        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);
        final AddAddress addAddress = new AddAddress("Szkolna", "1", "Rudnik nad Sanem", "37-420", latitude, longitude);
        final AddSocialFridge addSocialFridge = new AddSocialFridge();
        addSocialFridge.setAddress(addAddress);
        addSocialFridge.setUsername(MANAGER);
        final Response response = sendRequestAndGetResponse(Method.POST, BASE_URL, addSocialFridge, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response.getStatusCode());
        final Integer fridgeId = response.jsonPath().get("id");
        final String fridgeIdAsString = String.valueOf(fridgeId);

        sendLoginRequestAndGetResponse(USER, PASSWORD);

        final UpdateSocialFridge updateSocialFridge = new UpdateSocialFridge();
        updateSocialFridge.setSocialFridgeId(Long.valueOf(fridgeIdAsString));
        updateSocialFridge.setLongitude(longitude);
        updateSocialFridge.setLatitude(latitude);
        updateSocialFridge.setDescription("testtesttest");
        updateSocialFridge.setProducts(new ArrayList<>());
        updateSocialFridge.setImage("https://images.openfoodfacts.org/images/products/544/900/000/0286/front_en.77.200.jpg");
        final Response response2 = sendRequestAndGetResponse(Method.PUT, BASE_URL + "/notifications", updateSocialFridge, ContentType.JSON);
        assertEquals(HttpStatus.SC_NO_CONTENT, response2.getStatusCode());
    }

    @Test
    void sendUpdateSocialFridgeNotificationNotFoundException() {
        sendLoginRequestAndGetResponse(USER, PASSWORD);
        final UpdateSocialFridge updateSocialFridge = new UpdateSocialFridge();
        updateSocialFridge.setSocialFridgeId(-100L);
        updateSocialFridge.setLongitude(longitude);
        updateSocialFridge.setLatitude(latitude);
        updateSocialFridge.setDescription("testtesttest");
        updateSocialFridge.setProducts(new ArrayList<>());
        updateSocialFridge.setImage("https://images.openfoodfacts.org/images/products/544/900/000/0286/front_en.77.200.jpg");
        final Response response = sendRequestAndGetResponse(Method.PUT, BASE_URL + "/notifications", updateSocialFridge, ContentType.JSON);
        assertEquals(HttpStatus.SC_NOT_FOUND, response.getStatusCode());
    }

    @Test
    void sendUpdateSocialFridgeNotificationLongitudeException() {
        sendLoginRequestAndGetResponse(USER, PASSWORD);
        final UpdateSocialFridge updateSocialFridge = new UpdateSocialFridge();
        updateSocialFridge.setSocialFridgeId(-100L);
        updateSocialFridge.setLongitude("");
        updateSocialFridge.setLatitude(latitude);
        updateSocialFridge.setDescription("testtesttest");
        updateSocialFridge.setProducts(new ArrayList<>());
        updateSocialFridge.setImage("https://images.openfoodfacts.org/images/products/544/900/000/0286/front_en.77.200.jpg");
        final Response response = sendRequestAndGetResponse(Method.PUT, BASE_URL + "/notifications", updateSocialFridge, ContentType.JSON);
        assertEquals(HttpStatus.SC_BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void sendUpdateSocialFridgeNotificationLatitudeException() {
        sendLoginRequestAndGetResponse(USER, PASSWORD);
        final UpdateSocialFridge updateSocialFridge = new UpdateSocialFridge();
        updateSocialFridge.setSocialFridgeId(-100L);
        updateSocialFridge.setLongitude(longitude);
        updateSocialFridge.setLatitude("");
        updateSocialFridge.setDescription("testtesttest");
        updateSocialFridge.setProducts(new ArrayList<>());
        updateSocialFridge.setImage("https://images.openfoodfacts.org/images/products/544/900/000/0286/front_en.77.200.jpg");
        final Response response = sendRequestAndGetResponse(Method.PUT, BASE_URL + "/notifications", updateSocialFridge, ContentType.JSON);
        assertEquals(HttpStatus.SC_BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void sendUpdateSocialFridgeNotificationSocialFridgeIdException() {
        sendLoginRequestAndGetResponse(USER, PASSWORD);
        final UpdateSocialFridge updateSocialFridge = new UpdateSocialFridge();
        updateSocialFridge.setLongitude(longitude);
        updateSocialFridge.setLatitude(latitude);
        updateSocialFridge.setDescription("testtesttest");
        updateSocialFridge.setProducts(new ArrayList<>());
        updateSocialFridge.setImage("https://images.openfoodfacts.org/images/products/544/900/000/0286/front_en.77.200.jpg");
        final Response response = sendRequestAndGetResponse(Method.PUT, BASE_URL + "/notifications", updateSocialFridge, ContentType.JSON);
        assertEquals(HttpStatus.SC_BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void sendUpdateSocialFridgeNotificationImageException() {
        sendLoginRequestAndGetResponse(USER, PASSWORD);
        final UpdateSocialFridge updateSocialFridge = new UpdateSocialFridge();
        updateSocialFridge.setSocialFridgeId(-100L);
        updateSocialFridge.setLongitude(longitude);
        updateSocialFridge.setLatitude(latitude);
        updateSocialFridge.setDescription("testtesttest");
        updateSocialFridge.setProducts(new ArrayList<>());
        final Response response = sendRequestAndGetResponse(Method.PUT, BASE_URL + "/notifications", updateSocialFridge, ContentType.JSON);
        assertEquals(HttpStatus.SC_BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void sendUpdateSocialFridgeNotificationDescriptionException() {
        sendLoginRequestAndGetResponse(USER, PASSWORD);
        final UpdateSocialFridge updateSocialFridge = new UpdateSocialFridge();
        updateSocialFridge.setSocialFridgeId(-100L);
        updateSocialFridge.setLongitude(longitude);
        updateSocialFridge.setLatitude(latitude);
        updateSocialFridge.setDescription("");
        updateSocialFridge.setProducts(new ArrayList<>());
        updateSocialFridge.setImage("https://images.openfoodfacts.org/images/products/544/900/000/0286/front_en.77.200.jpg");
        final Response response = sendRequestAndGetResponse(Method.PUT, BASE_URL + "/notifications", updateSocialFridge, ContentType.JSON);
        assertEquals(HttpStatus.SC_BAD_REQUEST, response.getStatusCode());
    }
}
