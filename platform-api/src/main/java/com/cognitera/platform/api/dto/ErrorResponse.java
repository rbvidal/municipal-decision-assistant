package com.cognitera.platform.api.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.Map;

/**
 * Standard error response body for REST API error responses.
 * Includes optional field-level validation errors and a stacktrace for debugging.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
        Instant timestamp,
        int status,
        String error,
        String message,
        String stacktrace,
        Map<String, String> fieldErrors
) {
    public ErrorResponse(Instant timestamp, int status, String error, String message, String stacktrace) {
        this(timestamp, status, error, message, stacktrace, null);
    }
}
