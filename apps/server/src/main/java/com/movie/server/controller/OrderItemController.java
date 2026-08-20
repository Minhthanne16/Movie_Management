package com.movie.server.controller;

import com.movie.server.dto.request.OrderItemRequest;
import com.movie.server.dto.response.ApiResponse;
import com.movie.server.dto.response.OrderItemResponse;
import com.movie.server.service.OrderItemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/order-items")
@Tag(name = "Order Items", description = "Line items within an order (F&B selections)")
@SecurityRequirement(name = "bearerAuth")
public class OrderItemController {
    private final OrderItemService orderItemService;

    public OrderItemController(OrderItemService orderItemService) {
        this.orderItemService = orderItemService;
    }

    @GetMapping
    @Operation(summary = "List order items, optionally filtered by orderId")
    public ResponseEntity<ApiResponse<List<OrderItemResponse>>> findAll(@RequestParam(required = false) Long orderId) {
        return ResponseEntity.ok(new ApiResponse<>(
                LocalDateTime.now(), HttpStatus.OK.value(), "Order items fetched", orderItemService.findAll(orderId)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order item by ID")
    public ResponseEntity<ApiResponse<OrderItemResponse>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(
                LocalDateTime.now(), HttpStatus.OK.value(), "Order item fetched", orderItemService.findById(id)));
    }

    @PostMapping
    @Operation(summary = "Create a new order item")
    public ResponseEntity<ApiResponse<OrderItemResponse>> create(@RequestBody OrderItemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(
                        LocalDateTime.now(), HttpStatus.CREATED.value(), "Order item created", orderItemService.create(request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an order item")
    public ResponseEntity<ApiResponse<OrderItemResponse>> update(
            @PathVariable Long id, @RequestBody OrderItemRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(
                LocalDateTime.now(), HttpStatus.OK.value(), "Order item updated", orderItemService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an order item")
    public ResponseEntity<ApiResponse<Object>> delete(@PathVariable Long id) {
        orderItemService.delete(id);
        return ResponseEntity.ok(new ApiResponse<>(LocalDateTime.now(), HttpStatus.OK.value(), "Order item deleted", null));
    }
}
