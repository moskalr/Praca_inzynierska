package pl.lodz.p.it.accountmicroservice.global;

import pl.lodz.p.it.accountmicroservice.exception.validation.ValidationErrorResponse;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@RestControllerAdvice
public class RestControllerAdvisor extends ResponseEntityExceptionHandler {
    private static final String STATUS = "status";
    private static final String ERROR = "error";
    private static final String REASON = "reason";
    private static final String REQUEST = "request";
    private static final String RESPONSE_EXCEPTION =
            "An application exception occurred, resulting in ResponseStatusException being thrown";
    private static final String EXCEPTION_OCCURRED = "An unexpected exception occurred during processing: ";
    private static final String VALIDATION_ERROR = "A validation exception occurred during processing: ";
    private static final Logger log = LoggerFactory.getLogger(RestControllerAdvisor.class);

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Object> handleResponseStatusException(ResponseStatusException exception, WebRequest request) {
        log.error(RESPONSE_EXCEPTION, exception);
        HttpStatus httpStatus = HttpStatus.valueOf(exception.getStatusCode().value());
        Map<String, Object> body = getErrorBody(
                httpStatus, exception.getMessage(),
                request.getDescription(true)
        );

        return new ResponseEntity<>(body, httpStatus);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleDefaultException(Exception exception, WebRequest request) {
        log.error(EXCEPTION_OCCURRED, exception);
        HttpStatus httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        Map<String, Object> body = getErrorBody(
                httpStatus, exception.getMessage(),
                request.getDescription(true)
        );

        return new ResponseEntity<>(body, httpStatus);
    }

    @Override
    public ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException exception,
            HttpHeaders headers,
            HttpStatusCode status,
            WebRequest request) {
        log.error(VALIDATION_ERROR, exception);
        List<String> errors = exception.getBindingResult().getFieldErrors()
                .stream()
                .map(error -> String.format(
                        "%s: %s", error.getField(),
                        error.getDefaultMessage()))
                .toList();
        ValidationErrorResponse errorResponse = new ValidationErrorResponse(errors);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    public static Map<String, Object> getErrorBody(HttpStatus httpStatus, String reason, String request) {
        Map<String, Object> errorBody = new HashMap<>();
        errorBody.put(STATUS, httpStatus.value());
        errorBody.put(ERROR, httpStatus.getReasonPhrase());
        errorBody.put(REASON, reason);
        errorBody.put(REQUEST, request);
        return errorBody;
    }
}
