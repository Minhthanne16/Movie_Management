package com.movie.server.dto.response;

import com.movie.server.enums.PaymentMethod;
import com.movie.server.enums.PaymentStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PaymentResponse {
    private Long id;
    private Long bookingId;
    private Long orderId;
    private BigDecimal amount;
    private PaymentMethod method;
    private PaymentStatus status;
    private LocalDateTime paidAt;
    private VnpayPaymentInitResponse vnpay;

    public PaymentResponse(
            Long id,
            Long bookingId,
            Long orderId,
            BigDecimal amount,
            PaymentMethod method,
            PaymentStatus status,
            LocalDateTime paidAt,
            VnpayPaymentInitResponse vnpay) {
        this.id = id;
        this.bookingId = bookingId;
        this.orderId = orderId;
        this.amount = amount;
        this.method = method;
        this.status = status;
        this.paidAt = paidAt;
        this.vnpay = vnpay;
    }

    public Long getId() { return id; }
    public Long getBookingId() { return bookingId; }
    public Long getOrderId() { return orderId; }
    public BigDecimal getAmount() { return amount; }
    public PaymentMethod getMethod() { return method; }
    public PaymentStatus getStatus() { return status; }
    public LocalDateTime getPaidAt() { return paidAt; }
    public VnpayPaymentInitResponse getVnpay() { return vnpay; }
}
