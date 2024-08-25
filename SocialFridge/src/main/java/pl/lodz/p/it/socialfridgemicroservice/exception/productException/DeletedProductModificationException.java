package pl.lodz.p.it.socialfridgemicroservice.exception.productException;

import pl.lodz.p.it.socialfridgemicroservice.exception.AppBaseException;

public class DeletedProductModificationException extends AppBaseException {
    private static final String MESSAGE = "Attempted to modify a deleted product with id: %s";
    private static final String KEY = "exception.productDeletedModification";

    public DeletedProductModificationException(Long id) {
        super(String.format(MESSAGE, id), KEY);
    }

    public DeletedProductModificationException(Long id, Throwable cause) {
        super(String.format(MESSAGE, id), cause, KEY);
    }
}