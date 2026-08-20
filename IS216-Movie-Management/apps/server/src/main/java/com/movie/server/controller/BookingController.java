package com.movie.server.controller;

import com.movie.server.dto.request.BookingRequest;
import com.movie.server.dto.response.ApiResponse;
import com.movie.server.dto.response.BookingResponse;
import com.movie.server.service.BookingService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bookings")
@Tag(name = "Bookings", description = "Seat reservation and booking management")
@SecurityRequirement(name = "bearerAuth")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> create(
            @RequestBody BookingRequest request, Authentication auth) {
        BookingResponse response = bookingService.create(request, auth.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(LocalDateTime.now(), HttpStatus.CREATED.value(),
                        "Booking created", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(LocalDateTime.now(), HttpStatus.OK.value(),
                "Booking fetched", bookingService.findById(id)));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> myBookings(Authentication auth) {
        return ResponseEntity.ok(new ApiResponse<>(LocalDateTime.now(), HttpStatus.OK.value(),
                "Bookings fetched", bookingService.findMyBookings(auth.getName())));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<BookingResponse>> cancel(
            @PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(new ApiResponse<>(LocalDateTime.now(), HttpStatus.OK.value(),
                "Booking cancelled", bookingService.cancel(id, auth.getName())));
    }
}
