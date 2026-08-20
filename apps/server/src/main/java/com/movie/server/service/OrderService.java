package com.movie.server.service;

import com.movie.server.dto.request.OrderRequest;
import com.movie.server.dto.request.PlaceOrderRequest;
import com.movie.server.dto.response.OrderItemResponse;
import com.movie.server.dto.response.OrderResponse;
import com.movie.server.dto.response.PlaceOrderResponse;
import com.movie.server.entity.Booking;
import com.movie.server.entity.FoodItem;
import com.movie.server.entity.Order;
import com.movie.server.entity.OrderItem;
import com.movie.server.entity.User;
import com.movie.server.enums.OrderStatus;
import com.movie.server.exception.BadRequestException;
import com.movie.server.exception.ResourceNotFoundException;
import com.movie.server.repository.BookingRepository;
import com.movie.server.repository.FoodItemRepository;
import com.movie.server.repository.OrderItemRepository;
import com.movie.server.repository.OrderRepository;
import com.movie.server.repository.UserRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {
    private static final String UNKNOWN_ACTOR = "UNKNOWN";

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final FoodItemRepository foodItemRepository;
    private final OrderItemRepository orderItemRepository;

    public OrderService(
            OrderRepository orderRepository,
            UserRepository userRepository,
            BookingRepository bookingRepository,
            FoodItemRepository foodItemRepository,
            OrderItemRepository orderItemRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.foodItemRepository = foodItemRepository;
        this.orderItemRepository = orderItemRepository;
    }

    public List<OrderResponse> findAll() {
        return orderRepository.findByDeletedAtIsNull().stream().map(this::toResponse).toList();
    }

    public OrderResponse findById(Long id) {
        return toResponse(getActiveOrder(id));
    }

    public OrderResponse create(OrderRequest request) {
        validate(request);
        User user = getActiveUser(request.getUserId());
        Booking booking = request.getBookingId() == null ? null : getActiveBooking(request.getBookingId());
        LocalDateTime now = LocalDateTime.now();

        Order order = new Order();
        order.setUser(user);
        order.setBooking(booking);
        order.setStatus(request.getStatus());
        order.setTotalPrice(request.getTotalPrice());
        order.setCreatedAt(now);
        order.setCreatedBy(UNKNOWN_ACTOR);
        order.setUpdatedAt(now);
        order.setUpdatedBy(UNKNOWN_ACTOR);
        return toResponse(orderRepository.save(order));
    }

    public OrderResponse update(Long id, OrderRequest request) {
        validate(request);
        User user = getActiveUser(request.getUserId());
        Booking booking = request.getBookingId() == null ? null : getActiveBooking(request.getBookingId());

        Order order = getActiveOrder(id);
        order.setUser(user);
        order.setBooking(booking);
        order.setStatus(request.getStatus());
        order.setTotalPrice(request.getTotalPrice());
        order.setUpdatedAt(LocalDateTime.now());
        order.setUpdatedBy(UNKNOWN_ACTOR);
        return toResponse(orderRepository.save(order));
    }

    public void softDelete(Long id) {
        Order order = getActiveOrder(id);
        order.setDeletedAt(LocalDateTime.now());
        order.setDeletedBy(UNKNOWN_ACTOR);
        order.setUpdatedAt(LocalDateTime.now());
        order.setUpdatedBy(UNKNOWN_ACTOR);
        orderRepository.save(order);
    }

    public OrderResponse cancelOrder(Long orderId, String userEmail) {
        Order order = orderRepository.findByIdAndDeletedAtIsNull(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));
        if (!order.getUser().getEmail().equals(userEmail)) {
            throw new BadRequestException("Không có quyền hủy đơn hàng này");
        }
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BadRequestException("Chỉ có thể hủy đơn hàng ở trạng thái PENDING");
        }
        order.setStatus(OrderStatus.CANCELLED);
        order.setUpdatedAt(LocalDateTime.now());
        order.setUpdatedBy(userEmail);
        return toResponse(orderRepository.save(order));
    }

    public List<OrderResponse> findMyOrders(String userEmail) {
        return orderRepository.findByUser_EmailAndDeletedAtIsNull(userEmail)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public PlaceOrderResponse placeOrder(PlaceOrderRequest request, String userEmail) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException("Đơn hàng phải có ít nhất 1 món");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Booking booking = null;
        if (request.getBookingId() != null) {
            booking = bookingRepository.findByIdAndDeletedAtIsNull(request.getBookingId())
                    .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + request.getBookingId()));
        }

        // Validate all food items and calculate total
        List<FoodItem> foodItems = new ArrayList<>();
        BigDecimal totalPrice = BigDecimal.ZERO;
        for (PlaceOrderRequest.PlaceOrderItemRequest itemReq : request.getItems()) {
            if (itemReq.getQuantity() == null || itemReq.getQuantity() <= 0) {
                throw new BadRequestException("Số lượng phải lớn hơn 0");
            }
            FoodItem foodItem = foodItemRepository.findByIdAndDeletedAtIsNull(itemReq.getFoodItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("Food item not found: " + itemReq.getFoodItemId()));
            if (!foodItem.getIsAvailable()) {
                throw new BadRequestException("Món '" + foodItem.getName() + "' hiện không có sẵn");
            }
            foodItems.add(foodItem);
            totalPrice = totalPrice.add(foodItem.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity())));
        }

        LocalDateTime now = LocalDateTime.now();

        // Create Order
        Order order = new Order();
        order.setUser(user);
        order.setBooking(booking);
        order.setStatus(OrderStatus.PENDING);
        order.setTotalPrice(totalPrice);
        order.setCreatedAt(now);
        order.setCreatedBy(userEmail);
        order.setUpdatedAt(now);
        order.setUpdatedBy(userEmail);
        order = orderRepository.save(order);

        // Create OrderItems
        List<OrderItemResponse> itemResponses = new ArrayList<>();
        for (int i = 0; i < request.getItems().size(); i++) {
            PlaceOrderRequest.PlaceOrderItemRequest itemReq = request.getItems().get(i);
            FoodItem foodItem = foodItems.get(i);

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setFoodItem(foodItem);
            orderItem.setQuantity(itemReq.getQuantity());
            orderItem.setPrice(foodItem.getPrice()); // snapshot price at time of order
            orderItemRepository.save(orderItem);

            itemResponses.add(toOrderItemResponse(orderItem, foodItem));
        }

        return new PlaceOrderResponse(
                order.getId(),
                user.getId(),
                booking == null ? null : booking.getId(),
                order.getStatus(),
                order.getTotalPrice(),
                itemResponses,
                order.getCreatedAt());
    }

    private OrderItemResponse toOrderItemResponse(OrderItem item, FoodItem foodItem) {
        return new OrderItemResponse(
                item.getId(),
                item.getOrder().getId(),
                foodItem.getId(),
                foodItem.getName(),
                item.getQuantity(),
                item.getPrice());
    }

    private void validate(OrderRequest request) {
        if (request.getUserId() == null) {
            throw new BadRequestException("userId is required");
        }
        if (request.getStatus() == null) {
            throw new BadRequestException("status is required");
        }
        if (request.getTotalPrice() == null || request.getTotalPrice().doubleValue() < 0) {
            throw new BadRequestException("totalPrice must be greater than or equal to 0");
        }
    }

    private Order getActiveOrder(Long id) {
        return orderRepository
                .findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));
    }

    private User getActiveUser(Long id) {
        return userRepository
                .findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }

    private Booking getActiveBooking(Long id) {
        return bookingRepository
                .findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));
    }

    private OrderResponse toResponse(Order order) {
        List<OrderItemResponse> items = orderItemRepository.findByOrderId(order.getId())
                .stream()
                .map(item -> new OrderItemResponse(
                        item.getId(),
                        item.getOrder().getId(),
                        item.getFoodItem().getId(),
                        item.getFoodItem().getName(),
                        item.getQuantity(),
                        item.getPrice()))
                .toList();
        return new OrderResponse(
                order.getId(),
                order.getUser().getId(),
                order.getBooking() == null ? null : order.getBooking().getId(),
                order.getStatus(),
                order.getTotalPrice(),
                order.getCreatedAt(),
                order.getCreatedBy(),
                order.getUpdatedAt(),
                order.getUpdatedBy(),
                order.getDeletedAt(),
                order.getDeletedBy(),
                items);
    }
}
