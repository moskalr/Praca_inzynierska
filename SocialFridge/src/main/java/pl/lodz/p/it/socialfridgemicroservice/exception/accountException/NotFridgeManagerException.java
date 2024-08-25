package pl.lodz.p.it.socialfridgemicroservice.exception.accountException;

import pl.lodz.p.it.socialfridgemicroservice.exception.AppBaseException;

public class NotFridgeManagerException extends AppBaseException {
    private static final String MESSAGE = "Account with username: %s is not the manager of the fridge related to the suggestion";
    private static final String KEY = "exception.suggestion.not_fridge_manager";

    public NotFridgeManagerException(String username) {
        super(String.format(MESSAGE, username), KEY);
    }

    public NotFridgeManagerException(String username, Throwable cause) {
        super(String.format(MESSAGE, username), cause, KEY);
    }
}