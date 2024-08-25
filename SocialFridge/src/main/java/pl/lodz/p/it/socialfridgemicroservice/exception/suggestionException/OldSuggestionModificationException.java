package pl.lodz.p.it.socialfridgemicroservice.exception.suggestionException;

import pl.lodz.p.it.socialfridgemicroservice.exception.AppBaseException;

public class OldSuggestionModificationException extends AppBaseException {
    private static final String MESSAGE = "Attempting to modify an old suggestion with id: %s";
    private static final String KEY = "exception.suggestion.old_modification";

    public OldSuggestionModificationException(Long id) {
        super(String.format(MESSAGE, id), KEY);
    }

    public OldSuggestionModificationException(Long id, Throwable cause) {
        super(String.format(MESSAGE, id), cause, KEY);
    }
}