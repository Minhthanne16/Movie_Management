package com.movie.server.controller;

import com.movie.server.dto.request.TheaterRoomRequest;
import com.movie.server.dto.response.ApiResponse;
import com.movie.server.dto.response.TheaterRoomResponse;
import com.movie.server.service.TheaterRoomService;
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
@RequestMapping("/api/theater-rooms")
@Tag(name = "Theater Rooms", description = "Screening room and seat map management (ADMIN only)")
@SecurityRequirement(name = "bearerAuth")
public class TheaterRoomController {

    private final TheaterRoomService theaterRoomService;

    public TheaterRoomController(TheaterRoomService theaterRoomService) {
        this.theaterRoomService = theaterRoomService;
    }

    @GetMapping
    @Operation(summary = "List all theater rooms")
    public ResponseEntity<ApiResponse<List<TheaterRoomResponse>>> findAll() {
        List<TheaterRoomResponse> rooms = theaterRoomService.findAll();
        return ResponseEntity.ok(
                new ApiResponse<>(LocalDateTime.now(), HttpStatus.OK.value(), "Theater rooms fetched", rooms));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get theater room by ID")
    public ResponseEntity<ApiResponse<TheaterRoomResponse>> findById(@PathVariable Long id) {
        TheaterRoomResponse room = theaterRoomService.findById(id);
        return ResponseEntity.ok(
                new ApiResponse<>(LocalDateTime.now(), HttpStatus.OK.value(), "Theater room fetched", room));
    }

    @PostMapping
    @Operation(summary = "Create a new theater room")
    public ResponseEntity<ApiResponse<TheaterRoomResponse>> create(@RequestBody TheaterRoomRequest request) {
        TheaterRoomResponse room = theaterRoomService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(LocalDateTime.now(), HttpStatus.CREATED.value(), "Theater room created", room));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update theater room configuration")
    public ResponseEntity<ApiResponse<TheaterRoomResponse>> update(
            @PathVariable Long id, @RequestBody TheaterRoomRequest request) {
        TheaterRoomResponse room = theaterRoomService.update(id, request);
        return ResponseEntity.ok(
                new ApiResponse<>(LocalDateTime.now(), HttpStatus.OK.value(), "Theater room updated", room));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft-delete a theater room")
    public ResponseEntity<ApiResponse<Object>> delete(@PathVariable Long id) {
        theaterRoomService.softDelete(id);
        return ResponseEntity.ok(
                new ApiResponse<>(LocalDateTime.now(), HttpStatus.OK.value(), "Theater room deleted", null));
    }
}
