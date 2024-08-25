package pl.lodz.p.it.socialfridgemicroservice.exception.gradeException;

import pl.lodz.p.it.socialfridgemicroservice.exception.AppBaseException;

public class SameRatingUpdateException extends AppBaseException {
    private static final String MESSAGE = "Attempted to update the rating to the same value: %.2f";
    private static final String KEY = "exception.ratingSameUpdate";

    public SameRatingUpdateException(float rating) {
        super(String.format(MESSAGE, rating), KEY);
    }

    public SameRatingUpdateException(float rating, Throwable cause) {
        super(String.format(MESSAGE, rating), cause, KEY);
    }
}
