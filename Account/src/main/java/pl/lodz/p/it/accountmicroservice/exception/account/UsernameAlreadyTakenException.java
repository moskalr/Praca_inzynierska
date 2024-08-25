package pl.lodz.p.it.accountmicroservice.exception.account;

import pl.lodz.p.it.accountmicroservice.exception.AppBaseException;

public class UsernameAlreadyTakenException extends AppBaseException {
    private static final String MESSAGE = "Username already taken";
    private static final String KEY = "exception.account.username_already_taken";

    public UsernameAlreadyTakenException() {
        super(String.format(MESSAGE), KEY);
    }

    public UsernameAlreadyTakenException(Throwable cause) {
        super(String.format(MESSAGE), cause, KEY);
    }
}
