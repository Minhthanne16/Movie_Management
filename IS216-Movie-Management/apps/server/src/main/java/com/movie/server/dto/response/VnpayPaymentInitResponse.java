package com.movie.server.dto.response;

public class VnpayPaymentInitResponse {
    private Long paymentId;
    private String txnRef;
    private String createDate;
    private String paymentUrl;

    public VnpayPaymentInitResponse(Long paymentId, String txnRef, String createDate, String paymentUrl) {
        this.paymentId = paymentId;
        this.txnRef = txnRef;
        this.createDate = createDate;
        this.paymentUrl = paymentUrl;
    }

    public Long getPaymentId() {
        return paymentId;
    }

    public String getTxnRef() {
        return txnRef;
    }

    public String getCreateDate() {
        return createDate;
    }

    public String getPaymentUrl() {
        return paymentUrl;
    }
}
