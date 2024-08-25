package pl.lodz.p.it.socialfridgemicroservice.exception;

import org.springframework.http.HttpStatusCode;
import org.springframework.web.server.ResponseStatusException;

public class CustomResponseStatusException extends ResponseStatusException {

    private final String key;

    public CustomResponseStatusException(HttpStatusCode status, String reason, String key) {
        super(status, reason);
        this.key = key;
    }

    public String getKey() {
        return key;
    }
}

