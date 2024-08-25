package pl.lodz.p.it.accountmicroservice.exception.account;

import pl.lodz.p.it.accountmicroservice.exception.AppBaseException;

public class AccountNotFoundByEmailException extends AppBaseException {
    private static final String MESSAGE = "Account with email: %s was not found";
    private static final String KEY = "exception.account.not_found_by_email";

    public AccountNotFoundByEmailException(String email) {
        super(String.format(MESSAGE, email), KEY);
    }

    public AccountNotFoundByEmailException(String email, Throwable cause) {
        super(String.format(MESSAGE, email), cause, KEY);
    }
}