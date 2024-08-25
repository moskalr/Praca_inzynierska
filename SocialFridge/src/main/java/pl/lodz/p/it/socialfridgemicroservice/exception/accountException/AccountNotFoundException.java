package pl.lodz.p.it.socialfridgemicroservice.exception.accountException;

import pl.lodz.p.it.socialfridgemicroservice.exception.AppBaseException;

public class AccountNotFoundException extends AppBaseException {
    private static final String ID_MESSAGE = "Account with id: %s was not found";
    private static final String USERNAME_MESSAGE = "Account with username: %s was not found";
    private static final String KEY = "exception.accountNotFound";

    public AccountNotFoundException(Long id) {
        super(String.format(ID_MESSAGE, id), KEY);
    }

    public AccountNotFoundException(String username) {
        super(String.format(USERNAME_MESSAGE, username), KEY);
    }

    public AccountNotFoundException(Long id, Throwable cause) {
        super(String.format(ID_MESSAGE, id), cause, KEY);
    }
}