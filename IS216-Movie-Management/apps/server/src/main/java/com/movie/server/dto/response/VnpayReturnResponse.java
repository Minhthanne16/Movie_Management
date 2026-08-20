package com.movie.server.dto.response;

public class VnpayReturnResponse {
    private String vnpTxnRef;
    private String vnpResponseCode;
    private String vnpTransactionStatus;
    private String vnpMessageVi;
    private PaymentResponse payment;

    public VnpayReturnResponse(
            String vnpTxnRef,
            String vnpResponseCode,
            String vnpTransactionStatus,
            String vnpMessageVi,
            PaymentResponse payment) {
        this.vnpTxnRef = vnpTxnRef;
        this.vnpResponseCode = vnpResponseCode;
        this.vnpTransactionStatus = vnpTransactionStatus;
        this.vnpMessageVi = vnpMessageVi;
        this.payment = payment;
    }

    public String getVnpTxnRef() {
        return vnpTxnRef;
    }

    public String getVnpResponseCode() {
        return vnpResponseCode;
    }

    public String getVnpTransactionStatus() {
        return vnpTransactionStatus;
    }

    public String getVnpMessageVi() {
        return vnpMessageVi;
    }

    public PaymentResponse getPayment() {
        return payment;
    }
}
