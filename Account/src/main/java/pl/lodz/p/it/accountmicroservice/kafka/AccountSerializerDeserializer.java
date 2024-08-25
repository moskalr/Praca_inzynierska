package pl.lodz.p.it.accountmicroservice.kafka;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import pl.lodz.p.it.accountmicroservice.model.Account;
import pl.lodz.p.it.accountmicroservice.model.Language;
import org.keycloak.representations.idm.UserRepresentation;

import java.util.Arrays;
import java.util.List;

public class AccountSerializerDeserializer {
    private static final String LANGUAGE = "language";
    private static final String COMMA = ", ";
    private static final String USERNAME = "username";
    private static final String EMAIL = "email";
    private static final String FIRST_NAME = "firstName";
    private static final String LAST_NAME = "lastName";
    private static final String IS_ENABLED = "isEnabled";
    private static final String ROLES = "roles";
    private static final String ROLES_LEFT_REGEX = "[";
    private static final String ROLES_RIGHT_REGEX = "]";
    private static final String REPLACEMENT = "";

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static String serializeUser(UserRepresentation userEntity, List<String> userRoles) throws JsonProcessingException {
        ObjectNode userJsonNode = objectMapper.createObjectNode();

        userJsonNode.put(USERNAME, userEntity.getUsername());
        userJsonNode.put(EMAIL, userEntity.getEmail());
        userJsonNode.put(FIRST_NAME, userEntity.getFirstName());
        userJsonNode.put(LAST_NAME, userEntity.getLastName());
        userJsonNode.put(IS_ENABLED, userEntity.isEnabled());
        userJsonNode.put(ROLES, String.valueOf(userRoles));
        userJsonNode.put(LANGUAGE, userEntity.getAttributes().get(LANGUAGE).get(0));

        return objectMapper.writeValueAsString(userJsonNode);
    }

    public static Account deserializeUser(String message) throws JsonProcessingException {
        ObjectNode userJsonNode = objectMapper.readValue(message, ObjectNode.class);

        Account account = new Account();
        account.setUsername(userJsonNode.get(USERNAME).asText());
        account.setFirstName(userJsonNode.get(FIRST_NAME).asText());
        account.setLastName(userJsonNode.get(LAST_NAME).asText());
        account.setEmail(userJsonNode.get(EMAIL).asText());
        account.setIsEnabled(userJsonNode.get(IS_ENABLED).asBoolean());
        account.setLanguage(Language.valueOf(userJsonNode.get(LANGUAGE).asText()));

        String rolesString = userJsonNode.get(ROLES).asText();
        rolesString = rolesString.replace(ROLES_LEFT_REGEX, REPLACEMENT).replace(ROLES_RIGHT_REGEX, REPLACEMENT);

        String[] rolesArray = rolesString.split(COMMA);

        List<String> rolesList = Arrays.asList(rolesArray);

        for (String role : rolesList) {
            account.getRoles().add(role);
        }
        return account;
    }
}

