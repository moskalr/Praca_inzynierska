package pl.lodz.p.it.accountmicroservice.exception.account;

import pl.lodz.p.it.accountmicroservice.exception.AppBaseException;

public class LanguageIsAlreadyInUseException extends AppBaseException {
    private static final String MESSAGE = "The language is already in use.";
    private static final String KEY = "exception.account.language_is_already_in_use";

    public LanguageIsAlreadyInUseException(String language) {
        super(String.format(MESSAGE, language), KEY);
    }

    public LanguageIsAlreadyInUseException(String language, Throwable cause) {
        super(String.format(MESSAGE, language), cause, KEY);
    }
}
