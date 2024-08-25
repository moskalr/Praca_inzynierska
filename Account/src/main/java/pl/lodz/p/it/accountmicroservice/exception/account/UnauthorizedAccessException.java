package pl.lodz.p.it.accountmicroservice.exception.account;

import pl.lodz.p.it.accountmicroservice.exception.AppBaseException;

public class UnauthorizedAccessException extends AppBaseException {
    private static final String MESSAGE = "Unauthorized access attempt";
    private static final String KEY = "exception.account.unauthorized_access";

    public UnauthorizedAccessException() {
        super(MESSAGE, KEY);
    }

    public UnauthorizedAccessException(Throwable cause) {
        super(MESSAGE, cause, KEY);
    }
}
