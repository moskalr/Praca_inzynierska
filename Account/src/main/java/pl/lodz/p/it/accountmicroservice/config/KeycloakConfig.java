package pl.lodz.p.it.accountmicroservice.config;

import org.keycloak.OAuth2Constants;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

@Configuration
public class KeycloakConfig {
    @Bean
    Keycloak keycloak(Environment env) {
        return KeycloakBuilder.builder()
                .serverUrl(env.getProperty("KEYCLOAK_SERVER_URL"))
                .realm(env.getProperty("KEYCLOAK_REALM"))
                .clientId(env.getProperty("KEYCLOAK_CLIENT_ID"))
                .grantType(OAuth2Constants.PASSWORD)
                .username(env.getProperty("KEYCLOAK_ADMIN_USERNAME"))
                .password(env.getProperty("KEYCLOAK_ADMIN_PASSWORD"))
                .build();
    }
}