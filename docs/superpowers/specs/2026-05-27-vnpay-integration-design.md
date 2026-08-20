---
title: VNPAY Payment Integration
date: 2026-05-27
status: approved
---

## Overview

Integrate VNPAY as the QR/online payment method in the movie booking flow. When a user selects the QR tab on the Payment page and clicks Pay, they are redirected to VNPAY sandbox, complete payment there, and are brought back to a result page showing success or failure.

The existing backend already implements HMAC-SHA512 signing and signature verification (`PaymentService`). The gap is credentials, the return handler redirect, frontend redirect logic, and a new result page.

---

## Architecture

### Backend changes

**`application.properties`** — add VNPAY sandbox credentials:
```
vnpay.tmn-code=J3DUSNQA
vnpay.hash-secret=ZPLP8P5FAQBADIN7DMUKOPAKH2L0TN9I
vnpay.url=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
vnpay.return-url=http://localhost:5173/api/payments/vnpay/return
vnpay.frontend-url=http://localhost:5173
```

The `return-url` goes through the Vite dev proxy (`/api/*` → `http://localhost:8080`) so VNPAY's callback hits Spring Boot.

**`PaymentController.handleVnpayReturn()`** — change return type from `ResponseEntity<ApiResponse<VnpayReturnResponse>>` to `void`, inject `HttpServletResponse`, and call `response.sendRedirect(...)` instead of returning JSON:
```
GET /api/payments/vnpay/return?vnp_*=...
→ validates signature, updates Payment status
→ sendRedirect: {frontend-url}/#/payment/result?paymentId={id}&status={SUCCESS|FAILED}
```

### Frontend changes

**`Payment.tsx`** — when VNPAY method selected and payment created successfully:
1. Save `{ bookingId, orderId, paymentId }` to `sessionStorage` key `tickify_pending_booking`
2. `window.location.href = payment.vnpay.paymentUrl` (full page redirect, not navigate())

**New `PaymentResult.tsx`** (`apps/website/src/pages/movie/PaymentResult.tsx`):
- Reads `paymentId` and `status` from `URLSearchParams`
- Reads `{ bookingId, orderId }` from sessionStorage
- Fetches booking and order details via existing API services
- SUCCESS: renders confirmation UI (matches `BookingConfirmation` layout, uses BookingSteps step 6)
- FAILED: renders failure UI with "Try Again" button that navigates back to `/payment`
- Clears sessionStorage key after reading

**`App.tsx`** — add route:
```tsx
<Route path="/payment/result" element={<PaymentResult />} />
```

---

## Data Flow

```
1. User selects QR tab, clicks "Pay ₫{total}"
2. Frontend → POST /api/payments  { method: "VNPAY", bookingId, orderId, amount }
3. Backend creates Payment (status: PENDING), builds signed VNPAY URL, returns
   { id, vnpay: { paymentUrl } }
4. Frontend writes sessionStorage: { bookingId, orderId, paymentId: payment.id }
5. window.location.href = payment.vnpay.paymentUrl
   — full page navigation; HashRouter state is lost (expected)
6. User on VNPAY sandbox: enters test card details, OTP
7. VNPAY → GET http://localhost:5173/api/payments/vnpay/return?vnp_TxnRef=...&vnp_ResponseCode=00&...
   (Vite proxy forwards to Spring Boot on :8080)
8. Backend verifies HMAC-SHA512 signature
9. Backend updates Payment: SUCCESS (code 00) or FAILED (any other code)
10. Backend: HttpServletResponse.sendRedirect(
      "http://localhost:5173/#/payment/result?paymentId={id}&status=SUCCESS"
    )
11. Browser loads PaymentResult page
12. PaymentResult reads paymentId + status from window.location.search
13. PaymentResult reads bookingId + orderId from sessionStorage, clears key
14. Fetches booking details (bookingService.getById) + order details (orderService.getById)
15. Renders success confirmation or failure screen
```

---

## Error Handling

| Scenario | What happens |
|---|---|
| Payment POST fails (network, server error) | Frontend shows inline error toast; user stays on Payment page; no redirect |
| VNPAY signature mismatch on return | Backend sets FAILED, redirects with `status=FAILED` |
| User cancels on VNPAY (`vnp_ResponseCode=24`) | Backend sets FAILED, redirects with `status=FAILED` |
| `status=FAILED` in URL | PaymentResult shows failure UI; "Try Again" navigates to `/payment` |
| sessionStorage missing `tickify_pending_booking` | PaymentResult fetches booking via `paymentId` only (booking ID embedded in `vnp_TxnRef` or fallback to payment record); snack details omitted if no orderId |
| Booking/order fetch fails on result page | Shows generic success/failure without details; logs warning |
| User refreshes PaymentResult page | `status` still in URL; sessionStorage already cleared → fetches booking by paymentId; graceful degradation |

---

## State Persistence

Key: `tickify_pending_booking` in `sessionStorage`

```json
{
  "bookingId": "uuid",
  "orderId": "uuid | null",
  "paymentId": "uuid"
}
```

- Written immediately before `window.location.href` redirect
- Read once by PaymentResult on mount
- Deleted by PaymentResult after reading (one-shot)
- If absent on PaymentResult load: degrade gracefully (no snack section shown)

---

## Test Card (VNPAY Sandbox)

| Field | Value |
|---|---|
| Bank | NCB |
| Card number | 9704198526191432198 |
| Cardholder name | NGUYEN VAN A |
| Issue date | 07/15 |
| OTP | 123456 |

---

## Files Changed

| File | Change |
|---|---|
| `apps/server/src/main/resources/application.properties` | Add 5 `vnpay.*` properties |
| `apps/server/.../controller/PaymentController.java` | `handleVnpayReturn`: void + sendRedirect |
| `apps/website/src/pages/movie/Payment.tsx` | VNPAY branch: sessionStorage + window.location.href |
| `apps/website/src/pages/movie/PaymentResult.tsx` | New file — result page |
| `apps/website/src/App.tsx` | Add `/payment/result` route |
