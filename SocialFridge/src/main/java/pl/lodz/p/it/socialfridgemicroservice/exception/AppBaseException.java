package pl.lodz.p.it.socialfridgemicroservice.exception;

public class AppBaseException extends Exception {
    private final String key;

    protected AppBaseException(String message, String key) {
        super(message);
        this.key = key;
    }

    protected AppBaseException(String message, Throwable cause, String key) {
        super(message, cause);
        this.key = key;
    }

    public String getKey() {
        return key;
    }
}
