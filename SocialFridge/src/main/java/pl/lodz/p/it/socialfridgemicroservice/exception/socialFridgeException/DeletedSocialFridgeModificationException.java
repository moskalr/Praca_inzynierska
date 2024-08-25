package pl.lodz.p.it.socialfridgemicroservice.exception.socialFridgeException;

import pl.lodz.p.it.socialfridgemicroservice.exception.AppBaseException;

public class DeletedSocialFridgeModificationException extends AppBaseException {
    private static final String MESSAGE = "Attempted to modify a deleted social fridge with id: %s";
    private static final String KEY = "exception.socialFridgeDeletedModification";

    public DeletedSocialFridgeModificationException(Long id) {
        super(String.format(MESSAGE, id), KEY);
    }

    public DeletedSocialFridgeModificationException(Long id, Throwable cause) {
        super(String.format(MESSAGE, id), cause, KEY);
    }
}