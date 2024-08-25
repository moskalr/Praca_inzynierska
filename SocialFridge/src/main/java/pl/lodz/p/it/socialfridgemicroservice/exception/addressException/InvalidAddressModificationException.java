package pl.lodz.p.it.socialfridgemicroservice.exception.addressException;

import pl.lodz.p.it.socialfridgemicroservice.exception.AppBaseException;

public class InvalidAddressModificationException extends AppBaseException {
    private static final String MESSAGE = "Invalid modification data for address";
    private static final String KEY = "exception.addressInvalidModification";

    public InvalidAddressModificationException() {
        super(MESSAGE, KEY);
    }

    public InvalidAddressModificationException(Throwable cause) {
        super(MESSAGE, cause, KEY);
    }
}