package pl.lodz.p.it.accountmicroservice.exception.account;

import pl.lodz.p.it.accountmicroservice.exception.AppBaseException;

public class KeycloakClientNotFoundException extends AppBaseException {
    private static final String MESSAGE = "Keycloak client with id: %s was not found";
    private static final String KEY = "exception.keycloak.client.not_found";

    public KeycloakClientNotFoundException(String keycloakClient) {
        super(String.format(MESSAGE, keycloakClient), KEY);
    }

    public KeycloakClientNotFoundException(String keycloakClient, Throwable cause) {
        super(String.format(MESSAGE, keycloakClient), cause, KEY);
    }
}
