package com.movie.server.dto.request;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.movie.server.enums.PaymentMethod;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class PaymentRequestTest {

    private final ObjectMapper mapper = new ObjectMapper()
            .registerModule(new JavaTimeModule());

    @Test
    void jacksonDeserializesAllFields() throws Exception {
        String json = """
            {
              "bookingId": 7,
              "orderId": 3,
              "amount": 240000,
              "method": "CASH"
            }
            """;
        PaymentRequest req = mapper.readValue(json, PaymentRequest.class);
        assertEquals(7L, req.getBookingId());
        assertEquals(3L, req.getOrderId());
        assertEquals(0, req.getAmount().compareTo(new java.math.BigDecimal("240000")));
        assertEquals(PaymentMethod.CASH, req.getMethod());
    }
}
