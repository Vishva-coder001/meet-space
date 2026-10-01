package com.meetspace.exception;

import com.meetspace.dto.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log =
            LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ApiException.class)
    ResponseEntity<ApiResponse<Void>> api(ApiException e) {
        return ResponseEntity
                .status(e.status())
                .body(ApiResponse.error(
                        e.code(),
                        e.getMessage(),
                        List.of()
                ));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiResponse<Void>> validation(
            MethodArgumentNotValidException e) {

        var x = e.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(f -> f.getField() + ": " + f.getDefaultMessage())
                .toList();

        return ResponseEntity
                .badRequest()
                .body(ApiResponse.error(
                        "VALIDATION_ERROR",
                        "Validation failed",
                        x
                ));
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ApiResponse<Void>> unknown(Exception e) {

        log.error("Unhandled exception while processing request", e);

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(
                        "INTERNAL_ERROR",
                        "An unexpected error occurred",
                        List.of()
                ));
    }
}