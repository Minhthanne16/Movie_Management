package com.movie.server.controller;

import com.movie.server.dto.request.StaffRequest;
import com.movie.server.dto.response.ApiResponse;
import com.movie.server.dto.response.StaffResponse;
import com.movie.server.service.StaffService;
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
@RequestMapping("/api/staff")
@Tag(name = "Staff Accounts", description = "Staff account management (ADMIN only)")
@SecurityRequirement(name = "bearerAuth")
public class StaffController {
    private final StaffService staffService;

    public StaffController(StaffService staffService) {
        this.staffService = staffService;
    }

    @GetMapping
    @Operation(summary = "List all staff accounts")
    public ResponseEntity<ApiResponse<List<StaffResponse>>> findAllStaff() {
        return ResponseEntity.ok(new ApiResponse<>(
                LocalDateTime.now(),
                HttpStatus.OK.value(),
                "Staff list fetched successfully",
                staffService.findAllStaff()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get staff account by ID")
    public ResponseEntity<ApiResponse<StaffResponse>> findStaffById(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(
                LocalDateTime.now(),
                HttpStatus.OK.value(),
                "Staff fetched successfully",
                staffService.findStaffById(id)));
    }

    @PostMapping
    @Operation(summary = "Create a new staff account")
    public ResponseEntity<ApiResponse<StaffResponse>> createStaff(@RequestBody StaffRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(
                LocalDateTime.now(),
                HttpStatus.CREATED.value(),
                "Staff account created successfully",
                staffService.createStaff(request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update staff account info or reset password")
    public ResponseEntity<ApiResponse<StaffResponse>> updateStaff(
            @PathVariable Long id,
            @RequestBody StaffRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(
                LocalDateTime.now(),
                HttpStatus.OK.value(),
                "Staff account updated successfully",
                staffService.updateStaff(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft-delete (deactivate) a staff account")
    public ResponseEntity<ApiResponse<Object>> deleteStaff(@PathVariable Long id) {
        staffService.deleteStaff(id);
        return ResponseEntity.ok(new ApiResponse<>(
                LocalDateTime.now(),
                HttpStatus.OK.value(),
                "Staff account deleted successfully",
                null));
    }
}
