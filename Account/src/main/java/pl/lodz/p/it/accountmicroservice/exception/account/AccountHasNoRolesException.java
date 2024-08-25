package pl.lodz.p.it.accountmicroservice.exception.account;

import pl.lodz.p.it.accountmicroservice.exception.AppBaseException;
import java.util.List;

public class AccountHasNoRolesException extends AppBaseException {
    private static final String MESSAGE = "Account with id: %1$s has no roles: %2$s";
    private static final String KEY = "exception.account.has_roles";

    public AccountHasNoRolesException(String username, List<String> roles) {
        super(String.format(MESSAGE, username, roles), KEY);
    }

    public AccountHasNoRolesException(String username, List<String> roles, Throwable cause) {
        super(String.format(MESSAGE, username, roles), cause, KEY);
    }
}
