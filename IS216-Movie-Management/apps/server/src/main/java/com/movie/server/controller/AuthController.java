package com.movie.server.controller;

import com.movie.server.dto.request.ForgotPasswordRequest;
import com.movie.server.dto.request.LoginRequest;
import com.movie.server.dto.request.RegisterRequest;
import com.movie.server.dto.request.ResetPasswordRequest;
import com.movie.server.dto.request.VerifyOtpRequest;
import com.movie.server.dto.response.ApiResponse;
import com.movie.server.dto.response.AuthResponse;
import com.movie.server.entity.User;
import com.movie.server.exception.BadRequestException;
import com.movie.server.repository.UserRepository;
import com.movie.server.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Register, login, and password reset via OTP")
public class AuthController {
    private final AuthService authService;
    private final UserRepository userRepository;

    public AuthController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new customer account")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@RequestBody RegisterRequest request) {
        AuthResponse data = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(LocalDateTime.now(), HttpStatus.CREATED.value(), "Đăng ký thành công", data));
    }

    @PostMapping("/login")
    @Operation(summary = "Login and receive a JWT token")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody LoginRequest request) {
        AuthResponse data = authService.login(request);
        return ResponseEntity.ok(new ApiResponse<>(LocalDateTime.now(), HttpStatus.OK.value(), "Đăng nhập thành công", data));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Send OTP to email for password reset")
    public ResponseEntity<ApiResponse<AuthResponse>> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        AuthResponse data = authService.forgotPassword(request);
        return ResponseEntity.ok(new ApiResponse<>(LocalDateTime.now(), HttpStatus.OK.value(), data.getMessage(), data));
    }

    @PostMapping("/verify-otp")
    @Operation(summary = "Verify password-reset OTP")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyOtp(@RequestBody VerifyOtpRequest request) {
        AuthResponse data = authService.verifyOtp(request);
        return ResponseEntity.ok(new ApiResponse<>(LocalDateTime.now(), HttpStatus.OK.value(), data.getMessage(), data));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password using a verified OTP")
    public ResponseEntity<ApiResponse<AuthResponse>> resetPassword(@RequestBody ResetPasswordRequest request) {
        AuthResponse data = authService.resetPassword(request);
        return ResponseEntity.ok(new ApiResponse<>(LocalDateTime.now(), HttpStatus.OK.value(), data.getMessage(), data));
    }

    @GetMapping("/me")
    @Operation(summary = "Get profile details of the currently authenticated user")
    public ResponseEntity<ApiResponse<AuthResponse>> me(Authentication auth) {
        if (auth == null) throw new BadRequestException("Chưa đăng nhập");
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new com.movie.server.exception.ResourceNotFoundException("User not found"));
        AuthResponse data = AuthResponse.builder()
                .email(user.getEmail())
                .fullName(user.getName())
                .role(user.getRole().name())
                .build();
        return ResponseEntity.ok(new ApiResponse<>(LocalDateTime.now(), HttpStatus.OK.value(), "User info fetched", data));
    }
}
