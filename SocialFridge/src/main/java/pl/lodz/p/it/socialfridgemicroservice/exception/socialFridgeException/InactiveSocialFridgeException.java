package pl.lodz.p.it.socialfridgemicroservice.exception.socialFridgeException;

import pl.lodz.p.it.socialfridgemicroservice.exception.AppBaseException;

public class InactiveSocialFridgeException extends AppBaseException {
    private static final String MESSAGE = "Social fridge with id: %s is inactive";
    private static final String KEY = "exception.socialFridgeInactive";

    public InactiveSocialFridgeException(Long id) {
        super(String.format(MESSAGE, id), KEY);
    }

    public InactiveSocialFridgeException(Long id, Throwable cause) {
        super(String.format(MESSAGE, id), cause, KEY);
    }
}
