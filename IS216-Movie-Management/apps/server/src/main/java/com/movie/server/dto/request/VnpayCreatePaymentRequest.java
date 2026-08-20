package com.movie.server.dto.request;

import java.math.BigDecimal;

public class VnpayCreatePaymentRequest {
    private Long bookingId;
    private Long orderId;
    private BigDecimal amount;
    private String bankCode;
    private String language;

    public VnpayCreatePaymentRequest() {}

    public Long getBookingId() {
        return bookingId;
    }

    public Long getOrderId() {
        return orderId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public String getBankCode() {
        return bankCode;
    }

    public String getLanguage() {
        return language;
    }
}
