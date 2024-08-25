package pl.lodz.p.it.socialfridgemicroservice.service.impl.test.containers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.github.dockerjava.zerodep.shaded.org.apache.hc.core5.http.Method;
import io.restassured.http.ContentType;
import io.restassured.http.Header;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;
import lombok.Setter;

import java.util.Optional;

import static io.restassured.RestAssured.given;

public class BasicIntegrationConfigTest extends DevelopEnvConfigTest{
    @Setter
    private static String BEARER_TOKEN = "";
    @Setter
    protected static String E_TAG = "";
    private static final String KEYCLOAK_API = "http://localhost:8082/realms/client_app/protocol/openid-connect/token";
    private static final String PASSWORD = "password";
    private static final String FOOD_RESCUE = "food_rescue";
    private static final String GRANT_TYPE = "grant_type";
    private static final String CLIENT_ID = "client_id";
    private static final String USERNAME = "username";
    private static final String ACCESS_TOKEN = "access_token";
    private static final String AUTHORIZATION = "Authorization";
    private static final String BEARER = "Bearer ";
    private static final String IF_MATCH = "If-Match";
    private static final String ETAG = "ETag";

    private static String objectToJson(Object object) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            mapper.registerModule(new JavaTimeModule());
            return mapper.writeValueAsString(object);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    protected static void sendLoginRequestAndGetResponse(String username, String password) {
        RequestSpecification request = given().contentType(ContentType.URLENC);
        request.formParam(GRANT_TYPE, PASSWORD);
        request.formParam(CLIENT_ID, FOOD_RESCUE);
        request.formParam(USERNAME, username);
        request.formParam(PASSWORD, password);
        Response response = request.request(String.valueOf(Method.POST), KEYCLOAK_API);
        BEARER_TOKEN = response.getBody().path(ACCESS_TOKEN);
    }

    protected static Response sendRequestAndGetResponse(Method method, String path, Object object, ContentType contentType) {
        contentType = contentType == null ? ContentType.ANY : contentType;
        RequestSpecification request = given().contentType(contentType);
        String jsonObject = objectToJson(object);

        if (object != null) request.body(jsonObject);
        if (!BEARER_TOKEN.equals("") && !path.equals(KEYCLOAK_API))
            request.header(new Header(AUTHORIZATION, BEARER + BEARER_TOKEN));
        if (!E_TAG.equals(""))
            request.header(new Header(IF_MATCH, E_TAG.replace("\"", "")));
        Response response = request.request(String.valueOf(method), path);
        E_TAG = Optional.ofNullable(response.getHeader(ETAG)).orElse("");
        return response;
    }
}
