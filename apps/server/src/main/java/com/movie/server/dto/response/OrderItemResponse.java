package com.movie.server.dto.response;

import java.math.BigDecimal;

public class OrderItemResponse {
    private Long id;
    private Long orderId;
    private Long foodItemId;
    private String foodItemName;
    private Integer quantity;
    private BigDecimal price;

    public OrderItemResponse(
            Long id, Long orderId, Long foodItemId, String foodItemName, Integer quantity, BigDecimal price) {
        this.id = id;
        this.orderId = orderId;
        this.foodItemId = foodItemId;
        this.foodItemName = foodItemName;
        this.quantity = quantity;
        this.price = price;
    }

    public Long getId() { return id; }
    public Long getOrderId() { return orderId; }
    public Long getFoodItemId() { return foodItemId; }
    public String getFoodItemName() { return foodItemName; }
    public Integer getQuantity() { return quantity; }
    public BigDecimal getPrice() { return price; }
}
