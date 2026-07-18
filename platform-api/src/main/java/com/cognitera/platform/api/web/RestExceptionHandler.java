package com.cognitera.platform.api.web;

import com.cognitera.platform.api.dto.ErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.time.Instant;

/**
 * Global exception handler that maps common exceptions to structured error responses.
 */
@RestControllerAdvice
public class RestExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(RestExceptionHandler.class);

    /**
     * Handles authentication failures, returning a 401 response.
     */
    @ExceptionHandler(BadCredentialsException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ErrorResponse handleBadCredentials(BadCredentialsException ex) {
        return response(HttpStatus.UNAUTHORIZED, "Unauthorized", ex.getMessage());
    }

    /**
     * Handles validation failures, returning a 422 response
     * with German field-level error messages.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
    public ErrorResponse handleValidation(MethodArgumentNotValidException ex) {
        var fieldErrors = new java.util.LinkedHashMap<String, String>();
        ex.getBindingResult().getFieldErrors().forEach(fe -> {
            String msg = fe.getDefaultMessage();
            fieldErrors.put(fe.getField(),
                    msg != null ? translateValidationMessage(msg) : "Ungültiger Wert");
        });
        return new ErrorResponse(Instant.now(), 422,
                "Validierungsfehler",
                "Die Eingabe enthält ungültige Werte. Bitte korrigieren Sie die markierten Felder.",
                null, fieldErrors);
    }

    /**
     * Handles illegal arguments, returning a 400 response.
     */
    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleBadRequest(IllegalArgumentException ex) {
        return response(HttpStatus.BAD_REQUEST, "Ungültige Anfrage", ex.getMessage());
    }

    /** Translates common Jakarta Validation messages to German. */
    private static String translateValidationMessage(String msg) {
        if (msg == null) return null;
        return msg
                .replace("must not be blank", "darf nicht leer sein")
                .replace("must not be null", "darf nicht null sein")
                .replace("must not be empty", "darf nicht leer sein")
                .replace("size must be between", "die Größe muss zwischen")
                .replace("must be a well-formed email address", "muss eine gültige E-Mail-Adresse sein")
                .replace("must be greater than or equal to", "muss mindestens")
                .replace("must be less than or equal to", "darf höchstens")
                .replace("Failed to convert property value", "Ungültiger Wert für Feld");
    }

    /**
     * Handles file uploads that exceed the maximum allowed size, returning a 413 response.
     */
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    @ResponseStatus(HttpStatus.PAYLOAD_TOO_LARGE)
    public ErrorResponse handleMaxUploadSize(MaxUploadSizeExceededException ex) {
        return response(HttpStatus.PAYLOAD_TOO_LARGE, "Payload Too Large",
                "File size exceeds the maximum allowed upload size. Max file size: "
                        + ex.getMaxUploadSize() + " bytes.");
    }

    /**
     * Handles multipart file upload failures, returning a 400 response.
     */
    @ExceptionHandler(MultipartException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleMultipart(MultipartException ex) {
        return response(HttpStatus.BAD_REQUEST, "Bad Request",
                "File upload failed: " + ex.getMessage());
    }

    /**
     * Catches all unhandled exceptions and returns a 500 response with stacktrace details.
     */
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ErrorResponse handleAll(Exception ex) {
        log.error("Unhandled exception", ex);
        return responseWithStacktrace(HttpStatus.INTERNAL_SERVER_ERROR,
                "Internal Server Error", ex);
    }

    private ErrorResponse response(HttpStatus status, String error, String message) {
        return new ErrorResponse(Instant.now(), status.value(), error, message, null);
    }

    private ErrorResponse responseWithStacktrace(HttpStatus status, String error, Exception ex) {
        StringWriter sw = new StringWriter();
        ex.printStackTrace(new PrintWriter(sw));
        return new ErrorResponse(Instant.now(), status.value(), error, ex.getMessage(), sw.toString());
    }
}
