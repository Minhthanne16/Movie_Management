package com.movie.server.dto.response;

import com.movie.server.enums.OrderStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class PlaceOrderResponse {
    private Long id;
    private Long userId;
    private Long bookingId;
    private OrderStatus status;
    private BigDecimal totalPrice;
    private List<OrderItemResponse> items;
    private LocalDateTime createdAt;

    public PlaceOrderResponse(Long id, Long userId, Long bookingId, OrderStatus status,
                               BigDecimal totalPrice, List<OrderItemResponse> items, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.bookingId = bookingId;
        this.status = status;
        this.totalPrice = totalPrice;
        this.items = items;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public Long getBookingId() { return bookingId; }
    public OrderStatus getStatus() { return status; }
    public BigDecimal getTotalPrice() { return totalPrice; }
    public List<OrderItemResponse> getItems() { return items; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
