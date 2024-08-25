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

import java.io.IOException;
import java.util.Random;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static pl.lodz.p.it.socialfridgemicroservice.service.impl.test.containers.Account.*;

@SpringBootTest
class AccountEndpointTest extends BasicIntegrationConfigTest {
    private static final String BASE_URL = "http://localhost:8091/accounts";
    private static final String SOCIAL_FRIDGE_URL = "http://localhost:8091/fridges";
    Random random = new Random();
    private final String latitude = String.valueOf(-90 + (90 - (-90)) * random.nextDouble());
    private final String longitude = String.valueOf(-180 + (180 - (-180)) * random.nextDouble());

    @Test
    void getFavoriteCategoriesAndSocialFridges() {
        sendLoginRequestAndGetResponse(USER, PASSWORD);
        final Response response = sendRequestAndGetResponse(Method.GET, BASE_URL + "/preferences", null, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response.getStatusCode());
    }

    @Test
    void patchAccountFavSocialFridge() throws IOException {
        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);
        final AddAddress addAddress = new AddAddress("Szkolna", "1", "Rudnik nad Sanem", "37-420", latitude, longitude);
        final AddSocialFridge addSocialFridge = new AddSocialFridge();
        addSocialFridge.setAddress(addAddress);
        addSocialFridge.setUsername(MANAGER);
        final Response response = sendRequestAndGetResponse(Method.POST, SOCIAL_FRIDGE_URL, addSocialFridge, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response.getStatusCode());
        final Integer fridgeId = response.jsonPath().get("id");

        sendLoginRequestAndGetResponse(USER, PASSWORD);
        final Response response2 = sendRequestAndGetResponse(Method.GET, BASE_URL + "/preferences", null, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response2.getStatusCode());

        final String jsonPatchString2 = "[{\"op\": \"replace\", \"path\": \"/favSocialFridgesId\", \"value\": []}]";
        final JsonNode patchNode2 = new ObjectMapper().readTree(jsonPatchString2);
        final JsonPatch jsonPatch2 = JsonPatch.fromJson(patchNode2);

        final Response response4 = sendRequestAndGetResponse(Method.PATCH, BASE_URL, jsonPatch2, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response4.getStatusCode());

        final Response response6 = sendRequestAndGetResponse(Method.GET, BASE_URL + "/preferences", null, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response6.getStatusCode());

        final ObjectMapper objectMapper = new ObjectMapper();
        final String responseBody = response2.asString();
        final JsonNode previousResponse = objectMapper.readTree(responseBody);
        final JsonNode previousFavSocialFridges = previousResponse.get("favSocialFridges");

        final String jsonPatchString = "[{\"op\": \"replace\", \"path\": \"/favSocialFridgesId\", \"value\": [" + fridgeId + "]}]";
        final JsonNode patchNode = new ObjectMapper().readTree(jsonPatchString);
        final JsonPatch jsonPatch = JsonPatch.fromJson(patchNode);

        final Response response3 = sendRequestAndGetResponse(Method.PATCH, BASE_URL, jsonPatch, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response3.getStatusCode());
        final String newResponseBody = response3.asString();
        final JsonNode newResponse = objectMapper.readTree(newResponseBody);
        final JsonNode newFavSocialFridges = newResponse.get("favSocialFridges");
        assertNotEquals(previousFavSocialFridges, newFavSocialFridges);
    }

    @Test
    void patchAccountFavCategories() throws IOException {
        sendLoginRequestAndGetResponse(USER, PASSWORD);
        final Response response2 = sendRequestAndGetResponse(Method.GET, BASE_URL + "/preferences", null, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response2.getStatusCode());

        final String jsonPatchString2 = "[{\"op\": \"replace\", \"path\": \"/favCategories\", \"value\": []}]";
        final JsonNode patchNode2 = new ObjectMapper().readTree(jsonPatchString2);
        final JsonPatch jsonPatch2 = JsonPatch.fromJson(patchNode2);

        final Response response4 = sendRequestAndGetResponse(Method.PATCH, BASE_URL, jsonPatch2, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response4.getStatusCode());
        final ObjectMapper objectMapper = new ObjectMapper();
        final String responseBody = response4.asString();
        final JsonNode previousResponse = objectMapper.readTree(responseBody);
        final JsonNode previousFavSocialFridges = previousResponse.get("favCategories");

        final String jsonPatchString = "[{\"op\": \"replace\", \"path\": \"/favCategories\", \"value\": [\"VEGETABLES\"]}]";
        final JsonNode patchNode = new ObjectMapper().readTree(jsonPatchString);
        final JsonPatch jsonPatch = JsonPatch.fromJson(patchNode);

        final Response response5 = sendRequestAndGetResponse(Method.GET, BASE_URL + "/preferences", null, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response5.getStatusCode());

        final Response response3 = sendRequestAndGetResponse(Method.PATCH, BASE_URL, jsonPatch, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response3.getStatusCode());
        final String newResponseBody = response3.asString();
        final JsonNode newResponse = objectMapper.readTree(newResponseBody);
        final JsonNode newFavSocialFridges = newResponse.get("favCategories");
        assertNotEquals(previousFavSocialFridges, newFavSocialFridges);
    }

    @Test
    void patchAccountFavCategoriesETagException() throws IOException {
        sendLoginRequestAndGetResponse(USER, PASSWORD);

        final String jsonPatchString2 = "[{\"op\": \"replace\", \"path\": \"/favCategories\", \"value\": []}]";
        final JsonNode patchNode2 = new ObjectMapper().readTree(jsonPatchString2);
        final JsonPatch jsonPatch2 = JsonPatch.fromJson(patchNode2);

        final Response response4 = sendRequestAndGetResponse(Method.PATCH, BASE_URL, jsonPatch2, ContentType.JSON);
        assertEquals(HttpStatus.SC_PRECONDITION_FAILED, response4.getStatusCode());
    }
}
