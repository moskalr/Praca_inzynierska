package pl.lodz.p.it.socialfridgemicroservice.exception.socialFridgeException;

import pl.lodz.p.it.socialfridgemicroservice.exception.AppBaseException;

public class SocialFridgeNotFoundException extends AppBaseException {
    private static final String MESSAGE = "Social fridge with id: %s was not found";
    private static final String KEY = "exception.socialFridgeNotFound";

    public SocialFridgeNotFoundException(Long id) {
        super(String.format(MESSAGE, id), KEY);
    }

    public SocialFridgeNotFoundException(Long id, Throwable cause) {
        super(String.format(MESSAGE, id), cause, KEY);
    }
}
