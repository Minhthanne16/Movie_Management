package com.movie.server.dto.request;

import java.math.BigDecimal;

public class OrderItemRequest {
    private Long orderId;
    private Long foodItemId;
    private Integer quantity;
    private BigDecimal price;

    public OrderItemRequest() {}

    public Long getOrderId() {
        return orderId;
    }

    public Long getFoodItemId() {
        return foodItemId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public BigDecimal getPrice() {
        return price;
    }
}
