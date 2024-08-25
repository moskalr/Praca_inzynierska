package pl.lodz.p.it.accountmicroservice.exception.account;

import pl.lodz.p.it.accountmicroservice.exception.AppBaseException;

public class EmailAlreadyTakenException extends AppBaseException {
    private static final String MESSAGE = "Email already taken";
    private static final String KEY = "exception.account.email_already_taken";

    public EmailAlreadyTakenException() {
        super(MESSAGE, KEY);
    }

    public EmailAlreadyTakenException(Throwable cause) {
        super(MESSAGE, cause, KEY);
    }
}
