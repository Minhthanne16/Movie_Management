package com.movie.server.controller;

import com.movie.server.dto.request.ShowtimeRequest;
import com.movie.server.dto.response.ApiResponse;
import com.movie.server.dto.response.ShowtimeResponse;
import com.movie.server.service.ShowtimeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/showtimes")
@Tag(name = "Showtimes", description = "Showtime scheduling and lookup (ADMIN write, all roles read)")
@SecurityRequirement(name = "bearerAuth")
public class ShowtimeController {

    private final ShowtimeService showtimeService;

    public ShowtimeController(ShowtimeService showtimeService) {
        this.showtimeService = showtimeService;
    }

    @GetMapping
    @Operation(summary = "List showtimes with optional date-range filter")
    public ResponseEntity<ApiResponse<List<ShowtimeResponse>>> findAll(
            @Parameter(description = "Filter by movie ID") @RequestParam(required = false) Long movieId,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
                    LocalDateTime from,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
                    LocalDateTime to) {
        List<ShowtimeResponse> showtimes = showtimeService.findAll(movieId, from, to);
        return ResponseEntity.ok(
                new ApiResponse<>(LocalDateTime.now(), HttpStatus.OK.value(), "Showtimes fetched", showtimes));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get showtime by ID")
    public ResponseEntity<ApiResponse<ShowtimeResponse>> findById(@PathVariable Long id) {
        ShowtimeResponse response = showtimeService.findById(id);
        return ResponseEntity.ok(
                new ApiResponse<>(LocalDateTime.now(), HttpStatus.OK.value(), "Showtime fetched", response));
    }

    @PostMapping
    @Operation(summary = "Create a showtime — validates room conflicts (ADMIN only)")
    public ResponseEntity<ApiResponse<ShowtimeResponse>> create(@RequestBody ShowtimeRequest request) {
        ShowtimeResponse response = showtimeService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(LocalDateTime.now(), HttpStatus.CREATED.value(), "Showtime created", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a showtime (ADMIN only)")
    public ResponseEntity<ApiResponse<ShowtimeResponse>> update(
            @PathVariable Long id, @RequestBody ShowtimeRequest request) {
        ShowtimeResponse response = showtimeService.update(id, request);
        return ResponseEntity.ok(
                new ApiResponse<>(LocalDateTime.now(), HttpStatus.OK.value(), "Showtime updated", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft-delete a showtime (ADMIN only)")
    public ResponseEntity<ApiResponse<Object>> delete(@PathVariable Long id) {
        showtimeService.softDelete(id);
        return ResponseEntity.ok(
                new ApiResponse<>(LocalDateTime.now(), HttpStatus.OK.value(), "Showtime deleted", null));
    }
}
