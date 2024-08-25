package pl.lodz.p.it.accountmicroservice.exception.account;

import pl.lodz.p.it.accountmicroservice.exception.AppBaseException;
import java.util.List;

public class NotAllowedRolesException extends AppBaseException {
    private static final String MESSAGE = "Account with username: %1$s can not add roles: %2$s";
    private static final String KEY = "exception.not_allowed_roles";

    public NotAllowedRolesException(String username, List<String> roles) {
        super(String.format(MESSAGE, username, roles), KEY);
    }

    public NotAllowedRolesException(String username, List<String> roles, Throwable cause) {
        super(String.format(MESSAGE, username, roles), cause, KEY);
    }
}
