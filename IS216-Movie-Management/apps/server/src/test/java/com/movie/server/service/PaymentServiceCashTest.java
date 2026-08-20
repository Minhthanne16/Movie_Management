package com.movie.server.service;

import com.movie.server.dto.request.PaymentRequest;
import com.movie.server.dto.response.PaymentResponse;
import com.movie.server.entity.Booking;
import com.movie.server.entity.Payment;
import com.movie.server.enums.PaymentMethod;
import com.movie.server.enums.PaymentStatus;
import com.movie.server.repository.BookingRepository;
import com.movie.server.repository.OrderRepository;
import com.movie.server.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class PaymentServiceCashTest {

    private PaymentRepository paymentRepository;
    private BookingRepository bookingRepository;
    private OrderRepository orderRepository;
    private PaymentService paymentService;

    @BeforeEach
    void setUp() {
        paymentRepository = mock(PaymentRepository.class);
        bookingRepository = mock(BookingRepository.class);
        orderRepository = mock(OrderRepository.class);
        paymentService = new PaymentService(
                paymentRepository, bookingRepository, orderRepository,
                "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html", "", "", "");
    }

    @Test
    void cashPaymentAutoSetsSuccessWithoutStatusInRequest() {
        Booking booking = new Booking();
        booking.setId(1L);
        booking.setTotalPrice(BigDecimal.valueOf(240000));

        when(bookingRepository.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(booking));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> {
            Payment p = inv.getArgument(0);
            p.setId(99L);
            return p;
        });

        PaymentRequest request = new PaymentRequest();
        request.setBookingId(1L);
        request.setAmount(BigDecimal.valueOf(240000));
        request.setMethod(PaymentMethod.CASH);
        // Note: no status set — this is the bug scenario

        PaymentResponse response = paymentService.create(request, "127.0.0.1");

        assertEquals(PaymentStatus.SUCCESS, response.getStatus());
        assertNotNull(response.getPaidAt());
    }
}
