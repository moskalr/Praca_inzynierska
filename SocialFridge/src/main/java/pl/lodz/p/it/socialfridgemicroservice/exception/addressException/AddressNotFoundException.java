package pl.lodz.p.it.socialfridgemicroservice.exception.addressException;

import pl.lodz.p.it.socialfridgemicroservice.exception.AppBaseException;

public class AddressNotFoundException extends AppBaseException {
    private static final String MESSAGE = "Address with id: %s was not found";
    private static final String KEY = "exception.address.not_found";

    public AddressNotFoundException(Long id) {
        super(String.format(MESSAGE, id), KEY);
    }

    public AddressNotFoundException(Long id, Throwable cause) {
        super(String.format(MESSAGE, id), cause, KEY);
    }
}