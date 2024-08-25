package pl.lodz.p.it.socialfridgemicroservice.exception.addressException;

import pl.lodz.p.it.socialfridgemicroservice.exception.AppBaseException;

public class AddressExistException extends AppBaseException {
    private static final String MESSAGE = "Address exist";
    private static final String KEY = "exception.addressExist";

    public AddressExistException() {
        super(String.format(MESSAGE), KEY);
    }

    public AddressExistException(Throwable cause) {
        super(String.format(MESSAGE), cause, KEY);
    }
}