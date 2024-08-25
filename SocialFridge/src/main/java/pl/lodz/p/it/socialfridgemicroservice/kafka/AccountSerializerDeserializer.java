package pl.lodz.p.it.socialfridgemicroservice.kafka;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import pl.lodz.p.it.socialfridgemicroservice.enums.Language;
import pl.lodz.p.it.socialfridgemicroservice.model.AccountModel;

import java.util.Arrays;
import java.util.List;

public class AccountSerializerDeserializer {
    private static final String LANGUAGE = "language";
    private static final String USERNAME = "username";
    private static final String EMAIL = "email";
    private static final String FIRST_NAME = "firstName";
    private static final String LAST_NAME = "lastName";
    private static final String IS_ENABLED = "isEnabled";
    private static final String ROLES = "roles";
    private static final String ROLES_LEFT_REGEX = "[";
    private static final String ROLES_RIGHT_REGEX = "]";
    private static final String REPLACEMENT = "";
    private static final String COMMA = ", ";

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static String serializeUser(AccountModel accountModel) throws JsonProcessingException {
        ObjectNode userJsonNode = objectMapper.createObjectNode();

        userJsonNode.put(USERNAME, accountModel.getUsername());
        userJsonNode.put(EMAIL, accountModel.getEmail());
        userJsonNode.put(FIRST_NAME, accountModel.getFirstName());
        userJsonNode.put(LAST_NAME, accountModel.getLastName());
        userJsonNode.put(IS_ENABLED, accountModel.getIsEnabled());
        userJsonNode.put(ROLES, String.valueOf(accountModel.getRoles()));
        userJsonNode.put(LANGUAGE, String.valueOf(accountModel.getLanguage()));

        return objectMapper.writeValueAsString(userJsonNode);

    }

    public static AccountModel deserializeUser(String message) throws JsonProcessingException {
        ObjectNode userJsonNode = objectMapper.readValue(message, ObjectNode.class);

        AccountModel accountModel = new AccountModel();
        accountModel.setUsername(userJsonNode.get(USERNAME).asText());
        accountModel.setFirstName(userJsonNode.get(FIRST_NAME).asText());
        accountModel.setLastName(userJsonNode.get(LAST_NAME).asText());
        accountModel.setEmail(userJsonNode.get(EMAIL).asText());
        accountModel.setIsEnabled(userJsonNode.get(IS_ENABLED).asBoolean());
        accountModel.setLanguage(Language.valueOf(userJsonNode.get(LANGUAGE).asText()));

        String rolesString = userJsonNode.get(ROLES).asText();
        rolesString = rolesString.replace(ROLES_LEFT_REGEX, REPLACEMENT).replace(ROLES_RIGHT_REGEX, REPLACEMENT);

        String[] rolesArray = rolesString.split(COMMA);

        List<String> rolesList = Arrays.asList(rolesArray);

        for (String role : rolesList) {
            accountModel.getRoles().add(role);
        }

        return accountModel;
    }
}

