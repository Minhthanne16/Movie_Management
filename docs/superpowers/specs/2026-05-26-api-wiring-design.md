# API Wiring Design — Backend ↔ Frontend

**Date:** 2026-05-26  
**Status:** Approved  

---

## Context

The project has a fully implemented Spring Boot backend (12 controllers, all CRUD complete) and a React/TypeScript frontend where every page uses hardcoded mock data. Only `authService.register()` calls a real API. This spec defines the work to wire all endpoints to the frontend and fill the two critical backend gaps discovered during the audit.

---

## Backend Changes

### 1. Add `category` to `FoodItem`

Add a `category` column to the `food_item` table and propagate through the stack:

- **Entity:** `FoodItem.java` — add `@Column String category`
- **Request DTO:** `FoodItemRequest.java` — add `category` field
- **Response DTO:** `FoodItemResponse.java` — add `category` field
- **Service:** map through in `FoodItemService`

Valid values (stored as strings): `COMBO`, `COUPLE_SET`, `POPCORN`, `DRINK`, `CANDY`.  
Frontend maps these to display labels: `"Combos"`, `"Couple Sets"`, `"Popcorn"`, `"Drinks"`, `"Candy"`.

### 2. Add `BookingController`

New controller at `/api/bookings`. A booking represents a user reserving seats for a showtime. Tickets are the per-seat rows created atomically with the booking.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/bookings` | USER | Create booking — takes `showtimeId` + `seatIds[]`, creates `Booking` + one `Ticket` per seat, returns full booking with tickets |
| `GET` | `/api/bookings/my` | USER | Current user's booking history |
| `GET` | `/api/bookings/{id}` | USER/ADMIN | Get single booking with its tickets |
| `DELETE` | `/api/bookings/{id}/cancel` | USER | Cancel a PENDING booking, set tickets to CANCELLED |

**Request DTO (`BookingRequest`):**
```java
Long showtimeId;
List<Long> seatIds;
```

**Response DTO (`BookingResponse`):**
```java
Long id;
Long userId;
Long showtimeId;
String movieTitle;
String roomName;
LocalDateTime startTime;
BigDecimal totalPrice;
BookingStatus status;         // PENDING, CONFIRMED, CANCELLED
List<TicketResponse> tickets; // { id, seatId, rowLabel, seatNumber, tierName, price }
LocalDateTime createdAt;
```

Validation: reject if any seat is already ticketed for the same showtime (duplicate check on `ticket.showtime_id + ticket.seat_id` unique constraint).

### 3. Add Seat-Availability Endpoint

`GET /api/seats/available?showtimeId={id}`

Returns all seats for the room assigned to that showtime, each annotated with `isBooked`. Drives the seat-picker UI so users can see which seats are already taken.

**Response:** `List<SeatAvailabilityResponse>` where each item extends `SeatResponse` with an added `boolean isBooked` field.

Implementation: join `seat` with `ticket` filtered by `showtime_id` to determine booked status.

---

## Frontend Service Layer

Location: `src/services/`  
All services import the shared `api.ts` axios instance (JWT interceptor already configured).  
All services unwrap `response.data.data` so callers receive the payload directly, not the `ApiResponse<T>` wrapper.

| File | Key methods |
|------|-------------|
| `auth.service.ts` | extend with `forgotPassword()`, `verifyOtp()`, `resetPassword()`, `me()` |
| `movie.service.ts` | `getAll()`, `getNowShowing()`, `getById(id)`, `create(form)`, `update(id, form)`, `delete(id)`, `uploadPoster(file)` |
| `showtime.service.ts` | `getAll(movieId?, from?, to?)`, `getById(id)`, `create(req)`, `update(id, req)`, `delete(id)` |
| `booking.service.ts` | `create(showtimeId, seatIds)`, `getById(id)`, `getMyBookings()`, `cancel(id)` |
| `seat.service.ts` | `getByRoom(roomId)`, `getAvailable(showtimeId)`, `create(req)`, `update(id, req)`, `delete(id)` |
| `seatTier.service.ts` | `getAll()`, `getById(id)`, `create(req)`, `update(id, req)`, `delete(id)` |
| `food.service.ts` | `getAll()`, `getById(id)`, `create(form)`, `update(id, req)`, `delete(id)` |
| `order.service.ts` | `place(bookingId, items)`, `getMyOrders()`, `getAll()`, `getById(id)`, `cancel(id)` |
| `payment.service.ts` | `create(bookingId, orderId, method, amount)`, `getById(id)`, `handleVnpayReturn(params)` |
| `theaterRoom.service.ts` | `getAll()`, `getById(id)`, `create(req)`, `update(id, req)`, `delete(id)` |
| `staff.service.ts` | `getAll()`, `getById(id)`, `create(req)`, `update(id, req)`, `delete(id)` |
| `dashboard.service.ts` | `get()` |

---

## BookingContext

**File:** `src/contexts/BookingContext.tsx`

Wraps the user-facing routes in `App.tsx` (not admin or staff routes).

```ts
interface BookingState {
  showtimeId: number | null
  selectedSeatIds: number[]
  bookingId: number | null
  orderId: number | null
  paymentId: number | null
}
```

Actions: `setShowtime(id)`, `setSeats(ids)`, `setBookingId(id)`, `setOrderId(id)`, `setPaymentId(id)`, `reset()`.

`reset()` is called when the user clicks "Back to Home" on the `BookingConfirmation` page, so the context data remains readable while the confirmation is displayed. It is also called if the user navigates back to the movie list mid-flow.

---

## Frontend Page Wiring

### Auth Pages

| Page | Change |
|------|--------|
| `Login` | Replace mock with `authService.login()` |
| `Register` | Already wired — no change |
| `ForgotPassword` | Wire `authService.forgotPassword()` + `verifyOtp()` + `resetPassword()` |

### User Booking Flow

| Page | API calls | Context actions |
|------|-----------|-----------------|
| `Home` | `movie.service.getNowShowing()` | — |
| `Movies` | `movie.service.getAll()`, `showtime.service.getAll(movieId)` | `setShowtime(id)` on selection |
| `Theater` (repurposed: replaces hardcoded theater-location list with real showtimes for the movie selected on the previous page) | `showtime.service.getAll(movieId)` — displays each showtime's room, time, and base price | `setShowtime(id)` on card click |
| `Seats` | `seat.service.getAvailable(showtimeId)` | on confirm → `booking.service.create()` → `setBookingId()`, `setSeats()` |
| `Snacks` | `food.service.getAll()` | on confirm → `order.service.place()` → `setOrderId()` |
| `Payment` | `payment.service.create()` | on success → `setPaymentId()` |
| `BookingConfirmation` | `booking.service.getById()`, `order.service.getById()` | `reset()` on "Back to Home" click |

### Admin Pages

| Page | API calls |
|------|-----------|
| `AdminDashboard` | `dashboard.service.get()` |
| `AdminMovies` | `movie.service.getAll/create/update/delete/uploadPoster` |
| `AdminFoods` | `food.service.getAll/create/update/delete` |
| `AdminShowtimes` | `showtime.service.getAll/create/update/delete`, `movie.service.getAll()`, `theaterRoom.service.getAll()` |
| `AdminRooms` | `theaterRoom.service.getAll/create/update/delete`, `seat.service.getByRoom/create/update/delete` |
| `AdminStaff` | `staff.service.getAll/create/update/delete` |

### Staff / POS Pages

| Page | API calls |
|------|-----------|
| `StaffDashboard` | `dashboard.service.get()` |
| `POS` | `movie.service.getAll()`, `showtime.service.getAll()`, `seat.service.getAvailable()`, `booking.service.create()`, `order.service.place()` |
| `FoodPOS` | `food.service.getAll()`, `order.service.place()` |
| `StaffHistory` | `order.service.getAll()` |

---

## TypeScript Types to Update

- `FoodItem` — add `category` field, align to backend enum values
- `Seat` — align `id` type to `number` (currently `string`), add `isBooked?: boolean`
- `Room` — align `id`/`roomId` to `number`
- Add new types: `Booking`, `BookingRequest`, `Ticket`, `Order`, `OrderItem`, `Payment`, `Staff`, `SeatTier`, `TheaterRoom`, `DashboardStats`

---

## Error Handling

All service methods use a shared `extractErrorMessage(error)` helper (already exists in `auth.service.ts`) — extract it to `src/utils/error.ts` and import from there. Pages display errors via local `error` state with a toast or inline message.

---

## Out of Scope

- Real-time seat locking (WebSocket)
- VNPay production integration (keep current redirect flow, handle return URL)
- Unit tests for services
- Role-based route guards (admin/staff route protection)
