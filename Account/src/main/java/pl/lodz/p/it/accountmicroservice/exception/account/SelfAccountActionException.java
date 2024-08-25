package pl.lodz.p.it.accountmicroservice.exception.account;

import pl.lodz.p.it.accountmicroservice.exception.AppBaseException;

public class SelfAccountActionException extends AppBaseException {
    private static final String MESSAGE = "Self action performed by account with username: %s";
    private static final String KEY = "exception.account.self_action";

    public SelfAccountActionException(String username) {
        super(String.format(MESSAGE, username), KEY);
    }

    public SelfAccountActionException(String username, Throwable cause) {
        super(String.format(MESSAGE, username), cause, KEY);
    }
}