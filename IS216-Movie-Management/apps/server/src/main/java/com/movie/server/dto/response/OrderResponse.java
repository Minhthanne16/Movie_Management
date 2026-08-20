package com.movie.server.dto.response;

import com.movie.server.enums.OrderStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderResponse {
    private Long id;
    private Long userId;
    private Long bookingId;
    private OrderStatus status;
    private BigDecimal totalPrice;
    private LocalDateTime createdAt;
    private String createdBy;
    private LocalDateTime updatedAt;
    private String updatedBy;
    private LocalDateTime deletedAt;
    private String deletedBy;
    private List<OrderItemResponse> items;

    public OrderResponse(
            Long id,
            Long userId,
            Long bookingId,
            OrderStatus status,
            BigDecimal totalPrice,
            LocalDateTime createdAt,
            String createdBy,
            LocalDateTime updatedAt,
            String updatedBy,
            LocalDateTime deletedAt,
            String deletedBy,
            List<OrderItemResponse> items) {
        this.id = id;
        this.userId = userId;
        this.bookingId = bookingId;
        this.status = status;
        this.totalPrice = totalPrice;
        this.createdAt = createdAt;
        this.createdBy = createdBy;
        this.updatedAt = updatedAt;
        this.updatedBy = updatedBy;
        this.deletedAt = deletedAt;
        this.deletedBy = deletedBy;
        this.items = items;
    }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public Long getBookingId() { return bookingId; }
    public OrderStatus getStatus() { return status; }
    public BigDecimal getTotalPrice() { return totalPrice; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public String getCreatedBy() { return createdBy; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public String getUpdatedBy() { return updatedBy; }
    public LocalDateTime getDeletedAt() { return deletedAt; }
    public String getDeletedBy() { return deletedBy; }
    public List<OrderItemResponse> getItems() { return items; }
}
