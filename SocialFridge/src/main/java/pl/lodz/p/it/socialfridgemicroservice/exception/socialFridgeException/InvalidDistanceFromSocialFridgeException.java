package pl.lodz.p.it.socialfridgemicroservice.exception.socialFridgeException;

import pl.lodz.p.it.socialfridgemicroservice.exception.AppBaseException;

public class InvalidDistanceFromSocialFridgeException extends AppBaseException {
    private static final String MESSAGE = "You are too far from the social fridge with id: %s";
    private static final String KEY = "exception.invalidDistanceFromSocialFridge";

    public InvalidDistanceFromSocialFridgeException(Long id) {
        super(String.format(MESSAGE, id), KEY);
    }

    public InvalidDistanceFromSocialFridgeException(Long id, Throwable cause) {
        super(String.format(MESSAGE, id), cause, KEY);
    }
}