package pl.lodz.p.it.socialfridgemicroservice.global;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.server.ResponseStatusException;
import pl.lodz.p.it.socialfridgemicroservice.exception.CustomResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestControllerAdvice
public class RestControllerAdvisor {
    private static final String KEY = "key";
    private static final String STATUS = "status";
    private static final String ERROR = "error";
    private static final String ERRORS = "errors";
    private static final String UNHANDLED_EXCEPTION = "exception.unhandled_exception";
    private static final String REASON = "reason";
    private static final String REQUEST = "request";
    private static final String STRING_FORMAT = "%s: %s";
    private static final String RESPONSE_EXCEPTION =
            "An application exception occurred, resulting in ResponseStatusException being thrown";
    private static final String EXCEPTION_OCCURRED = "An unexpected exception occurred during processing: ";
    private static final String VALIDATION_ERROR = "A validation exception occurred during processing: ";
    private static final Logger log = LoggerFactory.getLogger(RestControllerAdvisor.class);


    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, List<String>>> handleValidationErrors(MethodArgumentNotValidException ex) {
        List<String> errors = ex.getBindingResult().getFieldErrors()
                .stream()
                .map(error -> String.format(
                        STRING_FORMAT, error.getField(),
                        error.getDefaultMessage())).toList();
        return new ResponseEntity<>(getErrorsMap(errors), new HttpHeaders(), HttpStatus.BAD_REQUEST);
    }

    public static Map<String, Object> getErrorBody(HttpStatus httpStatus, String reason, String request, String key) {
        Map<String, Object> errorBody = new HashMap<>();
        errorBody.put(REASON, reason);
        errorBody.put(STATUS, httpStatus.value());
        errorBody.put(ERROR, httpStatus.getReasonPhrase());
        errorBody.put(KEY, key);
        errorBody.put(REQUEST, request);
        return errorBody;
    }

    private Map<String, List<String>> getErrorsMap(List<String> errors) {
        Map<String, List<String>> errorResponse = new HashMap<>();
        errorResponse.put(ERRORS, errors);
        return errorResponse;
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Object> handleResponseStatusException(ResponseStatusException exception, WebRequest request) {
        log.error(RESPONSE_EXCEPTION, exception);
        HttpStatus httpStatus = HttpStatus.valueOf(exception.getStatusCode().value());
        String key = UNHANDLED_EXCEPTION;
        if (exception instanceof CustomResponseStatusException) {
            key = ((CustomResponseStatusException) exception).getKey();
        }
        Map<String, Object> body = getErrorBody(
                httpStatus, exception.getReason(),
                request.getDescription(true),
                key);

        return new ResponseEntity<>(body, httpStatus);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleDefaultException(Exception exception, WebRequest request) {
        log.error(EXCEPTION_OCCURRED, exception);
        HttpStatus httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        String key = UNHANDLED_EXCEPTION;
        if (exception instanceof CustomResponseStatusException) {
            key = ((CustomResponseStatusException) exception).getKey();
        }
        Map<String, Object> body = getErrorBody(
                httpStatus, exception.getMessage(),
                request.getDescription(true),
                key);

        return new ResponseEntity<>(body, httpStatus);
    }
}
