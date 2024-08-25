package pl.lodz.p.it.socialfridgemicroservice.exception.gradeException;

import pl.lodz.p.it.socialfridgemicroservice.exception.AppBaseException;

public class RatingOutOfRangeException extends AppBaseException {
    private static final String MESSAGE = "Rating value should be between 0 and 5: %.2f";
    private static final String KEY = "exception.ratingOutOfRange";

    public RatingOutOfRangeException(float rating) {
        super(String.format(MESSAGE, rating), KEY);
    }

    public RatingOutOfRangeException(float rating, Throwable cause) {
        super(String.format(MESSAGE, rating), cause, KEY);
    }
}