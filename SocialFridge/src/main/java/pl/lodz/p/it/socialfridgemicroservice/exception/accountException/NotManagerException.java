package pl.lodz.p.it.socialfridgemicroservice.exception.accountException;

import pl.lodz.p.it.socialfridgemicroservice.exception.AppBaseException;

public class NotManagerException extends AppBaseException {
    private static final String MESSAGE = "Account with username: %s does not have the Manager role";
    private static final String KEY = "exception.accountNotManagerRole";

    public NotManagerException(String username) {
        super(String.format(MESSAGE, username), KEY);
    }

    public NotManagerException(String username, Throwable cause) {
        super(String.format(MESSAGE, username), cause, KEY);
    }
}