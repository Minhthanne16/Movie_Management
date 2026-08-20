package com.movie.server.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class SeatTierResponse {
    private Long id;
    private String name;
    private BigDecimal priceMultiplier;
    private String description;
    private LocalDateTime createdAt;
    private String createdBy;
    private LocalDateTime updatedAt;
    private String updatedBy;
    private LocalDateTime deletedAt;
    private String deletedBy;

    public SeatTierResponse(
            Long id,
            String name,
            BigDecimal priceMultiplier,
            String description,
            LocalDateTime createdAt,
            String createdBy,
            LocalDateTime updatedAt,
            String updatedBy,
            LocalDateTime deletedAt,
            String deletedBy) {
        this.id = id;
        this.name = name;
        this.priceMultiplier = priceMultiplier;
        this.description = description;
        this.createdAt = createdAt;
        this.createdBy = createdBy;
        this.updatedAt = updatedAt;
        this.updatedBy = updatedBy;
        this.deletedAt = deletedAt;
        this.deletedBy = deletedBy;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public BigDecimal getPriceMultiplier() { return priceMultiplier; }
    public String getDescription() { return description; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public String getCreatedBy() { return createdBy; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public String getUpdatedBy() { return updatedBy; }
    public LocalDateTime getDeletedAt() { return deletedAt; }
    public String getDeletedBy() { return deletedBy; }
}
