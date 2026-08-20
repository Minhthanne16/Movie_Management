# VNPAY Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire VNPAY as the QR payment method so users are redirected to the VNPAY sandbox, complete payment, and land on a result page showing success or failure.

**Architecture:** Frontend saves booking/order IDs to sessionStorage then does a full-page redirect to the VNPAY-signed URL; VNPAY calls back via Vite proxy to Spring Boot which validates the HMAC signature, updates payment status, and sends an HTTP 302 redirect to `/#/payment/result?paymentId=X&status=SUCCESS|FAILED`; the new PaymentResult page reads URL params + sessionStorage to display the confirmation.

**Tech Stack:** Spring Boot (Java), React + TypeScript (Vite), VNPAY sandbox, HMAC-SHA512, HashRouter (React Router v6), sessionStorage

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `apps/server/src/main/resources/application.properties` | Modify | Add VNPAY sandbox credentials |
| `apps/server/src/main/java/com/movie/server/security/SecurityConfig.java` | Modify | Allow unauthenticated GET on `/api/payments/vnpay/return` |
| `apps/server/src/main/java/com/movie/server/controller/PaymentController.java` | Modify | Inject `frontendUrl`, change return handler to `sendRedirect` |
| `apps/server/src/test/java/com/movie/server/service/PaymentServiceVnpayReturnTest.java` | Create | Unit tests for signature verification + status update |
| `apps/website/src/types/payment.ts` | Modify | Add `vnpay` field to `Payment` interface |
| `apps/website/src/pages/movie/Payment.tsx` | Modify | VNPAY branch: write sessionStorage, redirect to paymentUrl |
| `apps/website/src/pages/movie/PaymentResult.tsx` | Create | Result page: reads URL params + sessionStorage, fetches booking |
| `apps/website/src/App.tsx` | Modify | Add `/payment/result` route inside BookingProvider/MainLayout |

---

### Task 1: Backend — credentials, security, and test

**Files:**
- Modify: `apps/server/src/main/resources/application.properties`
- Modify: `apps/server/src/main/java/com/movie/server/security/SecurityConfig.java`
- Create: `apps/server/src/test/java/com/movie/server/service/PaymentServiceVnpayReturnTest.java`

- [ ] **Step 1: Write the failing tests**

Create `apps/server/src/test/java/com/movie/server/service/PaymentServiceVnpayReturnTest.java`:

```java
package com.movie.server.service;

import com.movie.server.dto.response.VnpayReturnResponse;
import com.movie.server.entity.Payment;
import com.movie.server.enums.PaymentStatus;
import com.movie.server.repository.BookingRepository;
import com.movie.server.repository.OrderRepository;
import com.movie.server.repository.PaymentRepository;
import org.junit.jupiter.api.Test;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class PaymentServiceVnpayReturnTest {

    private static final String TEST_SECRET = "TESTSECRET";

    private PaymentService buildService() {
        PaymentRepository paymentRepo = mock(PaymentRepository.class);
        BookingRepository bookingRepo = mock(BookingRepository.class);
        OrderRepository orderRepo = mock(OrderRepository.class);

        Payment payment = new Payment();
        payment.setId(42L);
        payment.setStatus(PaymentStatus.PENDING);
        payment.setAmount(BigDecimal.valueOf(100000));

        when(paymentRepo.findById(42L)).thenReturn(Optional.of(payment));
        when(paymentRepo.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

        return new PaymentService(
                paymentRepo, bookingRepo, orderRepo,
                "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
                "TESTCODE", TEST_SECRET, "http://localhost/return");
    }

    private Map<String, String> buildParams(String responseCode, String txnStatus) throws Exception {
        Map<String, String> params = new HashMap<>();
        params.put("vnp_TxnRef", "42");
        params.put("vnp_ResponseCode", responseCode);
        params.put("vnp_TransactionStatus", txnStatus);
        params.put("vnp_TmnCode", "TESTCODE");

        // buildHashData sorts keys alphabetically and URL-encodes values
        // For these simple ASCII values URL-encoding is a no-op
        String hashData = "vnp_ResponseCode=" + responseCode
                + "&vnp_TmnCode=TESTCODE"
                + "&vnp_TransactionStatus=" + txnStatus
                + "&vnp_TxnRef=42";
        params.put("vnp_SecureHash", hmacSHA512(TEST_SECRET, hashData));
        return params;
    }

    private String hmacSHA512(String key, String data) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA512");
        mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
        byte[] bytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) sb.append(String.format("%02x", b & 0xff));
        return sb.toString();
    }

    @Test
    void successCode00_setsPaymentSuccess() throws Exception {
        PaymentService svc = buildService();
        VnpayReturnResponse result = svc.processVnpayReturnDetailed(buildParams("00", "00"));
        assertEquals("00", result.getVnpResponseCode());
        assertEquals(PaymentStatus.SUCCESS, result.getPayment().getStatus());
    }

    @Test
    void cancellationCode24_setsPaymentFailed() throws Exception {
        PaymentService svc = buildService();
        VnpayReturnResponse result = svc.processVnpayReturnDetailed(buildParams("24", "02"));
        assertEquals("24", result.getVnpResponseCode());
        assertEquals(PaymentStatus.FAILED, result.getPayment().getStatus());
    }
}
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /Users/ken/IS216-Movie-Management/apps/server
./mvnw test -pl . -Dtest=PaymentServiceVnpayReturnTest -q 2>&1 | tail -20
```

Expected: **FAILED** — `processVnpayReturnDetailed` throws `BadRequestException("Missing vnp_SecureHash")` because the blank `vnpSecretKey` default means hmac cannot be verified. Or it may pass if empty secret just happens to mismatch — either way it won't give us two green tests yet. That's expected.

Actually the tests should fail with signature mismatch because `vnpSecretKey` is `"TESTSECRET"` — wait, we ARE passing `TEST_SECRET` to the constructor. The tests should actually PASS already. Run them to confirm:

- [ ] **Step 3: Add VNPAY credentials to application.properties**

Open `apps/server/src/main/resources/application.properties` and append at the end:

```properties
# VNPAY sandbox
vnpay.pay-url=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
vnpay.tmn-code=J3DUSNQA
vnpay.secret-key=ZPLP8P5FAQBADIN7DMUKOPAKH2L0TN9I
vnpay.return-url=http://localhost:5173/api/payments/vnpay/return
vnpay.frontend-url=http://localhost:5173
```

Note: Property names must match exactly what `PaymentService` reads:
- `@Value("${vnpay.pay-url:...}")` → `vnpay.pay-url`
- `@Value("${vnpay.tmn-code:}")` → `vnpay.tmn-code`
- `@Value("${vnpay.secret-key:}")` → `vnpay.secret-key`
- `@Value("${vnpay.return-url:}")` → `vnpay.return-url`

The new `vnpay.frontend-url` will be read by the controller in Task 2.

- [ ] **Step 4: Allow unauthenticated access to VNPAY return endpoint**

Open `apps/server/src/main/java/com/movie/server/security/SecurityConfig.java`.

Find the block:
```java
.requestMatchers("/api/auth/**").permitAll()
.requestMatchers(
        "/swagger-ui/**",
        "/swagger-ui.html",
        "/v3/api-docs/**"
).permitAll()
```

Add a new `permitAll` line after the auth line:
```java
.requestMatchers("/api/auth/**").permitAll()
.requestMatchers(HttpMethod.GET, "/api/payments/vnpay/return").permitAll()
.requestMatchers(
        "/swagger-ui/**",
        "/swagger-ui.html",
        "/v3/api-docs/**"
).permitAll()
```

`HttpMethod` is already imported (used on line 68). If not, add:
```java
import org.springframework.http.HttpMethod;
```

- [ ] **Step 5: Run tests and verify they pass**

```bash
cd /Users/ken/IS216-Movie-Management/apps/server
./mvnw test -pl . -Dtest=PaymentServiceVnpayReturnTest -q 2>&1 | tail -10
```

Expected: `BUILD SUCCESS`, 2 tests passed.

- [ ] **Step 6: Commit**

```bash
cd /Users/ken/IS216-Movie-Management
git add apps/server/src/main/resources/application.properties \
        apps/server/src/main/java/com/movie/server/security/SecurityConfig.java \
        apps/server/src/test/java/com/movie/server/service/PaymentServiceVnpayReturnTest.java
git commit -m "feat(backend): add VNPAY credentials, permit return URL, add return tests"
```

---

### Task 2: Backend — PaymentController redirect

**Files:**
- Modify: `apps/server/src/main/java/com/movie/server/controller/PaymentController.java`

- [ ] **Step 1: Update PaymentController**

Replace the entire file content with:

```java
package com.movie.server.controller;

import com.movie.server.dto.request.PaymentRequest;
import com.movie.server.dto.response.ApiResponse;
import com.movie.server.dto.response.PaymentResponse;
import com.movie.server.dto.response.VnpayReturnResponse;
import com.movie.server.enums.PaymentStatus;
import com.movie.server.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@Tag(name = "Payments", description = "Payment processing including VNPay integration")
@SecurityRequirement(name = "bearerAuth")
public class PaymentController {
    private final PaymentService paymentService;
    private final String frontendUrl;

    public PaymentController(
            PaymentService paymentService,
            @Value("${vnpay.frontend-url:http://localhost:5173}") String frontendUrl) {
        this.paymentService = paymentService;
        this.frontendUrl = frontendUrl;
    }

    @GetMapping
    @Operation(summary = "List payments, optionally filtered by orderId")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> findAll(
            @RequestParam(required = false) Long orderId, HttpServletRequest servletRequest) {
        return ResponseEntity.ok(
                new ApiResponse<>(
                        LocalDateTime.now(),
                        HttpStatus.OK.value(),
                        "Payments fetched",
                        paymentService.findAll(orderId, getIpAddress(servletRequest))));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get payment by ID")
    public ResponseEntity<ApiResponse<PaymentResponse>> findById(@PathVariable Long id, HttpServletRequest servletRequest) {
        return ResponseEntity.ok(
                new ApiResponse<>(
                        LocalDateTime.now(),
                        HttpStatus.OK.value(),
                        "Payment fetched",
                        paymentService.findById(id, getIpAddress(servletRequest))));
    }

    @PostMapping
    @Operation(summary = "Create a new payment and generate VNPay payment URL")
    public ResponseEntity<ApiResponse<PaymentResponse>> create(
            @RequestBody PaymentRequest request, HttpServletRequest servletRequest) {
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(
                LocalDateTime.now(),
                HttpStatus.CREATED.value(),
                "Payment created",
                paymentService.create(request, getIpAddress(servletRequest))));
    }

    @GetMapping("/vnpay/return")
    @Operation(summary = "Handle VNPay payment return callback — redirects browser to frontend result page")
    public void handleVnpayReturn(
            @RequestParam Map<String, String> returnParams,
            HttpServletResponse response) throws IOException {
        VnpayReturnResponse result = paymentService.processVnpayReturnDetailed(returnParams);
        String status = "00".equals(result.getVnpResponseCode()) ? "SUCCESS" : "FAILED";
        long paymentId = result.getPayment().getId();
        response.sendRedirect(frontendUrl + "/#/payment/result?paymentId=" + paymentId + "&status=" + status);
    }

    @PostMapping("/{id}/status")
    @Operation(summary = "Update payment status manually (ADMIN)")
    public ResponseEntity<ApiResponse<PaymentResponse>> updateStatus(
            @PathVariable Long id, @RequestParam PaymentStatus status) {
        return ResponseEntity.ok(
                new ApiResponse<>(
                        LocalDateTime.now(),
                        HttpStatus.OK.value(),
                        "Payment status updated",
                        paymentService.updateStatus(id, status)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Mark payment as FAILED (soft delete)")
    public ResponseEntity<ApiResponse<Object>> delete(@PathVariable Long id) {
        paymentService.delete(id);
        return ResponseEntity.ok(new ApiResponse<>(LocalDateTime.now(), HttpStatus.OK.value(), "Payment marked as FAILED", null));
    }

    private String getIpAddress(HttpServletRequest request) {
        String forwarded = request.getHeader("X-FORWARDED-FOR");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
```

- [ ] **Step 2: Build the backend to verify no compilation errors**

```bash
cd /Users/ken/IS216-Movie-Management/apps/server
./mvnw compile -q 2>&1 | tail -20
```

Expected: `BUILD SUCCESS`, no errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/ken/IS216-Movie-Management
git add apps/server/src/main/java/com/movie/server/controller/PaymentController.java
git commit -m "feat(backend): VNPAY return handler redirects to frontend result page"
```

---

### Task 3: Frontend — Payment type + Payment.tsx redirect

**Files:**
- Modify: `apps/website/src/types/payment.ts`
- Modify: `apps/website/src/pages/movie/Payment.tsx`

- [ ] **Step 1: Update Payment type**

Open `apps/website/src/types/payment.ts`. Replace the `Payment` interface:

```typescript
export type PaymentMethod = "CASH" | "VNPAY";
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";

export interface VnpayInit {
  paymentId: number;
  txnRef: string;
  createDate: string;
  paymentUrl: string;
}

export interface Payment {
  id: number;
  bookingId: number | null;
  orderId: number | null;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  paidAt: string | null;
  vnpay?: VnpayInit;
}

export interface PaymentRequest {
  bookingId: number | null;
  orderId: number | null;
  amount: number;
  method: PaymentMethod;
}
```

- [ ] **Step 2: Update Payment.tsx handlePay to redirect for VNPAY**

Open `apps/website/src/pages/movie/Payment.tsx`. Replace `handlePay`:

```typescript
const handlePay = async () => {
  if (!bookingId || totalPrice === null) {
    navigate("/seats");
    return;
  }
  setLoading(true);
  setError(null);
  try {
    const payment = await paymentService.create({
      bookingId,
      orderId: orderId ?? null,
      amount: totalPrice,
      method: UI_METHOD_MAP[paymentMethod],
    });

    if (paymentMethod === "qr" && payment.vnpay?.paymentUrl) {
      sessionStorage.setItem(
        "tickify_pending_booking",
        JSON.stringify({ bookingId, orderId: orderId ?? null, paymentId: payment.id }),
      );
      window.location.href = payment.vnpay.paymentUrl;
    } else {
      setPaymentId(payment.id);
      navigate("/confirmation");
    }
  } catch (err) {
    setError(typeof err === "string" ? err : "Payment failed");
  } finally {
    setLoading(false);
  }
};
```

- [ ] **Step 3: Commit**

```bash
cd /Users/ken/IS216-Movie-Management
git add apps/website/src/types/payment.ts \
        apps/website/src/pages/movie/Payment.tsx
git commit -m "feat(frontend): redirect to VNPAY payment URL, save booking IDs to sessionStorage"
```

---

### Task 4: Frontend — PaymentResult page and route

**Files:**
- Create: `apps/website/src/pages/movie/PaymentResult.tsx`
- Modify: `apps/website/src/App.tsx`

- [ ] **Step 1: Create PaymentResult.tsx**

Create `apps/website/src/pages/movie/PaymentResult.tsx`:

```typescript
import { CheckCircle2, XCircle, Calendar, MapPin, Users, Ticket, ShoppingBag, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import BookingSteps from "./components/BookingSteps.tsx";
import { bookingService } from "../../services/booking.service";
import { orderService } from "../../services/order.service";
import type { Booking } from "../../types/booking";
import type { Order } from "../../types/order";

const STEPS = [
  { id: 1, label: "Movies" },
  { id: 2, label: "Theater" },
  { id: 3, label: "Seats" },
  { id: 4, label: "Snacks" },
  { id: 5, label: "Payment" },
  { id: 6, label: "Confirmation" },
];

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const paymentId = searchParams.get("paymentId");
  const status = searchParams.get("status");
  const isSuccess = status === "SUCCESS";

  const [booking, setBooking] = useState<Booking | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = sessionStorage.getItem("tickify_pending_booking");
    sessionStorage.removeItem("tickify_pending_booking");

    if (!raw) {
      setLoading(false);
      return;
    }

    let parsed: { bookingId?: number; orderId?: number | null } = {};
    try { parsed = JSON.parse(raw); } catch { /* ignore */ }

    const fetches: Promise<unknown>[] = [];
    if (parsed.bookingId) {
      fetches.push(bookingService.getById(parsed.bookingId).then(setBooking).catch(() => {}));
    }
    if (parsed.orderId) {
      fetches.push(orderService.getById(parsed.orderId).then(setOrder).catch(() => {}));
    }

    Promise.all(fetches).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="pb-20">
        <BookingSteps currentStep={6} steps={STEPS} />
        <div className="flex items-center justify-center py-32">
          <div className="w-10 h-10 border-2 border-tickify-pink border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!isSuccess) {
    return (
      <div className="pb-20">
        <BookingSteps currentStep={6} steps={STEPS} />
        <div className="max-w-3xl mx-auto px-8 py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-tickify-card/30 border border-red-500/20 rounded-[3rem] p-12 text-center mb-8 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-red-500/50 to-transparent" />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12, delay: 0.2 }}
              className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <XCircle size={48} className="text-red-500" />
            </motion.div>
            <h1 className="text-4xl font-display font-bold text-red-500 mb-2">Payment Failed</h1>
            <p className="text-gray-400 font-medium mb-6">
              {paymentId ? `Payment #${paymentId} was not completed.` : "Your payment was not completed."}
            </p>
            <p className="text-sm text-gray-500">
              Your booking has been cancelled. No charge was made.
            </p>
          </motion.div>
          <button
            onClick={() => navigate("/payment")}
            className="w-full flex items-center justify-center gap-2 bg-tickify-pink text-white py-4 rounded-2xl font-bold text-sm shadow-[0_0_20px_rgba(255,0,128,0.3)] hover:shadow-[0_0_30px_rgba(255,0,128,0.5)] transition-all mb-4"
          >
            <ArrowLeft size={18} />
            Try Again
          </button>
          <button
            onClick={() => navigate("/home")}
            className="w-full py-4 rounded-2xl font-bold text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <BookingSteps currentStep={6} steps={STEPS} />
      <div className="max-w-3xl mx-auto px-8 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-tickify-card/30 border border-green-500/20 rounded-[3rem] p-12 text-center mb-8 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-green-500/50 to-transparent" />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 12, delay: 0.2 }}
            className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 size={48} className="text-green-500" />
          </motion.div>
          <h1 className="text-4xl font-display font-bold text-green-500 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-400 font-medium mb-6">Your VNPAY payment was successful.</p>
          {booking && (
            <div className="inline-block bg-white/5 border border-white/10 rounded-full px-6 py-2">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mr-2">Booking ID:</span>
              <span className="text-xs font-bold text-white">{booking.id}</span>
            </div>
          )}
        </motion.div>

        {booking && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-tickify-card/30 border border-white/5 rounded-[3rem] p-8 md:p-12 mb-8"
          >
            <div className="flex items-center gap-3 mb-8">
              <Ticket size={20} className="text-tickify-pink" />
              <h2 className="text-sm font-black uppercase tracking-widest">Booking Details</h2>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-display font-bold mb-4">{booking.movieTitle ?? "—"}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <Calendar size={18} className="text-tickify-pink" />
                    <span>{booking.startTime ? formatDateTime(booking.startTime) : "—"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <MapPin size={18} className="text-tickify-pink" />
                    <span>{booking.roomName ?? "—"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <Users size={18} className="text-tickify-pink" />
                    <span>{booking.tickets?.length ?? 0} Ticket{(booking.tickets?.length ?? 0) !== 1 ? "s" : ""}</span>
                  </div>
                </div>
              </div>

              {booking.tickets && booking.tickets.length > 0 && (
                <div className="border-t border-white/5 pt-8">
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Selected Seats</h4>
                  <div className="flex flex-wrap gap-4">
                    {booking.tickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="bg-tickify-purple/10 border border-tickify-purple/20 rounded-xl px-4 py-3 flex items-center justify-between gap-4 min-w-[9rem]"
                      >
                        <span className="text-sm font-bold">{ticket.rowLabel}{ticket.seatNumber}</span>
                        <span className="text-[10px] font-bold text-tickify-purple uppercase tracking-widest">{ticket.tierName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {order && order.items.length > 0 && (
                <div className="border-t border-white/5 pt-8">
                  <div className="flex items-center gap-3 mb-4">
                    <ShoppingBag size={16} className="text-tickify-cyan" />
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Snacks & Drinks</h4>
                  </div>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-400">
                          {item.foodItemName} <span className="text-tickify-pink">x{item.quantity}</span>
                        </span>
                        <span className="font-bold">₫{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-white/5 pt-8">
                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Payment Summary</h4>
                <div className="flex justify-between pt-4 border-t border-white/5">
                  <span className="text-lg font-bold">Total Paid</span>
                  <span className="text-xl font-display font-bold text-tickify-pink">₫{booking.totalPrice ?? 0}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <button
          onClick={() => navigate("/home")}
          className="w-full py-4 rounded-2xl font-bold text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all mb-16"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add route to App.tsx**

Open `apps/website/src/App.tsx`. Add the import after `BookingConfirmation`:

```typescript
import PaymentResult from "./pages/movie/PaymentResult.tsx";
```

Find the user routes block and add `/payment/result` after `/confirmation`:

```tsx
<Route path="/payment" element={<Payment />} />
<Route path="/confirmation" element={<BookingConfirmation />} />
<Route path="/payment/result" element={<PaymentResult />} />
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /Users/ken/IS216-Movie-Management/apps/website
npx tsc --noEmit 2>&1 | head -30
```

Expected: no output (no errors).

- [ ] **Step 4: Commit**

```bash
cd /Users/ken/IS216-Movie-Management
git add apps/website/src/pages/movie/PaymentResult.tsx \
        apps/website/src/App.tsx
git commit -m "feat(frontend): add PaymentResult page and /payment/result route"
```

---

### Task 5: End-to-end verification

This task has no code changes — it confirms the full flow works using the VNPAY sandbox test card.

**Prerequisites:** Both servers running.
- Backend: `cd apps/server && ./mvnw spring-boot:run`
- Frontend: `cd apps/website && npm run dev`

- [ ] **Step 1: Log in as customer**

Open `http://localhost:5173`. Log in with `customer@cinema.com` / `Customer@123`.

- [ ] **Step 2: Complete booking through to Payment page**

Movies → pick a movie → pick a showtime → pick seats → skip or add snacks → arrive at `/payment`.

- [ ] **Step 3: Select QR tab, click Pay**

Switch to the QR tab. Click the Pay button. The browser should leave `localhost:5173` and navigate to `sandbox.vnpayment.vn`.

- [ ] **Step 4: Complete VNPAY sandbox payment**

On the VNPAY sandbox page:
1. Select bank **NCB**
2. Card number: `9704198526191432198`
3. Cardholder name: `NGUYEN VAN A`
4. Issue date: `07/15`
5. Click Continue → enter OTP `123456` → Confirm

- [ ] **Step 5: Verify redirect to PaymentResult success page**

Browser should land on `http://localhost:5173/#/payment/result?paymentId=X&status=SUCCESS`.

Page shows green checkmark, "Booking Confirmed!", booking details, and seat list.

- [ ] **Step 6: Verify database payment status**

```bash
psql -U postgres -d movie -c "SELECT id, method, status, paid_at FROM payments ORDER BY id DESC LIMIT 3;"
```

Expected: the VNPAY payment row has `status = 'SUCCESS'` and a non-null `paid_at`.

- [ ] **Step 7: Test cancellation path**

Repeat Steps 1–3. On VNPAY sandbox page, click "Cancel" or go back. Verify browser lands on `/#/payment/result?status=FAILED` and shows the red failure UI with "Try Again" button.
