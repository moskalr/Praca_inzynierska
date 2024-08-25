package pl.lodz.p.it.socialfridgemicroservice.exception.eTag;

import pl.lodz.p.it.socialfridgemicroservice.exception.AppBaseException;

public class OutdatedDataException extends AppBaseException {
    private static final String MESSAGE = "The data has changed resulting in different etags";
    private static final String KEY = "exception.outdated_data";

    public OutdatedDataException() {
        super(MESSAGE, KEY);
    }

    public OutdatedDataException(Throwable cause) {
        super(MESSAGE, cause, KEY);
    }
}

