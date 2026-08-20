package com.movie.server.dto.response;

import java.time.LocalDateTime;

public class ApiResponse<T> {
    private LocalDateTime timestamp;
    private int code;
    private String message;
    private T data;

    public ApiResponse(LocalDateTime timestamp, int code, String message, T data) {
        this.timestamp = timestamp;
        this.code = code;
        this.message = message;
        this.data = data;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public int getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }

    public T getData() {
        return data;
    }
}
