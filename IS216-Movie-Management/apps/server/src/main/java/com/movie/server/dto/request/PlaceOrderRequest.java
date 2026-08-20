package com.movie.server.dto.request;

import java.util.List;

public class PlaceOrderRequest {
    private Long bookingId;
    private List<PlaceOrderItemRequest> items;

    public PlaceOrderRequest() {}

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
    public List<PlaceOrderItemRequest> getItems() { return items; }
    public void setItems(List<PlaceOrderItemRequest> items) { this.items = items; }

    public static class PlaceOrderItemRequest {
        private Long foodItemId;
        private Integer quantity;

        public PlaceOrderItemRequest() {}
        public Long getFoodItemId() { return foodItemId; }
        public void setFoodItemId(Long foodItemId) { this.foodItemId = foodItemId; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }
}
