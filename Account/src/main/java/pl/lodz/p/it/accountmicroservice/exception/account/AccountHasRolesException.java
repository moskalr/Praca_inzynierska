package pl.lodz.p.it.accountmicroservice.exception.account;

import pl.lodz.p.it.accountmicroservice.exception.AppBaseException;
import java.util.List;

public class AccountHasRolesException extends AppBaseException {
    private static final String MESSAGE = "Account with id: %1$s has roles: %2$s";
    private static final String KEY = "exception.account.has_no_roles";

    public AccountHasRolesException(String username, List<String> roles) {
        super(String.format(MESSAGE, username, roles), KEY);
    }

    public AccountHasRolesException(String username, List<String> roles, Throwable cause) {
        super(String.format(MESSAGE, username, roles), cause, KEY);
    }
}
