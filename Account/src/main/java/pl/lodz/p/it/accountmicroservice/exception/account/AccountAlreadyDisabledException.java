package pl.lodz.p.it.accountmicroservice.exception.account;

import pl.lodz.p.it.accountmicroservice.exception.AppBaseException;

public class AccountAlreadyDisabledException extends AppBaseException {
    private static final String MESSAGE = "Account with username: %s is already disabled";
    private static final String KEY = "exception.account.already_disabled";

    public AccountAlreadyDisabledException(String username) {
        super(String.format(MESSAGE, username), KEY);
    }

    public AccountAlreadyDisabledException(String username, Throwable cause) {
        super(String.format(MESSAGE, username), cause, KEY);
    }
}
