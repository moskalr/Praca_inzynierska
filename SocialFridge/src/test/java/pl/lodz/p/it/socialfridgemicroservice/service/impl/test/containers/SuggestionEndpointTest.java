package pl.lodz.p.it.socialfridgemicroservice.service.impl.test.containers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.dockerjava.zerodep.shaded.org.apache.hc.core5.http.HttpStatus;
import com.github.dockerjava.zerodep.shaded.org.apache.hc.core5.http.Method;
import com.github.fge.jsonpatch.JsonPatch;
import io.restassured.http.ContentType;
import io.restassured.path.json.JsonPath;
import io.restassured.response.Response;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import pl.lodz.p.it.socialfridgemicroservice.dto.request.AddAddress;
import pl.lodz.p.it.socialfridgemicroservice.dto.request.AddSocialFridge;
import pl.lodz.p.it.socialfridgemicroservice.dto.request.AddSuggestion;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static pl.lodz.p.it.socialfridgemicroservice.service.impl.test.containers.Account.*;

@SpringBootTest
class SuggestionEndpointTest extends BasicIntegrationConfigTest {
    private static final String BASE_URL = "http://localhost:8091/suggestions";
    private static final String SOCIAL_FRIDGE_URL = "http://localhost:8091/fridges";
    Random random = new Random();
    private Double latitude = -90 + (90 - (-90)) * random.nextDouble();
    private Double longitude = -180 + (180 - (-180)) * random.nextDouble();

    @Test
    void getAllManagedFridgeSuggestions() {
        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);
        final Response response = sendRequestAndGetResponse(Method.GET, BASE_URL + "?isNew=true", null, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response.getStatusCode());
    }

    @Test
    void addSuggestion() {
        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);
        final AddAddress addAddress = new AddAddress("Szkolna", "1", "Rudnik nad Sanem", "37-420", latitude.toString(), longitude.toString());
        final AddSocialFridge addSocialFridge = new AddSocialFridge();
        addSocialFridge.setAddress(addAddress);
        addSocialFridge.setUsername(MANAGER);
        final Response response = sendRequestAndGetResponse(Method.POST, SOCIAL_FRIDGE_URL, addSocialFridge, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response.getStatusCode());
        final Integer fridgeId = response.jsonPath().get("id");
        final String fridgeIdAsString = String.valueOf(fridgeId);

        sendLoginRequestAndGetResponse(USER, PASSWORD);
        final AddSuggestion addSuggestion = new AddSuggestion();
        addSuggestion.setLatitude(latitude.toString());
        addSuggestion.setLongitude(longitude.toString());
        addSuggestion.setDescription("Suggestion test");
        addSuggestion.setImage("https://images.openfoodfacts.org/images/products/544/900/000/0286/front_en.77.200.jpg");
        addSuggestion.setSocialFridgeId(Long.valueOf(fridgeIdAsString));
        final Response response2 = sendRequestAndGetResponse(Method.POST, BASE_URL, addSuggestion, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response2.getStatusCode());
    }

    @Test
    void addSuggestionAddressException() {
        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);
        final AddAddress addAddress = new AddAddress("Szkolna", "1", "Rudnik nad Sanem", "37-420", latitude.toString(), longitude.toString());
        final AddSocialFridge addSocialFridge = new AddSocialFridge();
        addSocialFridge.setAddress(addAddress);
        addSocialFridge.setUsername(MANAGER);
        final Response response = sendRequestAndGetResponse(Method.POST, SOCIAL_FRIDGE_URL, addSocialFridge, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response.getStatusCode());
        final Integer fridgeId = response.jsonPath().get("id");
        final String fridgeIdAsString = String.valueOf(fridgeId);

        sendLoginRequestAndGetResponse(USER, PASSWORD);
        latitude += 0.1;
        longitude += 0.1;
        final AddSuggestion addSuggestion = new AddSuggestion();
        addSuggestion.setLatitude(latitude.toString());
        addSuggestion.setLongitude(longitude.toString());
        addSuggestion.setDescription("Suggestion test");
        addSuggestion.setImage("https://images.openfoodfacts.org/images/products/544/900/000/0286/front_en.77.200.jpg");
        addSuggestion.setSocialFridgeId(Long.valueOf(fridgeIdAsString));
        final Response response2 = sendRequestAndGetResponse(Method.POST, BASE_URL, addSuggestion, ContentType.JSON);
        assertEquals(HttpStatus.SC_BAD_REQUEST, response2.getStatusCode());
    }

    @Test
    void addSuggestionAddressExceptionSocialFridgeIdBadRequest() {
        sendLoginRequestAndGetResponse(USER, PASSWORD);
        final AddSuggestion addSuggestion = new AddSuggestion();
        addSuggestion.setLatitude(latitude.toString());
        addSuggestion.setLongitude(longitude.toString());
        addSuggestion.setDescription("Suggestion test");
        addSuggestion.setImage("https://images.openfoodfacts.org/images/products/544/900/000/0286/front_en.77.200.jpg");
        final Response response2 = sendRequestAndGetResponse(Method.POST, BASE_URL, addSuggestion, ContentType.JSON);
        assertEquals(HttpStatus.SC_BAD_REQUEST, response2.getStatusCode());
    }

    @Test
    void addSuggestionAddressExceptionDescriptionBadRequest() {
        sendLoginRequestAndGetResponse(USER, PASSWORD);
        final AddSuggestion addSuggestion = new AddSuggestion();
        addSuggestion.setLatitude(latitude.toString());
        addSuggestion.setLongitude(longitude.toString());
        addSuggestion.setDescription("");
        addSuggestion.setImage("https://images.openfoodfacts.org/images/products/544/900/000/0286/front_en.77.200.jpg");
        addSuggestion.setSocialFridgeId(0L);
        final Response response2 = sendRequestAndGetResponse(Method.POST, BASE_URL, addSuggestion, ContentType.JSON);
        assertEquals(HttpStatus.SC_BAD_REQUEST, response2.getStatusCode());
    }

    @Test
    void addSuggestionAddressExceptionLatitudePattern() {
        sendLoginRequestAndGetResponse(USER, PASSWORD);
        final AddSuggestion addSuggestion = new AddSuggestion();
        addSuggestion.setLatitude("");
        addSuggestion.setLongitude(longitude.toString());
        addSuggestion.setDescription("Suggestion test");
        addSuggestion.setImage("https://images.openfoodfacts.org/images/products/544/900/000/0286/front_en.77.200.jpg");
        addSuggestion.setSocialFridgeId(0L);
        final Response response2 = sendRequestAndGetResponse(Method.POST, BASE_URL, addSuggestion, ContentType.JSON);
        assertEquals(HttpStatus.SC_BAD_REQUEST, response2.getStatusCode());
    }

    @Test
    void addSuggestionAddressExceptionLongitudePattern() {
        sendLoginRequestAndGetResponse(USER, PASSWORD);
        final AddSuggestion addSuggestion = new AddSuggestion();
        addSuggestion.setLatitude(latitude.toString());
        addSuggestion.setLongitude("");
        addSuggestion.setDescription("Suggestion test");
        addSuggestion.setImage("https://images.openfoodfacts.org/images/products/544/900/000/0286/front_en.77.200.jpg");
        addSuggestion.setSocialFridgeId(0L);
        final Response response2 = sendRequestAndGetResponse(Method.POST, BASE_URL, addSuggestion, ContentType.JSON);
        assertEquals(HttpStatus.SC_BAD_REQUEST, response2.getStatusCode());
    }

    @Test
    void patchSuggestion() throws IOException {
        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);
        final AddAddress addAddress = new AddAddress("Szkolna", "1", "Rudnik nad Sanem", "37-420", latitude.toString(), longitude.toString());
        final AddSocialFridge addSocialFridge = new AddSocialFridge();
        addSocialFridge.setAddress(addAddress);
        addSocialFridge.setUsername(MANAGER);
        final Response response = sendRequestAndGetResponse(Method.POST, SOCIAL_FRIDGE_URL, addSocialFridge, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response.getStatusCode());
        final Integer fridgeId = response.jsonPath().get("id");
        final String fridgeIdAsString = String.valueOf(fridgeId);

        sendLoginRequestAndGetResponse(USER, PASSWORD);
        final AddSuggestion addSuggestion = new AddSuggestion();
        addSuggestion.setLatitude(latitude.toString());
        addSuggestion.setLongitude(longitude.toString());
        addSuggestion.setDescription("Suggestion test");
        addSuggestion.setImage("https://images.openfoodfacts.org/images/products/544/900/000/0286/front_en.77.200.jpg");
        addSuggestion.setSocialFridgeId(Long.valueOf(fridgeIdAsString));
        final Response response2 = sendRequestAndGetResponse(Method.POST, BASE_URL, addSuggestion, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response2.getStatusCode());
        final Boolean state = response2.jsonPath().get("isNew");
        assertEquals(true, state);

        final String jsonPatchString = "[{\"op\": \"replace\", \"path\": \"/isNew\", \"value\": \"false\"}]";
        final JsonNode patchNode = new ObjectMapper().readTree(jsonPatchString);
        final JsonPatch jsonPatch = JsonPatch.fromJson(patchNode);

        final Integer suggestionId = response2.jsonPath().get("id");

        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);
        final Response response4 = sendRequestAndGetResponse(Method.GET, BASE_URL + "?isNew=true&page=0&size=1000", null, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response4.getStatusCode());
        final JsonPath jsonPath = response4.jsonPath();
        final List<Map<String, Object>> suggestions = jsonPath.getList("");
        final Optional<Map<String, Object>> matchingSuggestion = suggestions.stream()
                .filter(suggestion -> suggestion.get("id").equals(suggestionId))
                .findFirst();
        final String eTag = (String) matchingSuggestion.get().get("etag");
        setE_TAG(eTag);
        final Response response3 = sendRequestAndGetResponse(Method.PATCH, BASE_URL + "/" + suggestionId, jsonPatch, ContentType.JSON);
        final Boolean newState = response3.jsonPath().get("isNew");
        assertEquals(HttpStatus.SC_OK, response3.getStatusCode());
        assertEquals(false, newState);
    }

    @Test
    void patchSuggestionNotFound() throws IOException {
        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);
        final AddAddress addAddress = new AddAddress("Szkolna", "1", "Rudnik nad Sanem", "37-420", latitude.toString(), longitude.toString());
        final AddSocialFridge addSocialFridge = new AddSocialFridge();
        addSocialFridge.setAddress(addAddress);
        addSocialFridge.setUsername(MANAGER);
        final Response response = sendRequestAndGetResponse(Method.POST, SOCIAL_FRIDGE_URL, addSocialFridge, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response.getStatusCode());
        final Integer fridgeId = response.jsonPath().get("id");
        final String fridgeIdAsString = String.valueOf(fridgeId);

        sendLoginRequestAndGetResponse(USER, PASSWORD);
        final AddSuggestion addSuggestion = new AddSuggestion();
        addSuggestion.setLatitude(latitude.toString());
        addSuggestion.setLongitude(longitude.toString());
        addSuggestion.setDescription("Suggestion test");
        addSuggestion.setImage("https://images.openfoodfacts.org/images/products/544/900/000/0286/front_en.77.200.jpg");
        addSuggestion.setSocialFridgeId(Long.valueOf(fridgeIdAsString));
        final Response response2 = sendRequestAndGetResponse(Method.POST, BASE_URL, addSuggestion, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response2.getStatusCode());
        final Boolean state = response2.jsonPath().get("isNew");
        assertEquals(true, state);

        final String jsonPatchString = "[{\"op\": \"replace\", \"path\": \"/isNew\", \"value\": \"false\"}]";
        final JsonNode patchNode = new ObjectMapper().readTree(jsonPatchString);
        final JsonPatch jsonPatch = JsonPatch.fromJson(patchNode);

        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);
        final Response response3 = sendRequestAndGetResponse(Method.PATCH, BASE_URL + "/-1000", jsonPatch, ContentType.JSON);
        assertEquals(HttpStatus.SC_NOT_FOUND, response3.getStatusCode());
    }

    @Test
    void patchSuggestionETagException() throws IOException {
        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);
        final AddAddress addAddress = new AddAddress("Szkolna", "1", "Rudnik nad Sanem", "37-420", latitude.toString(), longitude.toString());
        final AddSocialFridge addSocialFridge = new AddSocialFridge();
        addSocialFridge.setAddress(addAddress);
        addSocialFridge.setUsername(MANAGER);
        final Response response = sendRequestAndGetResponse(Method.POST, SOCIAL_FRIDGE_URL, addSocialFridge, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response.getStatusCode());
        final Integer fridgeId = response.jsonPath().get("id");
        final String fridgeIdAsString = String.valueOf(fridgeId);

        sendLoginRequestAndGetResponse(USER, PASSWORD);
        final AddSuggestion addSuggestion = new AddSuggestion();
        addSuggestion.setLatitude(latitude.toString());
        addSuggestion.setLongitude(longitude.toString());
        addSuggestion.setDescription("Suggestion test");
        addSuggestion.setImage("https://images.openfoodfacts.org/images/products/544/900/000/0286/front_en.77.200.jpg");
        addSuggestion.setSocialFridgeId(Long.valueOf(fridgeIdAsString));
        final Response response2 = sendRequestAndGetResponse(Method.POST, BASE_URL, addSuggestion, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response2.getStatusCode());
        final Boolean state = response2.jsonPath().get("isNew");
        assertEquals(true, state);

        final String jsonPatchString = "[{\"op\": \"replace\", \"path\": \"/isNew\", \"value\": \"false\"}]";
        final JsonNode patchNode = new ObjectMapper().readTree(jsonPatchString);
        final JsonPatch jsonPatch = JsonPatch.fromJson(patchNode);

        final Integer suggestionId = response2.jsonPath().get("id");

        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);
        final Response response3 = sendRequestAndGetResponse(Method.PATCH, BASE_URL + "/" + suggestionId, jsonPatch, ContentType.JSON);
        assertEquals(HttpStatus.SC_PRECONDITION_FAILED, response3.getStatusCode());
    }
}
