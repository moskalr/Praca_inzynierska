package pl.lodz.p.it.socialfridgemicroservice.exception.productException;

import pl.lodz.p.it.socialfridgemicroservice.exception.AppBaseException;

public class ProductNotFoundException extends AppBaseException {
    private static final String MESSAGE = "Product with id: %s was not found";
    private static final String KEY = "exception.productNotFound";

    public ProductNotFoundException(Long id) {
        super(String.format(MESSAGE, id), KEY);
    }

    public ProductNotFoundException(Long id, Throwable cause) {
        super(String.format(MESSAGE, id), cause, KEY);
    }
}
