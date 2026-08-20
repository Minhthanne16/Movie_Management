package com.movie.server.service;

import com.movie.server.dto.request.SeatTierRequest;
import com.movie.server.dto.response.SeatTierResponse;
import com.movie.server.exception.BadRequestException;
import com.movie.server.exception.ResourceNotFoundException;
import com.movie.server.entity.SeatTier;
import com.movie.server.repository.SeatTierRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class SeatTierService {
    private static final String UNKNOWN_ACTOR = "UNKNOWN";

    private final SeatTierRepository seatTierRepository;

    public SeatTierService(SeatTierRepository seatTierRepository) {
        this.seatTierRepository = seatTierRepository;
    }

    public List<SeatTierResponse> findAll() {
        return seatTierRepository.findByDeletedAtIsNull().stream().map(this::toResponse).toList();
    }

    public SeatTierResponse findById(Long id) {
        return toResponse(getActiveTier(id));
    }

    public SeatTierResponse create(SeatTierRequest request) {
        validate(request);
        LocalDateTime now = LocalDateTime.now();
        SeatTier tier = new SeatTier();
        tier.setName(request.getName().trim());
        tier.setPriceMultiplier(request.getPriceMultiplier());
        tier.setDescription(request.getDescription());
        tier.setCreatedAt(now);
        tier.setCreatedBy(UNKNOWN_ACTOR);
        tier.setUpdatedAt(now);
        tier.setUpdatedBy(UNKNOWN_ACTOR);
        return toResponse(seatTierRepository.save(tier));
    }

    public SeatTierResponse update(Long id, SeatTierRequest request) {
        validate(request);
        SeatTier tier = getActiveTier(id);
        tier.setName(request.getName().trim());
        tier.setPriceMultiplier(request.getPriceMultiplier());
        tier.setDescription(request.getDescription());
        tier.setUpdatedAt(LocalDateTime.now());
        tier.setUpdatedBy(UNKNOWN_ACTOR);
        return toResponse(seatTierRepository.save(tier));
    }

    public void softDelete(Long id) {
        SeatTier tier = getActiveTier(id);
        tier.setDeletedAt(LocalDateTime.now());
        tier.setDeletedBy(UNKNOWN_ACTOR);
        tier.setUpdatedBy(UNKNOWN_ACTOR);
        seatTierRepository.save(tier);
    }

    private SeatTier getActiveTier(Long id) {
        return seatTierRepository
                .findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("SeatTier not found: " + id));
    }

    private void validate(SeatTierRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new BadRequestException("name is required");
        }
        if (request.getPriceMultiplier() == null || request.getPriceMultiplier().doubleValue() <= 0) {
            throw new BadRequestException("priceMultiplier must be greater than 0");
        }
    }

    private SeatTierResponse toResponse(SeatTier tier) {
        return new SeatTierResponse(
                tier.getId(),
                tier.getName(),
                tier.getPriceMultiplier(),
                tier.getDescription(),
                tier.getCreatedAt(),
                tier.getCreatedBy(),
                tier.getUpdatedAt(),
                tier.getUpdatedBy(),
                tier.getDeletedAt(),
                tier.getDeletedBy());
    }
}
