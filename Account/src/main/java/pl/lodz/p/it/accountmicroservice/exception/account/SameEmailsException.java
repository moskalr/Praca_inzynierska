package pl.lodz.p.it.accountmicroservice.exception.account;

import pl.lodz.p.it.accountmicroservice.exception.AppBaseException;

public class SameEmailsException extends AppBaseException {
    private static final String MESSAGE = "New email is the same as the previous one";
    private static final String KEY = "exception.account.access_denied";

    public SameEmailsException(String email) {
        super(String.format(MESSAGE, email), KEY);
    }

    public SameEmailsException(String email, Throwable cause) {
        super(String.format(MESSAGE, email), cause, KEY);
    }
}
