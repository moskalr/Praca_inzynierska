package pl.lodz.p.it.accountmicroservice.exception.account;

import pl.lodz.p.it.accountmicroservice.exception.AppBaseException;

public class AccountNotFoundException extends AppBaseException {
    private static final String MESSAGE = "Account with username: %s was not found";
    private static final String KEY = "exception.account.not_found";

    public AccountNotFoundException(String username) {
        super(String.format(MESSAGE, username), KEY);
    }

    public AccountNotFoundException(String username, Throwable cause) {
        super(String.format(MESSAGE, username), cause, KEY);
    }
}
