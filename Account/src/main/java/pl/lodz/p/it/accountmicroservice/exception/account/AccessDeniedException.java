package pl.lodz.p.it.accountmicroservice.exception.account;

import pl.lodz.p.it.accountmicroservice.exception.AppBaseException;

public class AccessDeniedException extends AppBaseException {
    private static final String MESSAGE = "Access was not granted for account with username: %s";
    private static final String KEY = "exception.account.access_denied";

    public AccessDeniedException(String username) {
        super(String.format(MESSAGE, username), KEY);
    }

    public AccessDeniedException(String username, Throwable cause) {
        super(String.format(MESSAGE, username), cause, KEY);
    }
}
