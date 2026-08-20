package com.movie.server.service;

import com.movie.server.dto.request.ForgotPasswordRequest;
import com.movie.server.dto.request.LoginRequest;
import com.movie.server.dto.request.RegisterRequest;
import com.movie.server.dto.request.ResetPasswordRequest;
import com.movie.server.dto.request.VerifyOtpRequest;
import com.movie.server.dto.response.AuthResponse;
import com.movie.server.entity.User;
import com.movie.server.enums.Role;
import com.movie.server.exception.BadRequestException;
import com.movie.server.repository.UserRepository;
import com.movie.server.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Random;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailService = emailService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email đã tồn tại");
        }
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.CUSTOMER);
        user.setCreatedAt(LocalDateTime.now());
        userRepository.save(user);
        return AuthResponse.builder().message("Đăng ký thành công").build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new BadRequestException("Email hoặc mật khẩu không đúng"));
        if (user.getDeletedAt() != null) {
            throw new BadRequestException("Tài khoản không tồn tại");
        }
        if (!user.isEnabled()) {
            throw new BadRequestException("Tài khoản đã bị khóa");
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Email hoặc mật khẩu không đúng");
        }
        String token = jwtService.generateToken(user);
        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .fullName(user.getName())
                .role(user.getRole().name())
                .message("Đăng nhập thành công")
                .build();
    }

    public AuthResponse forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.getEmail().toLowerCase()).ifPresent(user -> {
            if (user.getDeletedAt() == null && user.isEnabled()) {
                String otp = String.format("%06d", new Random().nextInt(999999));
                user.setOtpCode(otp);
                user.setOtpExpiredAt(LocalDateTime.now().plusMinutes(10));
                userRepository.save(user);
                emailService.sendOtpEmail(user.getEmail(), otp);
            }
        });
        return AuthResponse.builder().message("Nếu email tồn tại, OTP đã được gửi").build();
    }

    public AuthResponse verifyOtp(VerifyOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new BadRequestException("Email không tồn tại"));
        if (user.getOtpCode() == null || !user.getOtpCode().equals(request.getOtp())) {
            throw new BadRequestException("OTP không hợp lệ");
        }
        if (user.getOtpExpiredAt() == null || user.getOtpExpiredAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("OTP đã hết hạn");
        }
        return AuthResponse.builder().message("OTP hợp lệ").build();
    }

    public AuthResponse resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new BadRequestException("Email không tồn tại"));
        if (user.getOtpCode() == null || !user.getOtpCode().equals(request.getOtp())) {
            throw new BadRequestException("OTP không hợp lệ");
        }
        if (user.getOtpExpiredAt() == null || user.getOtpExpiredAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("OTP đã hết hạn");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setOtpCode(null);
        user.setOtpExpiredAt(null);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        return AuthResponse.builder().message("Đổi mật khẩu thành công").build();
    }
}
