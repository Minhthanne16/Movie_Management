package com.movie.server.service;

import com.movie.server.dto.request.StaffRequest;
import com.movie.server.dto.response.StaffResponse;
import com.movie.server.entity.User;
import com.movie.server.enums.Role;
import com.movie.server.exception.BadRequestException;
import com.movie.server.exception.ResourceNotFoundException;
import com.movie.server.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class StaffService {
    private static final String ADMIN_ACTOR = "ADMIN";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public StaffService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // AD-801: Lấy danh sách tất cả staff
    public List<StaffResponse> findAllStaff() {
        return userRepository.findAll()
                .stream()
                .filter(user -> user.getRole() != Role.CUSTOMER && user.getDeletedAt() == null)
                .map(this::toResponse)
                .toList();
    }

    // Lấy staff theo id
    public StaffResponse findStaffById(Long id) {
        User user = userRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with id: " + id));
        
        if (user.getRole() == Role.CUSTOMER) {
            throw new BadRequestException("User is not a staff member");
        }
        
        return toResponse(user);
    }

    // AD-801: Tạo tài khoản staff mới
    public StaffResponse createStaff(StaffRequest request) {
        validateStaffRequest(request);

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists: " + request.getEmail());
        }

        User staff = new User();
        staff.setName(request.getName());
        staff.setEmail(request.getEmail());
        staff.setPassword(passwordEncoder.encode(request.getPassword()));
        staff.setPhone(request.getPhone());
        staff.setRole(Role.valueOf(request.getRole().toUpperCase()));
        staff.setShift(request.getShift() != null ? request.getShift() : "Flexible");
        staff.setStatus(request.getStatus() != null ? request.getStatus() : "Offline");
        staff.setEnabled(true);

        LocalDateTime now = LocalDateTime.now();
        staff.setCreatedAt(now);
        staff.setCreatedBy(ADMIN_ACTOR);
        staff.setUpdatedAt(now);
        staff.setUpdatedBy(ADMIN_ACTOR);

        return toResponse(userRepository.save(staff));
    }

    // AD-802: Cập nhật thông tin staff
    public StaffResponse updateStaff(Long id, StaffRequest request) {
        User staff = userRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with id: " + id));

        if (staff.getRole() == Role.CUSTOMER) {
            throw new BadRequestException("User is not a staff member");
        }

        // Validate email uniqueness (nếu email được thay đổi)
        if (request.getEmail() != null && !request.getEmail().equals(staff.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new BadRequestException("Email already exists: " + request.getEmail());
            }
            staff.setEmail(request.getEmail());
        }

        if (request.getName() != null && !request.getName().isBlank()) {
            staff.setName(request.getName());
        }

        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            staff.setPhone(request.getPhone());
        }

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            staff.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        if (request.getRole() != null && !request.getRole().isBlank()) {
            try {
                staff.setRole(Role.valueOf(request.getRole().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid role: " + request.getRole());
            }
        }

        if (request.getShift() != null && !request.getShift().isBlank()) {
            staff.setShift(request.getShift());
        }

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            staff.setStatus(request.getStatus());
        }

        LocalDateTime now = LocalDateTime.now();
        staff.setUpdatedAt(now);
        staff.setUpdatedBy(ADMIN_ACTOR);

        return toResponse(userRepository.save(staff));
    }

    // Xóa staff (soft delete)
    public void deleteStaff(Long id) {
        User staff = userRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with id: " + id));

        if (staff.getRole() == Role.CUSTOMER) {
            throw new BadRequestException("User is not a staff member");
        }

        LocalDateTime now = LocalDateTime.now();
        staff.setDeletedAt(now);
        staff.setDeletedBy(ADMIN_ACTOR);

        userRepository.save(staff);
    }

    private void validateStaffRequest(StaffRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new BadRequestException("Staff name is required");
        }
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new BadRequestException("Staff email is required");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new BadRequestException("Staff password is required");
        }
        if (request.getRole() == null || request.getRole().isBlank()) {
            throw new BadRequestException("Staff role is required");
        }
        
        // Validate email format
        if (!request.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new BadRequestException("Invalid email format");
        }
        
        // Validate role
        try {
            Role.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid role: " + request.getRole());
        }
    }

    private StaffResponse toResponse(User user) {
        return new StaffResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole().name(),
                user.getShift(),
                user.getStatus(),
                user.isEnabled(),
                user.getCreatedAt(),
                user.getCreatedBy(),
                user.getUpdatedAt(),
                user.getUpdatedBy());
    }
}
