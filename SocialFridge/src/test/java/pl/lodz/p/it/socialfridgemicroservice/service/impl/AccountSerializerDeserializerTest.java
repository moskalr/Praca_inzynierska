package pl.lodz.p.it.socialfridgemicroservice.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.github.javafaker.Faker;
import pl.lodz.p.it.socialfridgemicroservice.config.Roles;
import pl.lodz.p.it.socialfridgemicroservice.enums.Language;
import pl.lodz.p.it.socialfridgemicroservice.kafka.AccountSerializerDeserializer;
import pl.lodz.p.it.socialfridgemicroservice.model.AccountModel;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@SpringBootTest
class AccountSerializerDeserializerTest {
    private static final Faker faker = new Faker();
    private static final String USERNAME_FIELD = "username";
    private static final String EMAIL_FIELD = "email";
    private static final String FIRST_NAME_FIELD = "firstName";
    private static final String LAST_NAME_FIELD = "lastName";
    private static final String IS_ENABLED_FIELD = "isEnabled";
    private static final String ROLES_FIELD = "roles";
    private static final String LANGUAGE_FIELD = "language";
    private static final String USERNAME = faker.name().username();
    private static final String EMAIL = faker.internet().emailAddress();
    private static final String FIRST_NAME = faker.name().firstName();
    private static final String LAST_NAME = faker.name().lastName();
    private static final boolean IS_ENABLED = true;
    private static final Language LANGUAGE = Language.EN;
    private static final String ROLES_STRING = "[CLIENT_USER, CLIENT_ADMIN]";

    @Test
    void testSerializeUser() throws JsonProcessingException {
        Faker faker = new Faker();

        AccountModel accountModel = mock(AccountModel.class);
        when(accountModel.getUsername()).thenReturn(USERNAME);
        when(accountModel.getEmail()).thenReturn(EMAIL);
        when(accountModel.getFirstName()).thenReturn(FIRST_NAME);
        when(accountModel.getLastName()).thenReturn(LAST_NAME);
        when(accountModel.getIsEnabled()).thenReturn(IS_ENABLED);
        when(accountModel.getRoles()).thenReturn(Arrays.asList(Roles.USER, Roles.ADMIN));
        when(accountModel.getLanguage()).thenReturn(LANGUAGE);

        String serializedUser = AccountSerializerDeserializer.serializeUser(accountModel);

        String expectedJson = String.format("{\"%s\":\"%s\",\"%s\":\"%s\",\"%s\":\"%s\",\"%s\":\"%s\",\"%s\":%s,\"%s\":\"%s\",\"%s\":\"%s\"}",
                USERNAME_FIELD, USERNAME,
                EMAIL_FIELD, EMAIL,
                FIRST_NAME_FIELD, FIRST_NAME,
                LAST_NAME_FIELD, LAST_NAME,
                IS_ENABLED_FIELD, IS_ENABLED,
                ROLES_FIELD, ROLES_STRING,
                LANGUAGE_FIELD, LANGUAGE);
        assertEquals(expectedJson, serializedUser);
    }

    @Test
    void testDeserializeUser() throws JsonProcessingException {
        String json = String.format("{\"%s\":\"%s\",\"%s\":\"%s\",\"%s\":\"%s\",\"%s\":\"%s\",\"%s\":%s,\"%s\":\"%s\",\"%s\":\"%s\"}",
                USERNAME_FIELD, USERNAME,
                EMAIL_FIELD, EMAIL,
                FIRST_NAME_FIELD, FIRST_NAME,
                LAST_NAME_FIELD, LAST_NAME,
                IS_ENABLED_FIELD, IS_ENABLED,
                ROLES_FIELD, ROLES_STRING,
                LANGUAGE_FIELD, LANGUAGE);
        AccountModel accountModel = AccountSerializerDeserializer.deserializeUser(json);

        assertEquals(USERNAME, accountModel.getUsername());
        assertEquals(EMAIL, accountModel.getEmail());
        assertEquals(FIRST_NAME, accountModel.getFirstName());
        assertEquals(LAST_NAME, accountModel.getLastName());
        assertEquals(IS_ENABLED, accountModel.getIsEnabled());
        assertEquals(Arrays.asList(Roles.USER, Roles.ADMIN), accountModel.getRoles());
        Assertions.assertEquals(LANGUAGE, accountModel.getLanguage());
    }
}
