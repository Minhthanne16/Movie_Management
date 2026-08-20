package com.movie.server.dto.request;

import com.movie.server.enums.OrderStatus;
import java.math.BigDecimal;

public class OrderRequest {
    private Long userId;
    private Long bookingId;
    private OrderStatus status;
    private BigDecimal totalPrice;

    public OrderRequest() {}

    public Long getUserId() {
        return userId;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }
}
