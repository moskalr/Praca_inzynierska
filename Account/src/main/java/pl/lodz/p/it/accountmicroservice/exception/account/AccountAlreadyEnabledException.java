package pl.lodz.p.it.accountmicroservice.exception.account;

import pl.lodz.p.it.accountmicroservice.exception.AppBaseException;

public class AccountAlreadyEnabledException extends AppBaseException {
    private static final String MESSAGE = "Account with username: %s is already enabled";
    private static final String KEY = "exception.account.already_enabled";

    public AccountAlreadyEnabledException(String username) {
        super(String.format(MESSAGE, username), KEY);
    }

    public AccountAlreadyEnabledException(String username, Throwable cause) {
        super(String.format(MESSAGE, username), cause, KEY);
    }
}
