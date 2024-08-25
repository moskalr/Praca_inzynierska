package pl.lodz.p.it.socialfridgemicroservice.exception.suggestionException;

import pl.lodz.p.it.socialfridgemicroservice.exception.AppBaseException;

public class SuggestionNotFoundException extends AppBaseException {
    private static final String MESSAGE = "Social suggestion with id: %s was not found";
    private static final String KEY = "exception.suggestion.not_found";

    public SuggestionNotFoundException(Long id) {
        super(String.format(MESSAGE, id), KEY);
    }

    public SuggestionNotFoundException(Long id, Throwable cause) {
        super(String.format(MESSAGE, id), cause, KEY);
    }
}
