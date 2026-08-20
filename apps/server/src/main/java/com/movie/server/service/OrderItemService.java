package com.movie.server.service;

import com.movie.server.dto.request.OrderItemRequest;
import com.movie.server.dto.response.OrderItemResponse;
import com.movie.server.entity.FoodItem;
import com.movie.server.entity.Order;
import com.movie.server.entity.OrderItem;
import com.movie.server.exception.BadRequestException;
import com.movie.server.exception.ResourceNotFoundException;
import com.movie.server.repository.FoodItemRepository;
import com.movie.server.repository.OrderItemRepository;
import com.movie.server.repository.OrderRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class OrderItemService {
    private final OrderItemRepository orderItemRepository;
    private final OrderRepository orderRepository;
    private final FoodItemRepository foodItemRepository;

    public OrderItemService(
            OrderItemRepository orderItemRepository,
            OrderRepository orderRepository,
            FoodItemRepository foodItemRepository) {
        this.orderItemRepository = orderItemRepository;
        this.orderRepository = orderRepository;
        this.foodItemRepository = foodItemRepository;
    }

    public List<OrderItemResponse> findAll(Long orderId) {
        List<OrderItem> items = orderId == null ? orderItemRepository.findAll() : orderItemRepository.findByOrderId(orderId);
        return items.stream().map(this::toResponse).toList();
    }

    public OrderItemResponse findById(Long id) {
        return toResponse(getOrderItem(id));
    }

    public OrderItemResponse create(OrderItemRequest request) {
        validate(request);
        Order order = getActiveOrder(request.getOrderId());
        FoodItem foodItem = getActiveFoodItem(request.getFoodItemId());

        OrderItem item = new OrderItem();
        item.setOrder(order);
        item.setFoodItem(foodItem);
        item.setQuantity(request.getQuantity());
        item.setPrice(request.getPrice());
        return toResponse(orderItemRepository.save(item));
    }

    public OrderItemResponse update(Long id, OrderItemRequest request) {
        validate(request);
        Order order = getActiveOrder(request.getOrderId());
        FoodItem foodItem = getActiveFoodItem(request.getFoodItemId());

        OrderItem item = getOrderItem(id);
        item.setOrder(order);
        item.setFoodItem(foodItem);
        item.setQuantity(request.getQuantity());
        item.setPrice(request.getPrice());
        return toResponse(orderItemRepository.save(item));
    }

    public void delete(Long id) {
        OrderItem item = getOrderItem(id);
        orderItemRepository.delete(item);
    }

    private void validate(OrderItemRequest request) {
        if (request.getOrderId() == null) {
            throw new BadRequestException("orderId is required");
        }
        if (request.getFoodItemId() == null) {
            throw new BadRequestException("foodItemId is required");
        }
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new BadRequestException("quantity must be greater than 0");
        }
        if (request.getPrice() == null || request.getPrice().doubleValue() < 0) {
            throw new BadRequestException("price must be greater than or equal to 0");
        }
    }

    private Order getActiveOrder(Long id) {
        return orderRepository
                .findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));
    }

    private FoodItem getActiveFoodItem(Long id) {
        return foodItemRepository
                .findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("FoodItem not found: " + id));
    }

    private OrderItem getOrderItem(Long id) {
        return orderItemRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("OrderItem not found: " + id));
    }

    private OrderItemResponse toResponse(OrderItem item) {
        return new OrderItemResponse(
                item.getId(),
                item.getOrder().getId(),
                item.getFoodItem().getId(),
                item.getFoodItem().getName(),
                item.getQuantity(),
                item.getPrice());
    }
}
