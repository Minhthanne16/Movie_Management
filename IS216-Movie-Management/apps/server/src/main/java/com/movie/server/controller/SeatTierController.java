package com.movie.server.controller;

import com.movie.server.dto.request.SeatTierRequest;
import com.movie.server.dto.response.ApiResponse;
import com.movie.server.dto.response.SeatTierResponse;
import com.movie.server.service.SeatTierService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/seat-tiers")
@Tag(name = "Seat Tiers", description = "Seat categories: Regular, VIP, Couple (ADMIN write)")
@SecurityRequirement(name = "bearerAuth")
public class SeatTierController {

    private final SeatTierService seatTierService;

    public SeatTierController(SeatTierService seatTierService) {
        this.seatTierService = seatTierService;
    }

    @GetMapping
    @Operation(summary = "List all seat tiers")
    public ResponseEntity<ApiResponse<List<SeatTierResponse>>> findAll() {
        List<SeatTierResponse> tiers = seatTierService.findAll();
        return ResponseEntity.ok(
                new ApiResponse<>(LocalDateTime.now(), HttpStatus.OK.value(), "Seat tiers fetched", tiers));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get seat tier by ID")
    public ResponseEntity<ApiResponse<SeatTierResponse>> findById(@PathVariable Long id) {
        SeatTierResponse tier = seatTierService.findById(id);
        return ResponseEntity.ok(
                new ApiResponse<>(LocalDateTime.now(), HttpStatus.OK.value(), "Seat tier fetched", tier));
    }

    @PostMapping
    @Operation(summary = "Create a new seat tier (ADMIN)")
    public ResponseEntity<ApiResponse<SeatTierResponse>> create(@RequestBody SeatTierRequest request) {
        SeatTierResponse tier = seatTierService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(LocalDateTime.now(), HttpStatus.CREATED.value(), "Seat tier created", tier));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update seat tier (ADMIN)")
    public ResponseEntity<ApiResponse<SeatTierResponse>> update(
            @PathVariable Long id, @RequestBody SeatTierRequest request) {
        SeatTierResponse tier = seatTierService.update(id, request);
        return ResponseEntity.ok(
                new ApiResponse<>(LocalDateTime.now(), HttpStatus.OK.value(), "Seat tier updated", tier));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft-delete a seat tier (ADMIN)")
    public ResponseEntity<ApiResponse<Object>> delete(@PathVariable Long id) {
        seatTierService.softDelete(id);
        return ResponseEntity.ok(
                new ApiResponse<>(LocalDateTime.now(), HttpStatus.OK.value(), "Seat tier deleted", null));
    }
}
