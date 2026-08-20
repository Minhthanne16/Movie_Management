package com.movie.server.dto.response;

import java.time.LocalDateTime;

public class SeatResponse {
    private Long id;
    private Long roomId;
    private String roomName;
    private String rowLabel;
    private Integer seatNumber;
    private Long tierId;
    private String tierName;
    private LocalDateTime createdAt;
    private String createdBy;
    private LocalDateTime updatedAt;
    private String updatedBy;
    private LocalDateTime deletedAt;
    private String deletedBy;

    public SeatResponse(
            Long id,
            Long roomId,
            String roomName,
            String rowLabel,
            Integer seatNumber,
            Long tierId,
            String tierName,
            LocalDateTime createdAt,
            String createdBy,
            LocalDateTime updatedAt,
            String updatedBy,
            LocalDateTime deletedAt,
            String deletedBy) {
        this.id = id;
        this.roomId = roomId;
        this.roomName = roomName;
        this.rowLabel = rowLabel;
        this.seatNumber = seatNumber;
        this.tierId = tierId;
        this.tierName = tierName;
        this.createdAt = createdAt;
        this.createdBy = createdBy;
        this.updatedAt = updatedAt;
        this.updatedBy = updatedBy;
        this.deletedAt = deletedAt;
        this.deletedBy = deletedBy;
    }

    public Long getId() { return id; }
    public Long getRoomId() { return roomId; }
    public String getRoomName() { return roomName; }
    public String getRowLabel() { return rowLabel; }
    public Integer getSeatNumber() { return seatNumber; }
    public Long getTierId() { return tierId; }
    public String getTierName() { return tierName; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public String getCreatedBy() { return createdBy; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public String getUpdatedBy() { return updatedBy; }
    public LocalDateTime getDeletedAt() { return deletedAt; }
    public String getDeletedBy() { return deletedBy; }
}
