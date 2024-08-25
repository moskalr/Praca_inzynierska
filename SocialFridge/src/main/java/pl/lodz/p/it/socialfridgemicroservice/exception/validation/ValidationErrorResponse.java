package pl.lodz.p.it.socialfridgemicroservice.exception.validation;

import pl.lodz.p.it.socialfridgemicroservice.exception.AppBaseException;

import java.util.List;

public class ValidationErrorResponse extends AppBaseException {
    private static final String MESSAGE = "Provided data is not valid";
    private static final String KEY = "exception.validation_failure";
    private final List<String> errors;

    public ValidationErrorResponse(List<String> errors) {
        super(MESSAGE, KEY);
        this.errors = errors;
    }

    public ValidationErrorResponse(Throwable cause, List<String> errors) {
        super(MESSAGE, cause, KEY);
        this.errors = errors;
    }
}
