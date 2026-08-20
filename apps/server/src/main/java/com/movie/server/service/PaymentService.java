package com.movie.server.service;

import com.movie.server.dto.request.PaymentRequest;
import com.movie.server.dto.response.PaymentResponse;
import com.movie.server.dto.response.VnpayPaymentInitResponse;
import com.movie.server.dto.response.VnpayReturnResponse;
import com.movie.server.entity.Booking;
import com.movie.server.entity.Order;
import com.movie.server.entity.Payment;
import com.movie.server.enums.PaymentMethod;
import com.movie.server.enums.PaymentStatus;
import com.movie.server.exception.BadRequestException;
import com.movie.server.exception.ResourceNotFoundException;
import com.movie.server.repository.BookingRepository;
import com.movie.server.repository.OrderRepository;
import com.movie.server.repository.PaymentRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TimeZone;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {
    private static final String VNP_VERSION = "2.1.0";
    private static final DateTimeFormatter VNP_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final OrderRepository orderRepository;
    private final String vnpPayUrl;
    private final String vnpTmnCode;
    private final String vnpSecretKey;
    private final String vnpReturnUrl;

    public PaymentService(
            PaymentRepository paymentRepository,
            BookingRepository bookingRepository,
            OrderRepository orderRepository,
            @Value("${vnpay.pay-url:https://sandbox.vnpayment.vn/paymentv2/vpcpay.html}") String vnpPayUrl,
            @Value("${vnpay.tmn-code:}") String vnpTmnCode,
            @Value("${vnpay.secret-key:}") String vnpSecretKey,
            @Value("${vnpay.return-url:}") String vnpReturnUrl) {
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
        this.orderRepository = orderRepository;
        this.vnpPayUrl = vnpPayUrl;
        this.vnpTmnCode = vnpTmnCode;
        this.vnpSecretKey = vnpSecretKey;
        this.vnpReturnUrl = vnpReturnUrl;
    }

    public List<PaymentResponse> findAll(Long orderId, String ipAddress) {
        List<Payment> payments = orderId == null ? paymentRepository.findAll() : paymentRepository.findByOrderId(orderId);
        return payments.stream().map(payment -> toResponse(payment, ipAddress, null)).toList();
    }

    public PaymentResponse findById(Long id, String ipAddress) {
        return toResponse(getPayment(id), ipAddress, null);
    }

    public PaymentResponse create(PaymentRequest request, String ipAddress) {
        validate(request);
        Booking booking = request.getBookingId() == null ? null : getActiveBooking(request.getBookingId());
        Order order = request.getOrderId() == null ? null : getActiveOrder(request.getOrderId());
        BigDecimal calculatedAmount = resolveAmount(order, booking);

        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setOrder(order);
        payment.setAmount(calculatedAmount);
        payment.setMethod(request.getMethod());
        if (request.getMethod() == PaymentMethod.VNPAY) {
            payment.setStatus(PaymentStatus.PENDING);
            payment.setPaidAt(null);
        } else {
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setPaidAt(LocalDateTime.now());
        }
        Payment savedPayment = paymentRepository.save(payment);
        if (savedPayment.getMethod() == PaymentMethod.VNPAY) {
            String normalizedIp = isBlank(ipAddress) ? "127.0.0.1" : ipAddress;
            String paymentUrl = buildVnpayPaymentUrl(savedPayment, normalizedIp, request.getBankCode(), request.getLanguage());
            String createDate = LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")).format(VNP_DATE_FORMAT);
            VnpayPaymentInitResponse initResponse =
                    new VnpayPaymentInitResponse(savedPayment.getId(), String.valueOf(savedPayment.getId()), createDate, paymentUrl);
            return toResponse(savedPayment, normalizedIp, initResponse);
        }
        return toResponse(savedPayment, ipAddress, null);
    }

    public void delete(Long id) {
        Payment payment = getPayment(id);
        if (payment.getStatus() == PaymentStatus.SUCCESS || payment.getStatus() == PaymentStatus.REFUNDED) {
            throw new BadRequestException("SUCCESS and REFUNDED payments cannot be deleted");
        }
        payment.setStatus(PaymentStatus.FAILED);
        paymentRepository.save(payment);
    }

    public PaymentResponse updateStatus(Long id, PaymentStatus targetStatus) {
        if (targetStatus != PaymentStatus.SUCCESS && targetStatus != PaymentStatus.REFUNDED) {
            throw new BadRequestException("status can only be SUCCESS or REFUNDED");
        }

        Payment payment = getPayment(id);
        PaymentStatus currentStatus = payment.getStatus();

        if (currentStatus == PaymentStatus.FAILED) {
            throw new BadRequestException("FAILED payment cannot be updated");
        }
        if (currentStatus == PaymentStatus.PENDING && targetStatus == PaymentStatus.REFUNDED) {
            throw new BadRequestException("PENDING payment cannot be updated to REFUNDED");
        }
        if (currentStatus == PaymentStatus.REFUNDED && targetStatus == PaymentStatus.SUCCESS) {
            throw new BadRequestException("REFUNDED payment cannot be updated to SUCCESS");
        }

        payment.setStatus(targetStatus);
        return toResponse(paymentRepository.save(payment), "127.0.0.1", null);
    }

    public PaymentResponse processVnpayReturn(Map<String, String> returnParams) {
        ensureVnpayConfig();
        String secureHash = returnParams.get("vnp_SecureHash");
        if (isBlank(secureHash)) {
            throw new BadRequestException("Missing vnp_SecureHash");
        }

        Map<String, String> verifyFields = new HashMap<>(returnParams);
        verifyFields.remove("vnp_SecureHash");
        verifyFields.remove("vnp_SecureHashType");
        String calculated = hmacSHA512(vnpSecretKey, buildHashData(verifyFields));
        if (!secureHash.equalsIgnoreCase(calculated)) {
            throw new BadRequestException("Invalid VNPAY signature");
        }

        String txnRef = returnParams.get("vnp_TxnRef");
        if (isBlank(txnRef)) {
            throw new BadRequestException("Missing vnp_TxnRef");
        }

        Payment payment = getPayment(parsePaymentId(txnRef));
        String responseCode = returnParams.get("vnp_ResponseCode");
        if ("00".equals(responseCode)) {
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setPaidAt(LocalDateTime.now());
        } else {
            payment.setStatus(PaymentStatus.FAILED);
        }
        return toResponse(paymentRepository.save(payment), "127.0.0.1", null);
    }

    public VnpayReturnResponse processVnpayReturnDetailed(Map<String, String> returnParams) {
        PaymentResponse paymentResponse = processVnpayReturn(returnParams);
        String responseCode = returnParams.getOrDefault("vnp_ResponseCode", "");
        String transactionStatus = returnParams.getOrDefault("vnp_TransactionStatus", "");
        String txnRef = returnParams.getOrDefault("vnp_TxnRef", "");
        return new VnpayReturnResponse(
                txnRef,
                responseCode,
                transactionStatus,
                getVnpResponseMessageVi(responseCode, transactionStatus),
                paymentResponse);
    }

    public int resolveVnpReturnHttpCode(String responseCode, String transactionStatus) {
        if ("00".equals(responseCode) && "00".equals(transactionStatus)) {
            return 200;
        }
        if ("24".equals(responseCode)) {
            return 400;
        }
        if ("11".equals(responseCode)) {
            return 408;
        }
        if ("09".equals(responseCode)
                || "10".equals(responseCode)
                || "12".equals(responseCode)
                || "13".equals(responseCode)
                || "51".equals(responseCode)
                || "65".equals(responseCode)
                || "75".equals(responseCode)
                || "79".equals(responseCode)) {
            return 422;
        }
        if ("07".equals(responseCode)) {
            return 409;
        }
        return 400;
    }

    private void validate(PaymentRequest request) {
        if (request.getBookingId() == null && request.getOrderId() == null) {
            throw new BadRequestException("bookingId or orderId is required");
        }
        if (request.getMethod() == null) {
            throw new BadRequestException("method is required");
        }
    }

    private BigDecimal resolveAmount(Order order, Booking booking) {
        if (order != null) {
            if (order.getTotalPrice() == null || order.getTotalPrice().doubleValue() < 0) {
                throw new BadRequestException("Order total price is invalid");
            }
            return order.getTotalPrice();
        }
        if (booking != null) {
            if (booking.getTotalPrice() == null || booking.getTotalPrice().doubleValue() < 0) {
                throw new BadRequestException("Booking total price is invalid");
            }
            return booking.getTotalPrice();
        }
        throw new BadRequestException("bookingId or orderId is required");
    }

    private Payment getPayment(Long id) {
        return paymentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Payment not found: " + id));
    }

    private Booking getActiveBooking(Long id) {
        return bookingRepository
                .findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));
    }

    private Order getActiveOrder(Long id) {
        return orderRepository
                .findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));
    }

    private PaymentResponse toResponse(Payment payment, String ipAddress, VnpayPaymentInitResponse vnpayInitResponse) {
        return new PaymentResponse(
                payment.getId(),
                payment.getBooking() == null ? null : payment.getBooking().getId(),
                payment.getOrder() == null ? null : payment.getOrder().getId(),
                payment.getAmount(),
                payment.getMethod(),
                payment.getStatus(),
                payment.getPaidAt(),
                vnpayInitResponse);
    }

    private String buildVnpayPaymentUrl(Payment payment, String ipAddress, String bankCode, String language) {
        ensureVnpayConfig();
        String txnRef = String.valueOf(payment.getId());
        Map<String, String> params = new HashMap<>();
        params.put("vnp_Version", VNP_VERSION);
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", vnpTmnCode);
        params.put("vnp_Amount", toVnpAmount(payment.getAmount()));
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_TxnRef", txnRef);
        params.put("vnp_OrderInfo", "Thanh toan don hang:" + txnRef);
        params.put("vnp_OrderType", "other");
        params.put("vnp_Locale", isBlank(language) ? "vn" : language);
        params.put("vnp_ReturnUrl", vnpReturnUrl);
        params.put("vnp_IpAddr", ipAddress);
        if (!isBlank(bankCode)) {
            params.put("vnp_BankCode", bankCode);
        }

        Calendar calendar = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        LocalDateTime now = LocalDateTime.ofInstant(calendar.toInstant(), ZoneId.of("Asia/Ho_Chi_Minh"));
        params.put("vnp_CreateDate", now.format(VNP_DATE_FORMAT));
        calendar.add(Calendar.MINUTE, 15);
        LocalDateTime expiresAt = LocalDateTime.ofInstant(calendar.toInstant(), ZoneId.of("Asia/Ho_Chi_Minh"));
        params.put("vnp_ExpireDate", expiresAt.format(VNP_DATE_FORMAT));

        String query = buildQuery(params);
        String secureHash = hmacSHA512(vnpSecretKey, buildHashData(params));
        return vnpPayUrl + "?" + query + "&vnp_SecureHash=" + secureHash;
    }

    private void ensureVnpayConfig() {
        if (isBlank(vnpTmnCode) || isBlank(vnpSecretKey) || isBlank(vnpReturnUrl)) {
            throw new BadRequestException("VNPAY configuration is missing");
        }
    }

    private String toVnpAmount(BigDecimal amount) {
        return amount.multiply(BigDecimal.valueOf(100)).setScale(0, RoundingMode.HALF_UP).toPlainString();
    }

    private long parsePaymentId(String txnRef) {
        try {
            return Long.parseLong(txnRef);
        } catch (NumberFormatException ex) {
            throw new BadRequestException("Invalid txnRef: " + txnRef);
        }
    }

    private String buildHashData(Map<String, String> fields) {
        List<String> fieldNames = new ArrayList<>(fields.keySet());
        fieldNames.sort(String::compareTo);
        StringBuilder hashData = new StringBuilder();
        for (String fieldName : fieldNames) {
            String fieldValue = fields.get(fieldName);
            if (isBlank(fieldValue)) {
                continue;
            }
            if (!hashData.isEmpty()) {
                hashData.append("&");
            }
            hashData.append(fieldName)
                    .append("=")
                    .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
        }
        return hashData.toString();
    }

    private String buildQuery(Map<String, String> fields) {
        List<String> fieldNames = new ArrayList<>(fields.keySet());
        fieldNames.sort(String::compareTo);
        StringBuilder query = new StringBuilder();
        for (String fieldName : fieldNames) {
            String fieldValue = fields.get(fieldName);
            if (isBlank(fieldValue)) {
                continue;
            }
            if (!query.isEmpty()) {
                query.append("&");
            }
            query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII))
                    .append("=")
                    .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
        }
        return query.toString();
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac hmac512 = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac512.init(secretKeySpec);
            byte[] result = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(result.length * 2);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException | InvalidKeyException ex) {
            throw new BadRequestException("Unable to sign VNPAY request");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private String getVnpResponseMessageVi(String responseCode, String transactionStatus) {
        if ("00".equals(responseCode)) {
            if ("00".equals(transactionStatus)) {
                return "Giao dich thanh cong";
            }
            if ("01".equals(transactionStatus)) {
                return "Giao dich chua hoan tat";
            }
            if ("02".equals(transactionStatus)) {
                return "Giao dich bi loi";
            }
        }
        return switch (responseCode) {
            case "07" -> "Tru tien thanh cong, nhung giao dich bi nghi ngo";
            case "09" -> "The/Tai khoan chua dang ky Internet Banking";
            case "10" -> "Xac thuc thong tin the/tai khoan sai qua 3 lan";
            case "11" -> "Het han cho thanh toan";
            case "12" -> "The/Tai khoan bi khoa";
            case "13" -> "Nhap sai OTP";
            case "24" -> "Khach hang huy giao dich";
            case "51" -> "Tai khoan khong du so du";
            case "65" -> "Vuot han muc giao dich trong ngay";
            case "75" -> "Ngan hang thanh toan dang bao tri";
            case "79" -> "Nhap sai mat khau thanh toan qua so lan quy dinh";
            default -> "Loi khac hoac giao dich that bai";
        };
    }
}
