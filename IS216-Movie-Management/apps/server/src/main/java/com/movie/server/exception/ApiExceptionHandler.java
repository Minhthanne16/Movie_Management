package com.movie.server.exception;

import com.movie.server.dto.response.ApiResponse;
import java.time.LocalDateTime;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(LocalDateTime.now(), HttpStatus.NOT_FOUND.value(), ex.getMessage(), null));
    }

    @ExceptionHandler({BadRequestException.class, DataIntegrityViolationException.class})
    public ResponseEntity<ApiResponse<Object>> handleBadRequest(Exception ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>(LocalDateTime.now(), HttpStatus.BAD_REQUEST.value(), ex.getMessage(), null));
    }
}
