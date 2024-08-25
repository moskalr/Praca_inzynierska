package pl.lodz.p.it.accountmicroservice.exception.account;

import pl.lodz.p.it.accountmicroservice.exception.AppBaseException;

public class GeneralErrorException extends AppBaseException {
    private static final String MESSAGE = "Unknown error";
    private static final String KEY = "exception.account.general_error";

    public GeneralErrorException() {
        super(MESSAGE, KEY);
    }

    public GeneralErrorException(Throwable cause) {
        super(MESSAGE, cause, KEY);
    }
}
