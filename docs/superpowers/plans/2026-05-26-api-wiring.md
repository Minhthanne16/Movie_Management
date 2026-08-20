# API Wiring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire all Spring Boot backend APIs to the React frontend, replacing every hardcoded mock with real data, and add the two missing backend features (BookingController + FoodItem category).

**Architecture:** Service-per-domain pattern — one `*.service.ts` per backend controller, all sharing the existing `api.ts` axios instance. A `BookingContext` wraps user routes and accumulates state across the multi-page booking flow (movie → showtime → seats → snacks → payment → confirmation). Backend gaps filled first so the frontend always has real endpoints to call.

**Tech Stack:** Spring Boot (Java 21, JPA, Spring Security JWT), React 19 + TypeScript, Axios, React Router v7, Tailwind CSS.

---

## File Map

### Backend — New Files
- `apps/server/src/main/java/com/movie/server/dto/request/BookingRequest.java`
- `apps/server/src/main/java/com/movie/server/dto/response/BookingResponse.java`
- `apps/server/src/main/java/com/movie/server/dto/response/TicketResponse.java`
- `apps/server/src/main/java/com/movie/server/dto/response/SeatAvailabilityResponse.java`
- `apps/server/src/main/java/com/movie/server/service/BookingService.java`
- `apps/server/src/main/java/com/movie/server/controller/BookingController.java`

### Backend — Modified Files
- `apps/server/src/main/java/com/movie/server/entity/FoodItem.java` — add `category` field
- `apps/server/src/main/java/com/movie/server/dto/request/FoodItemRequest.java` — add `category`
- `apps/server/src/main/java/com/movie/server/dto/response/FoodItemResponse.java` — add `category`
- `apps/server/src/main/java/com/movie/server/service/FoodItemService.java` — pass `category` through
- `apps/server/src/main/java/com/movie/server/repository/BookingRepository.java` — add list queries
- `apps/server/src/main/java/com/movie/server/repository/TicketRepository.java` — add seat-ids-by-showtime query
- `apps/server/src/main/java/com/movie/server/service/SeatService.java` — add `findAvailable(showtimeId)`
- `apps/server/src/main/java/com/movie/server/controller/SeatController.java` — add `/available` endpoint
- `apps/server/src/main/java/com/movie/server/security/SecurityConfig.java` — add `/api/bookings/**` rules

### Frontend — New Files
- `apps/website/src/types/booking.ts`
- `apps/website/src/types/order.ts`
- `apps/website/src/types/payment.ts`
- `apps/website/src/types/staff.ts`
- `apps/website/src/types/dashboard.ts`
- `apps/website/src/utils/error.ts`
- `apps/website/src/services/movie.service.ts`
- `apps/website/src/services/showtime.service.ts`
- `apps/website/src/services/booking.service.ts`
- `apps/website/src/services/seat.service.ts`
- `apps/website/src/services/seatTier.service.ts`
- `apps/website/src/services/food.service.ts`
- `apps/website/src/services/order.service.ts`
- `apps/website/src/services/payment.service.ts`
- `apps/website/src/services/theaterRoom.service.ts`
- `apps/website/src/services/staff.service.ts`
- `apps/website/src/services/dashboard.service.ts`
- `apps/website/src/contexts/BookingContext.tsx`

### Frontend — Modified Files
- `apps/website/src/types/food.ts` — add `category`
- `apps/website/src/types/movie.ts` — align field names to backend camelCase
- `apps/website/src/types/cinema.ts` — align id types to `number`
- `apps/website/src/types/showtime.ts` — align to backend shape
- `apps/website/src/services/auth.service.ts` — add `forgotPassword`, `verifyOtp`, `resetPassword`, `me`
- `apps/website/src/App.tsx` — wrap user routes in `BookingProvider`
- `apps/website/src/pages/auth/Login.tsx` — replace mock with `authService.login()`
- `apps/website/src/pages/auth/ForgotPassword.tsx` — wire multi-step OTP flow
- `apps/website/src/pages/home/Home.tsx` — fetch now-showing movies
- `apps/website/src/pages/movie/Movies.tsx` — fetch movies + showtimes
- `apps/website/src/pages/movie/Theater.tsx` — display real showtimes for selected movie
- `apps/website/src/pages/movie/Seats.tsx` — fetch available seats, create booking
- `apps/website/src/pages/movie/Snacks.tsx` — fetch food items, place order
- `apps/website/src/pages/movie/Payment.tsx` — create payment
- `apps/website/src/pages/movie/BookingConfirmation.tsx` — fetch booking + order details
- `apps/website/src/pages/admin/AdminDashboard.tsx` — real dashboard stats
- `apps/website/src/pages/admin/AdminMovies.tsx` — real CRUD
- `apps/website/src/pages/admin/AdminFoods.tsx` — real CRUD
- `apps/website/src/pages/admin/AdminShowtimes.tsx` — real CRUD
- `apps/website/src/pages/admin/AdminRooms.tsx` — real CRUD
- `apps/website/src/pages/admin/AdminStaff.tsx` — real CRUD
- `apps/website/src/pages/staff/StaffDashboard.tsx` — real stats
- `apps/website/src/pages/staff/POS.tsx` — real movies/showtimes/seats/booking/order
- `apps/website/src/pages/staff/FoodPOS.tsx` — real food items
- `apps/website/src/pages/staff/StaffHistory.tsx` — real orders

---

## Task 1: Backend — Add `category` to FoodItem

**Files:**
- Modify: `apps/server/src/main/java/com/movie/server/entity/FoodItem.java`
- Modify: `apps/server/src/main/java/com/movie/server/dto/request/FoodItemRequest.java`
- Modify: `apps/server/src/main/java/com/movie/server/dto/response/FoodItemResponse.java`
- Modify: `apps/server/src/main/java/com/movie/server/service/FoodItemService.java`

- [ ] **Step 1: Add `category` column to `FoodItem` entity**

In `FoodItem.java`, add the field and getter/setter after the `isAvailable` field:

```java
@Column(nullable = true)
private String category;

public String getCategory() { return category; }
public void setCategory(String category) { this.category = category; }
```

- [ ] **Step 2: Add `category` to `FoodItemRequest`**

In `FoodItemRequest.java`, add after `isAvailable`:

```java
private String category;

public String getCategory() { return category; }
public void setCategory(String category) { this.category = category; }
```

- [ ] **Step 3: Add `category` to `FoodItemResponse`**

In `FoodItemResponse.java`, add `category` field, constructor parameter, and getter. The constructor signature becomes:

```java
private String category;

public FoodItemResponse(
        Long id,
        String name,
        String description,
        BigDecimal price,
        String imageUrl,
        Boolean isAvailable,
        String category,
        LocalDateTime createdAt,
        String createdBy,
        LocalDateTime updatedAt,
        String updatedBy,
        LocalDateTime deletedAt,
        String deletedBy) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.imageUrl = imageUrl;
    this.isAvailable = isAvailable;
    this.category = category;
    this.createdAt = createdAt;
    this.createdBy = createdBy;
    this.updatedAt = updatedAt;
    this.updatedBy = updatedBy;
    this.deletedAt = deletedAt;
    this.deletedBy = deletedBy;
}

public String getCategory() { return category; }
```

- [ ] **Step 4: Thread `category` through `FoodItemService`**

In `FoodItemService.java`, update the `create` method to set category:

```java
foodItem.setCategory(request.getCategory());
```

Add it after `foodItem.setIsAvailable(...)`.

Update the `update` method — add after `foodItem.setIsAvailable(...)`:

```java
foodItem.setCategory(request.getCategory());
```

Update the `toResponse` method — the call now passes `category` between `isAvailable` and `createdAt`:

```java
private FoodItemResponse toResponse(FoodItem foodItem) {
    return new FoodItemResponse(
            foodItem.getId(),
            foodItem.getName(),
            foodItem.getDescription(),
            foodItem.getPrice(),
            foodItem.getImageUrl(),
            foodItem.getIsAvailable(),
            foodItem.getCategory(),
            foodItem.getCreatedAt(),
            foodItem.getCreatedBy(),
            foodItem.getUpdatedAt(),
            foodItem.getUpdatedBy(),
            foodItem.getDeletedAt(),
            foodItem.getDeletedBy());
}
```

- [ ] **Step 5: Build to verify**

```bash
cd apps/server && ./gradlew build -x test
```

Expected: `BUILD SUCCESSFUL`

- [ ] **Step 6: Commit**

```bash
git add apps/server/src/main/java/com/movie/server/entity/FoodItem.java \
        apps/server/src/main/java/com/movie/server/dto/request/FoodItemRequest.java \
        apps/server/src/main/java/com/movie/server/dto/response/FoodItemResponse.java \
        apps/server/src/main/java/com/movie/server/service/FoodItemService.java
git commit -m "feat(backend): add category field to FoodItem"
```

---

## Task 2: Backend — BookingController

**Files:**
- Create: `apps/server/src/main/java/com/movie/server/dto/request/BookingRequest.java`
- Create: `apps/server/src/main/java/com/movie/server/dto/response/TicketResponse.java`
- Create: `apps/server/src/main/java/com/movie/server/dto/response/BookingResponse.java`
- Modify: `apps/server/src/main/java/com/movie/server/repository/BookingRepository.java`
- Create: `apps/server/src/main/java/com/movie/server/service/BookingService.java`
- Create: `apps/server/src/main/java/com/movie/server/controller/BookingController.java`
- Modify: `apps/server/src/main/java/com/movie/server/security/SecurityConfig.java`

- [ ] **Step 1: Create `BookingRequest.java`**

```java
package com.movie.server.dto.request;

import java.util.List;

public class BookingRequest {
    private Long showtimeId;
    private List<Long> seatIds;

    public BookingRequest() {}

    public Long getShowtimeId() { return showtimeId; }
    public void setShowtimeId(Long showtimeId) { this.showtimeId = showtimeId; }

    public List<Long> getSeatIds() { return seatIds; }
    public void setSeatIds(List<Long> seatIds) { this.seatIds = seatIds; }
}
```

- [ ] **Step 2: Create `TicketResponse.java`**

```java
package com.movie.server.dto.response;

import java.math.BigDecimal;

public class TicketResponse {
    private Long id;
    private Long seatId;
    private String rowLabel;
    private Integer seatNumber;
    private String tierName;
    private BigDecimal price;

    public TicketResponse(Long id, Long seatId, String rowLabel, Integer seatNumber,
                          String tierName, BigDecimal price) {
        this.id = id;
        this.seatId = seatId;
        this.rowLabel = rowLabel;
        this.seatNumber = seatNumber;
        this.tierName = tierName;
        this.price = price;
    }

    public Long getId() { return id; }
    public Long getSeatId() { return seatId; }
    public String getRowLabel() { return rowLabel; }
    public Integer getSeatNumber() { return seatNumber; }
    public String getTierName() { return tierName; }
    public BigDecimal getPrice() { return price; }
}
```

- [ ] **Step 3: Create `BookingResponse.java`**

```java
package com.movie.server.dto.response;

import com.movie.server.enums.BookingStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class BookingResponse {
    private Long id;
    private Long userId;
    private Long showtimeId;
    private String movieTitle;
    private String moviePosterUrl;
    private String roomName;
    private LocalDateTime startTime;
    private BigDecimal totalPrice;
    private BookingStatus status;
    private List<TicketResponse> tickets;
    private LocalDateTime createdAt;

    public BookingResponse(Long id, Long userId, Long showtimeId, String movieTitle,
                           String moviePosterUrl, String roomName, LocalDateTime startTime,
                           BigDecimal totalPrice, BookingStatus status,
                           List<TicketResponse> tickets, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.showtimeId = showtimeId;
        this.movieTitle = movieTitle;
        this.moviePosterUrl = moviePosterUrl;
        this.roomName = roomName;
        this.startTime = startTime;
        this.totalPrice = totalPrice;
        this.status = status;
        this.tickets = tickets;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public Long getShowtimeId() { return showtimeId; }
    public String getMovieTitle() { return movieTitle; }
    public String getMoviePosterUrl() { return moviePosterUrl; }
    public String getRoomName() { return roomName; }
    public LocalDateTime getStartTime() { return startTime; }
    public BigDecimal getTotalPrice() { return totalPrice; }
    public BookingStatus getStatus() { return status; }
    public List<TicketResponse> getTickets() { return tickets; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
```

- [ ] **Step 4: Extend `BookingRepository`**

Replace the full content of `BookingRepository.java`:

```java
package com.movie.server.repository;

import com.movie.server.entity.Booking;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findByIdAndDeletedAtIsNull(Long id);
    List<Booking> findByUser_EmailAndDeletedAtIsNull(String email);
    List<Booking> findByDeletedAtIsNull();
}
```

- [ ] **Step 5: Create `BookingService.java`**

```java
package com.movie.server.service;

import com.movie.server.dto.request.BookingRequest;
import com.movie.server.dto.response.BookingResponse;
import com.movie.server.dto.response.TicketResponse;
import com.movie.server.entity.Booking;
import com.movie.server.entity.Seat;
import com.movie.server.entity.Showtime;
import com.movie.server.entity.Ticket;
import com.movie.server.entity.User;
import com.movie.server.enums.BookingStatus;
import com.movie.server.enums.TicketStatus;
import com.movie.server.exception.BadRequestException;
import com.movie.server.exception.ResourceNotFoundException;
import com.movie.server.repository.BookingRepository;
import com.movie.server.repository.SeatRepository;
import com.movie.server.repository.ShowtimeRepository;
import com.movie.server.repository.TicketRepository;
import com.movie.server.repository.UserRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ShowtimeRepository showtimeRepository;
    private final SeatRepository seatRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public BookingService(BookingRepository bookingRepository,
                          ShowtimeRepository showtimeRepository,
                          SeatRepository seatRepository,
                          TicketRepository ticketRepository,
                          UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.showtimeRepository = showtimeRepository;
        this.seatRepository = seatRepository;
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public BookingResponse create(BookingRequest request, String userEmail) {
        if (request.getSeatIds() == null || request.getSeatIds().isEmpty()) {
            throw new BadRequestException("At least one seat must be selected");
        }
        Showtime showtime = showtimeRepository.findByIdAndDeletedAtIsNull(request.getShowtimeId())
                .orElseThrow(() -> new ResourceNotFoundException("Showtime not found: " + request.getShowtimeId()));
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        LocalDateTime now = LocalDateTime.now();

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setShowtime(showtime);
        booking.setStatus(BookingStatus.PENDING);
        booking.setTotalPrice(BigDecimal.ZERO);
        booking.setCreatedAt(now);
        booking.setCreatedBy(userEmail);
        booking.setUpdatedAt(now);
        booking.setUpdatedBy(userEmail);
        booking = bookingRepository.save(booking);

        BigDecimal total = BigDecimal.ZERO;
        List<TicketResponse> ticketResponses = new ArrayList<>();

        for (Long seatId : request.getSeatIds()) {
            Seat seat = seatRepository.findByIdAndDeletedAtIsNull(seatId)
                    .orElseThrow(() -> new ResourceNotFoundException("Seat not found: " + seatId));
            BigDecimal price = showtime.getBasePrice()
                    .multiply(seat.getTier().getPriceMultiplier());

            Ticket ticket = new Ticket();
            ticket.setBooking(booking);
            ticket.setShowtime(showtime);
            ticket.setSeat(seat);
            ticket.setPrice(price);
            ticket.setStatus(TicketStatus.PAID);
            ticket.setCreatedAt(now);
            ticket.setCreatedBy(userEmail);
            ticket.setUpdatedAt(now);
            ticket.setUpdatedBy(userEmail);
            ticket = ticketRepository.save(ticket);

            total = total.add(price);
            ticketResponses.add(new TicketResponse(
                    ticket.getId(), seat.getId(),
                    seat.getRowLabel(), seat.getSeatNumber(),
                    seat.getTier().getName(), price));
        }

        booking.setTotalPrice(total);
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setUpdatedAt(LocalDateTime.now());
        booking = bookingRepository.save(booking);

        return toResponse(booking, ticketResponses);
    }

    public BookingResponse findById(Long id) {
        Booking booking = bookingRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));
        List<TicketResponse> tickets = buildTicketResponses(booking);
        return toResponse(booking, tickets);
    }

    public List<BookingResponse> findMyBookings(String userEmail) {
        return bookingRepository.findByUser_EmailAndDeletedAtIsNull(userEmail)
                .stream()
                .map(b -> toResponse(b, buildTicketResponses(b)))
                .toList();
    }

    @Transactional
    public BookingResponse cancel(Long id, String userEmail) {
        Booking booking = bookingRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));
        if (!booking.getUser().getEmail().equals(userEmail)) {
            throw new BadRequestException("Not authorized to cancel this booking");
        }
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Booking is already cancelled");
        }
        LocalDateTime now = LocalDateTime.now();
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setUpdatedAt(now);
        booking.setUpdatedBy(userEmail);
        booking = bookingRepository.save(booking);

        List<Ticket> tickets = ticketRepository.findByBookingId(booking.getId());
        tickets.forEach(t -> {
            t.setStatus(TicketStatus.CANCELLED);
            t.setUpdatedAt(now);
            t.setUpdatedBy(userEmail);
        });
        ticketRepository.saveAll(tickets);

        return toResponse(booking, buildTicketResponses(booking));
    }

    private List<TicketResponse> buildTicketResponses(Booking booking) {
        return ticketRepository.findByBookingId(booking.getId())
                .stream()
                .map(t -> new TicketResponse(
                        t.getId(), t.getSeat().getId(),
                        t.getSeat().getRowLabel(), t.getSeat().getSeatNumber(),
                        t.getSeat().getTier().getName(), t.getPrice()))
                .toList();
    }

    private BookingResponse toResponse(Booking booking, List<TicketResponse> tickets) {
        Showtime s = booking.getShowtime();
        return new BookingResponse(
                booking.getId(),
                booking.getUser().getId(),
                s.getId(),
                s.getMovie().getTitle(),
                s.getMovie().getPosterUrl(),
                s.getRoom().getName(),
                s.getStartTime(),
                booking.getTotalPrice(),
                booking.getStatus(),
                tickets,
                booking.getCreatedAt());
    }
}
```

- [ ] **Step 6: Add `findByBookingId` to `TicketRepository`**

In `TicketRepository.java`, add to the interface body:

```java
List<Ticket> findByBookingId(Long bookingId);
```

You'll also need to add the import: `import java.util.List;` if not already present.

- [ ] **Step 7: Create `BookingController.java`**

```java
package com.movie.server.controller;

import com.movie.server.dto.request.BookingRequest;
import com.movie.server.dto.response.ApiResponse;
import com.movie.server.dto.response.BookingResponse;
import com.movie.server.service.BookingService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bookings")
@Tag(name = "Bookings", description = "Seat reservation and booking management")
@SecurityRequirement(name = "bearerAuth")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> create(
            @RequestBody BookingRequest request, Authentication auth) {
        BookingResponse response = bookingService.create(request, auth.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(LocalDateTime.now(), HttpStatus.CREATED.value(),
                        "Booking created", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(LocalDateTime.now(), HttpStatus.OK.value(),
                "Booking fetched", bookingService.findById(id)));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> myBookings(Authentication auth) {
        return ResponseEntity.ok(new ApiResponse<>(LocalDateTime.now(), HttpStatus.OK.value(),
                "Bookings fetched", bookingService.findMyBookings(auth.getName())));
    }

    @DeleteMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<BookingResponse>> cancel(
            @PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(new ApiResponse<>(LocalDateTime.now(), HttpStatus.OK.value(),
                "Booking cancelled", bookingService.cancel(id, auth.getName())));
    }
}
```

- [ ] **Step 8: Add `/api/bookings/**` rules to `SecurityConfig`**

In `SecurityConfig.java`, inside the `authorizeHttpRequests` chain, add **before** `.anyRequest().authenticated()`:

```java
.requestMatchers("/api/bookings/**").authenticated()
```

- [ ] **Step 9: Build to verify**

```bash
cd apps/server && ./gradlew build -x test
```

Expected: `BUILD SUCCESSFUL`

- [ ] **Step 10: Commit**

```bash
git add apps/server/src/main/java/com/movie/server/dto/request/BookingRequest.java \
        apps/server/src/main/java/com/movie/server/dto/response/TicketResponse.java \
        apps/server/src/main/java/com/movie/server/dto/response/BookingResponse.java \
        apps/server/src/main/java/com/movie/server/repository/BookingRepository.java \
        apps/server/src/main/java/com/movie/server/repository/TicketRepository.java \
        apps/server/src/main/java/com/movie/server/service/BookingService.java \
        apps/server/src/main/java/com/movie/server/controller/BookingController.java \
        apps/server/src/main/java/com/movie/server/security/SecurityConfig.java
git commit -m "feat(backend): add BookingController with seat reservation"
```

---

## Task 3: Backend — Seat Availability Endpoint

**Files:**
- Create: `apps/server/src/main/java/com/movie/server/dto/response/SeatAvailabilityResponse.java`
- Modify: `apps/server/src/main/java/com/movie/server/repository/TicketRepository.java`
- Modify: `apps/server/src/main/java/com/movie/server/service/SeatService.java`
- Modify: `apps/server/src/main/java/com/movie/server/controller/SeatController.java`

- [ ] **Step 1: Create `SeatAvailabilityResponse.java`**

```java
package com.movie.server.dto.response;

public class SeatAvailabilityResponse {
    private Long id;
    private Long roomId;
    private String roomName;
    private String rowLabel;
    private Integer seatNumber;
    private Long tierId;
    private String tierName;
    private boolean isBooked;

    public SeatAvailabilityResponse(Long id, Long roomId, String roomName,
                                    String rowLabel, Integer seatNumber,
                                    Long tierId, String tierName, boolean isBooked) {
        this.id = id;
        this.roomId = roomId;
        this.roomName = roomName;
        this.rowLabel = rowLabel;
        this.seatNumber = seatNumber;
        this.tierId = tierId;
        this.tierName = tierName;
        this.isBooked = isBooked;
    }

    public Long getId() { return id; }
    public Long getRoomId() { return roomId; }
    public String getRoomName() { return roomName; }
    public String getRowLabel() { return rowLabel; }
    public Integer getSeatNumber() { return seatNumber; }
    public Long getTierId() { return tierId; }
    public String getTierName() { return tierName; }
    public boolean isBooked() { return isBooked; }
}
```

- [ ] **Step 2: Add booked-seat query to `TicketRepository`**

In `TicketRepository.java`, add after the existing queries:

```java
@Query("SELECT t.seat.id FROM Ticket t WHERE t.showtime.id = :showtimeId AND t.status <> com.movie.server.enums.TicketStatus.CANCELLED")
List<Long> findBookedSeatIdsByShowtimeId(@Param("showtimeId") Long showtimeId);
```

Ensure these imports are present at the top of the file:
```java
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
```

- [ ] **Step 3: Add `findAvailable` to `SeatService`**

Read `SeatService.java` first to see its existing structure. Then add these imports:

```java
import com.movie.server.dto.response.SeatAvailabilityResponse;
import com.movie.server.entity.Showtime;
import com.movie.server.repository.ShowtimeRepository;
import com.movie.server.repository.TicketRepository;
import java.util.HashSet;
import java.util.Set;
```

Add `ShowtimeRepository` and `TicketRepository` as constructor-injected fields. Read the existing `SeatService.java` to see the current constructor, then replace it with:

```java
private final SeatRepository seatRepository;
private final ShowtimeRepository showtimeRepository;
private final TicketRepository ticketRepository;

public SeatService(SeatRepository seatRepository,
                   ShowtimeRepository showtimeRepository,
                   TicketRepository ticketRepository) {
    this.seatRepository = seatRepository;
    this.showtimeRepository = showtimeRepository;
    this.ticketRepository = ticketRepository;
}
```

Add the method:

```java
public List<SeatAvailabilityResponse> findAvailable(Long showtimeId) {
    Showtime showtime = showtimeRepository.findByIdAndDeletedAtIsNull(showtimeId)
            .orElseThrow(() -> new ResourceNotFoundException("Showtime not found: " + showtimeId));
    Set<Long> booked = new HashSet<>(ticketRepository.findBookedSeatIdsByShowtimeId(showtimeId));
    return seatRepository.findByRoomIdAndDeletedAtIsNull(showtime.getRoom().getId())
            .stream()
            .map(seat -> new SeatAvailabilityResponse(
                    seat.getId(),
                    seat.getRoom().getId(),
                    seat.getRoom().getName(),
                    seat.getRowLabel(),
                    seat.getSeatNumber(),
                    seat.getTier().getId(),
                    seat.getTier().getName(),
                    booked.contains(seat.getId())))
            .toList();
}
```

- [ ] **Step 4: Add `/available` endpoint to `SeatController`**

In `SeatController.java`, add this method. Also inject `SeatService` is already there; just add the endpoint after `findAll`:

```java
@GetMapping("/available")
@Operation(summary = "Get all seats for a showtime's room, annotated with booking status")
public ResponseEntity<ApiResponse<List<SeatAvailabilityResponse>>> findAvailable(
        @Parameter(description = "Showtime ID") @RequestParam Long showtimeId) {
    List<SeatAvailabilityResponse> response = seatService.findAvailable(showtimeId);
    return ResponseEntity.ok(new ApiResponse<>(LocalDateTime.now(), HttpStatus.OK.value(),
            "Available seats fetched", response));
}
```

Add import at top of `SeatController.java`:
```java
import com.movie.server.dto.response.SeatAvailabilityResponse;
```

- [ ] **Step 5: Build to verify**

```bash
cd apps/server && ./gradlew build -x test
```

Expected: `BUILD SUCCESSFUL`

- [ ] **Step 6: Commit**

```bash
git add apps/server/src/main/java/com/movie/server/dto/response/SeatAvailabilityResponse.java \
        apps/server/src/main/java/com/movie/server/repository/TicketRepository.java \
        apps/server/src/main/java/com/movie/server/service/SeatService.java \
        apps/server/src/main/java/com/movie/server/controller/SeatController.java
git commit -m "feat(backend): add seat availability endpoint GET /api/seats/available"
```

---

## Task 4: Frontend — Types + Error Utility

**Files:**
- Modify: `apps/website/src/types/food.ts`
- Modify: `apps/website/src/types/movie.ts`
- Modify: `apps/website/src/types/cinema.ts`
- Modify: `apps/website/src/types/showtime.ts`
- Create: `apps/website/src/types/booking.ts`
- Create: `apps/website/src/types/order.ts`
- Create: `apps/website/src/types/payment.ts`
- Create: `apps/website/src/types/staff.ts`
- Create: `apps/website/src/types/dashboard.ts`
- Create: `apps/website/src/utils/error.ts`

- [ ] **Step 1: Update `food.ts`**

Replace content of `apps/website/src/types/food.ts`:

```ts
export type FoodCategory = "All Items" | "COMBO" | "COUPLE_SET" | "POPCORN" | "DRINK" | "CANDY";

export const CATEGORY_LABELS: Record<string, string> = {
  COMBO: "Combos",
  COUPLE_SET: "Couple Sets",
  POPCORN: "Popcorn",
  DRINK: "Drinks",
  CANDY: "Candy",
};

export interface FoodItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string | null;
  imageUrl: string;
  isAvailable: boolean;
}
```

- [ ] **Step 2: Update `movie.ts`**

Replace content of `apps/website/src/types/movie.ts` (aligning to backend camelCase):

```ts
export interface Movie {
  id: number;
  title: string;
  description: string | null;
  durationMinutes: number;
  releaseDate: string | null;
  rating: string | null;
  genre: string | null;
  ageRating: string | null;
  posterUrl: string;
  trailerUrl: string | null;
  createdAt: string;
  updatedAt: string | null;
}
```

- [ ] **Step 3: Update `cinema.ts`**

Replace content of `apps/website/src/types/cinema.ts`:

```ts
export interface TheaterRoom {
  id: number;
  name: string;
  totalRows: number;
  seatsPerRow: number;
}

export interface Seat {
  id: number;
  roomId: number;
  roomName: string;
  rowLabel: string;
  seatNumber: number;
  tierId: number;
  tierName: string;
}

export interface SeatAvailability extends Seat {
  isBooked: boolean;
}

export interface SeatTier {
  id: number;
  name: string;
  priceMultiplier: number;
  description: string | null;
}
```

- [ ] **Step 4: Update `showtime.ts`**

Replace content of `apps/website/src/types/showtime.ts`:

```ts
export interface Showtime {
  id: number;
  movieId: number;
  movieTitle: string;
  moviePosterUrl: string;
  roomId: number;
  roomName: string;
  startTime: string;
  endTime: string;
  basePrice: number;
}
```

- [ ] **Step 5: Create `booking.ts`**

```ts
export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export interface Ticket {
  id: number;
  seatId: number;
  rowLabel: string;
  seatNumber: number;
  tierName: string;
  price: number;
}

export interface Booking {
  id: number;
  userId: number;
  showtimeId: number;
  movieTitle: string;
  moviePosterUrl: string;
  roomName: string;
  startTime: string;
  totalPrice: number;
  status: BookingStatus;
  tickets: Ticket[];
  createdAt: string;
}

export interface BookingRequest {
  showtimeId: number;
  seatIds: number[];
}
```

- [ ] **Step 6: Create `order.ts`**

```ts
export type OrderStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export interface OrderItem {
  id: number;
  orderId: number;
  foodItemId: number;
  foodItemName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  userId: number;
  bookingId: number | null;
  status: OrderStatus;
  totalPrice: number;
  items: OrderItem[];
  createdAt: string;
}

export interface PlaceOrderRequest {
  bookingId: number | null;
  items: { foodItemId: number; quantity: number }[];
}

export interface PlaceOrderResponse {
  id: number;
  userId: number;
  bookingId: number | null;
  status: OrderStatus;
  totalPrice: number;
  items: OrderItem[];
  createdAt: string;
}
```

- [ ] **Step 7: Create `payment.ts`**

```ts
export type PaymentMethod = "CASH" | "VNPAY";
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

export interface Payment {
  id: number;
  bookingId: number | null;
  orderId: number | null;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  paidAt: string | null;
}

export interface PaymentRequest {
  bookingId: number | null;
  orderId: number | null;
  amount: number;
  method: PaymentMethod;
}
```

- [ ] **Step 8: Create `staff.ts`**

```ts
export interface Staff {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  shift: string;
  status: string;
  enabled: boolean;
  createdAt: string;
}

export interface StaffRequest {
  name: string;
  email: string;
  phone: string;
  role: string;
  shift: string;
  status: string;
}
```

- [ ] **Step 9: Create `dashboard.ts`**

```ts
export interface DailySummary {
  date: string;
  ticketCount: number;
  revenue: number;
}

export interface DashboardStats {
  totalTicketsSold: number;
  totalRevenue: number;
  dailySummaries: DailySummary[];
}
```

- [ ] **Step 10: Create `src/utils/error.ts`**

```ts
export function extractErrorMessage(error: unknown, defaultMessage: string): string {
  if (!error || typeof error !== "object") return defaultMessage;
  const err = error as Record<string, unknown>;
  if (!err.response) return "Cannot connect to server. Please check that the backend is running.";
  const response = err.response as Record<string, unknown>;
  if (response.data) {
    const data = response.data as Record<string, unknown>;
    if (typeof data === "string") return data;
    if (typeof data.message === "string") return data.message;
  }
  return defaultMessage;
}
```

- [ ] **Step 11: TypeScript check**

```bash
cd apps/website && npx tsc --noEmit
```

Expected: no errors (there will be errors in pages that still reference old type shapes — fix them in later tasks; for now just confirm the type files themselves compile).

- [ ] **Step 12: Commit**

```bash
git add apps/website/src/types/ apps/website/src/utils/error.ts
git commit -m "feat(frontend): update types and add error utility"
```

---

## Task 5: Frontend — Service Layer

**Files:**
- Modify: `apps/website/src/services/auth.service.ts`
- Create: `apps/website/src/services/movie.service.ts`
- Create: `apps/website/src/services/showtime.service.ts`
- Create: `apps/website/src/services/booking.service.ts`
- Create: `apps/website/src/services/seat.service.ts`
- Create: `apps/website/src/services/seatTier.service.ts`
- Create: `apps/website/src/services/food.service.ts`
- Create: `apps/website/src/services/order.service.ts`
- Create: `apps/website/src/services/payment.service.ts`
- Create: `apps/website/src/services/theaterRoom.service.ts`
- Create: `apps/website/src/services/staff.service.ts`
- Create: `apps/website/src/services/dashboard.service.ts`

All services unwrap `response.data.data` — the backend wraps every response as `{ timestamp, code, message, data: T }`.

- [ ] **Step 1: Extend `auth.service.ts`**

Replace the full file:

```ts
import api from "./api";
import { extractErrorMessage } from "../utils/error";

export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post("/api/auth/login", { email, password });
      const payload = response.data?.data ?? response.data;
      if (payload?.token) {
        localStorage.setItem("token", payload.token);
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userRole", payload.role ?? "");
        localStorage.setItem("userFullName", payload.fullName ?? "");
      }
      return payload;
    } catch (error) {
      throw extractErrorMessage(error, "Login failed");
    }
  },

  register: async (fullName: string, email: string, password: string) => {
    try {
      const response = await api.post("/api/auth/register", { name: fullName, email, password });
      return response.data?.data ?? response.data;
    } catch (error) {
      throw extractErrorMessage(error, "Registration failed");
    }
  },

  forgotPassword: async (email: string) => {
    try {
      const response = await api.post("/api/auth/forgot-password", { email });
      return response.data?.data ?? response.data;
    } catch (error) {
      throw extractErrorMessage(error, "Failed to send OTP");
    }
  },

  verifyOtp: async (email: string, otp: string) => {
    try {
      const response = await api.post("/api/auth/verify-otp", { email, otp });
      return response.data?.data ?? response.data;
    } catch (error) {
      throw extractErrorMessage(error, "OTP verification failed");
    }
  },

  resetPassword: async (email: string, otp: string, newPassword: string) => {
    try {
      const response = await api.post("/api/auth/reset-password", { email, otp, newPassword });
      return response.data?.data ?? response.data;
    } catch (error) {
      throw extractErrorMessage(error, "Password reset failed");
    }
  },

  me: async () => {
    try {
      const response = await api.get("/api/auth/me");
      return response.data?.data ?? response.data;
    } catch (error) {
      throw extractErrorMessage(error, "Failed to fetch user info");
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userFullName");
  },

  getCurrentUser: () => localStorage.getItem("userEmail"),
  getCurrentRole: () => localStorage.getItem("userRole"),
};
```

- [ ] **Step 2: Create `movie.service.ts`**

```ts
import api from "./api";
import type { Movie } from "../types/movie";
import { extractErrorMessage } from "../utils/error";

export const movieService = {
  getAll: async (): Promise<Movie[]> => {
    try {
      const res = await api.get("/api/movies");
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to load movies"); }
  },

  getNowShowing: async (): Promise<Movie[]> => {
    try {
      const res = await api.get("/api/movies/now-showing");
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to load now-showing movies"); }
  },

  getById: async (id: number): Promise<Movie> => {
    try {
      const res = await api.get(`/api/movies/${id}`);
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to load movie"); }
  },

  create: async (formData: FormData): Promise<Movie> => {
    try {
      const res = await api.post("/api/movies", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to create movie"); }
  },

  update: async (id: number, formData: FormData): Promise<Movie> => {
    try {
      const res = await api.put(`/api/movies/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to update movie"); }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/api/movies/${id}`);
    } catch (e) { throw extractErrorMessage(e, "Failed to delete movie"); }
  },

  uploadPoster: async (file: File): Promise<{ posterUrl: string }> => {
    try {
      const formData = new FormData();
      formData.append("poster", file);
      const res = await api.post("/api/movies/poster", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to upload poster"); }
  },
};
```

- [ ] **Step 3: Create `showtime.service.ts`**

```ts
import api from "./api";
import type { Showtime } from "../types/showtime";
import { extractErrorMessage } from "../utils/error";

export interface ShowtimeRequest {
  movieId: number;
  roomId: number;
  startTime: string;
  endTime: string;
  basePrice: number;
}

export const showtimeService = {
  getAll: async (movieId?: number, from?: string, to?: string): Promise<Showtime[]> => {
    try {
      const params: Record<string, string | number> = {};
      if (movieId !== undefined) params.movieId = movieId;
      if (from) params.from = from;
      if (to) params.to = to;
      const res = await api.get("/api/showtimes", { params });
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to load showtimes"); }
  },

  getById: async (id: number): Promise<Showtime> => {
    try {
      const res = await api.get(`/api/showtimes/${id}`);
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to load showtime"); }
  },

  create: async (req: ShowtimeRequest): Promise<Showtime> => {
    try {
      const res = await api.post("/api/showtimes", req);
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to create showtime"); }
  },

  update: async (id: number, req: ShowtimeRequest): Promise<Showtime> => {
    try {
      const res = await api.put(`/api/showtimes/${id}`, req);
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to update showtime"); }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/api/showtimes/${id}`);
    } catch (e) { throw extractErrorMessage(e, "Failed to delete showtime"); }
  },
};
```

- [ ] **Step 4: Create `booking.service.ts`**

```ts
import api from "./api";
import type { Booking, BookingRequest } from "../types/booking";
import { extractErrorMessage } from "../utils/error";

export const bookingService = {
  create: async (req: BookingRequest): Promise<Booking> => {
    try {
      const res = await api.post("/api/bookings", req);
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to create booking"); }
  },

  getById: async (id: number): Promise<Booking> => {
    try {
      const res = await api.get(`/api/bookings/${id}`);
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to load booking"); }
  },

  getMyBookings: async (): Promise<Booking[]> => {
    try {
      const res = await api.get("/api/bookings/my");
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to load bookings"); }
  },

  cancel: async (id: number): Promise<Booking> => {
    try {
      const res = await api.delete(`/api/bookings/${id}/cancel`);
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to cancel booking"); }
  },
};
```

- [ ] **Step 5: Create `seat.service.ts`**

```ts
import api from "./api";
import type { Seat, SeatAvailability } from "../types/cinema";
import { extractErrorMessage } from "../utils/error";

export interface SeatRequest {
  roomId: number;
  rowLabel: string;
  seatNumber: number;
  tierId: number;
}

export const seatService = {
  getByRoom: async (roomId: number): Promise<Seat[]> => {
    try {
      const res = await api.get("/api/seats", { params: { roomId } });
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to load seats"); }
  },

  getAvailable: async (showtimeId: number): Promise<SeatAvailability[]> => {
    try {
      const res = await api.get("/api/seats/available", { params: { showtimeId } });
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to load available seats"); }
  },

  create: async (req: SeatRequest): Promise<Seat> => {
    try {
      const res = await api.post("/api/seats", req);
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to create seat"); }
  },

  update: async (id: number, req: SeatRequest): Promise<Seat> => {
    try {
      const res = await api.put(`/api/seats/${id}`, req);
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to update seat"); }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/api/seats/${id}`);
    } catch (e) { throw extractErrorMessage(e, "Failed to delete seat"); }
  },
};
```

- [ ] **Step 6: Create `seatTier.service.ts`**

```ts
import api from "./api";
import type { SeatTier } from "../types/cinema";
import { extractErrorMessage } from "../utils/error";

export interface SeatTierRequest {
  name: string;
  priceMultiplier: number;
  description?: string;
}

export const seatTierService = {
  getAll: async (): Promise<SeatTier[]> => {
    try {
      const res = await api.get("/api/seat-tiers");
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to load seat tiers"); }
  },

  getById: async (id: number): Promise<SeatTier> => {
    try {
      const res = await api.get(`/api/seat-tiers/${id}`);
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to load seat tier"); }
  },

  create: async (req: SeatTierRequest): Promise<SeatTier> => {
    try {
      const res = await api.post("/api/seat-tiers", req);
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to create seat tier"); }
  },

  update: async (id: number, req: SeatTierRequest): Promise<SeatTier> => {
    try {
      const res = await api.put(`/api/seat-tiers/${id}`, req);
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to update seat tier"); }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/api/seat-tiers/${id}`);
    } catch (e) { throw extractErrorMessage(e, "Failed to delete seat tier"); }
  },
};
```

- [ ] **Step 7: Create `food.service.ts`**

```ts
import api from "./api";
import type { FoodItem } from "../types/food";
import { extractErrorMessage } from "../utils/error";

export interface FoodItemRequest {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable?: boolean;
  category?: string;
}

export const foodService = {
  getAll: async (): Promise<FoodItem[]> => {
    try {
      const res = await api.get("/api/food-items");
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to load food items"); }
  },

  getById: async (id: number): Promise<FoodItem> => {
    try {
      const res = await api.get(`/api/food-items/${id}`);
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to load food item"); }
  },

  create: async (formData: FormData): Promise<FoodItem> => {
    try {
      const res = await api.post("/api/food-items", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to create food item"); }
  },

  update: async (id: number, req: FoodItemRequest): Promise<FoodItem> => {
    try {
      const res = await api.put(`/api/food-items/${id}`, req);
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to update food item"); }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/api/food-items/${id}`);
    } catch (e) { throw extractErrorMessage(e, "Failed to delete food item"); }
  },
};
```

- [ ] **Step 8: Create `order.service.ts`**

```ts
import api from "./api";
import type { Order, PlaceOrderRequest, PlaceOrderResponse } from "../types/order";
import { extractErrorMessage } from "../utils/error";

export const orderService = {
  place: async (req: PlaceOrderRequest): Promise<PlaceOrderResponse> => {
    try {
      const res = await api.post("/api/orders/place", req);
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to place order"); }
  },

  getMyOrders: async (): Promise<Order[]> => {
    try {
      const res = await api.get("/api/orders/my");
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to load orders"); }
  },

  getAll: async (): Promise<Order[]> => {
    try {
      const res = await api.get("/api/orders");
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to load orders"); }
  },

  getById: async (id: number): Promise<Order> => {
    try {
      const res = await api.get(`/api/orders/${id}`);
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to load order"); }
  },

  cancel: async (id: number): Promise<Order> => {
    try {
      const res = await api.post(`/api/orders/${id}/cancel`);
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to cancel order"); }
  },
};
```

- [ ] **Step 9: Create `payment.service.ts`**

```ts
import api from "./api";
import type { Payment, PaymentRequest } from "../types/payment";
import { extractErrorMessage } from "../utils/error";

export const paymentService = {
  create: async (req: PaymentRequest): Promise<Payment> => {
    try {
      const res = await api.post("/api/payments", req);
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to create payment"); }
  },

  getById: async (id: number): Promise<Payment> => {
    try {
      const res = await api.get(`/api/payments/${id}`);
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to load payment"); }
  },

  handleVnpayReturn: async (params: Record<string, string>): Promise<unknown> => {
    try {
      const res = await api.get("/api/payments/vnpay/return", { params });
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to handle VNPay return"); }
  },
};
```

- [ ] **Step 10: Create `theaterRoom.service.ts`**

```ts
import api from "./api";
import type { TheaterRoom } from "../types/cinema";
import { extractErrorMessage } from "../utils/error";

export interface TheaterRoomRequest {
  name: string;
  totalRows: number;
  seatsPerRow: number;
}

export const theaterRoomService = {
  getAll: async (): Promise<TheaterRoom[]> => {
    try {
      const res = await api.get("/api/theater-rooms");
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to load theater rooms"); }
  },

  getById: async (id: number): Promise<TheaterRoom> => {
    try {
      const res = await api.get(`/api/theater-rooms/${id}`);
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to load theater room"); }
  },

  create: async (req: TheaterRoomRequest): Promise<TheaterRoom> => {
    try {
      const res = await api.post("/api/theater-rooms", req);
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to create theater room"); }
  },

  update: async (id: number, req: TheaterRoomRequest): Promise<TheaterRoom> => {
    try {
      const res = await api.put(`/api/theater-rooms/${id}`, req);
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to update theater room"); }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/api/theater-rooms/${id}`);
    } catch (e) { throw extractErrorMessage(e, "Failed to delete theater room"); }
  },
};
```

- [ ] **Step 11: Create `staff.service.ts`**

```ts
import api from "./api";
import type { Staff, StaffRequest } from "../types/staff";
import { extractErrorMessage } from "../utils/error";

export const staffService = {
  getAll: async (): Promise<Staff[]> => {
    try {
      const res = await api.get("/api/staff");
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to load staff"); }
  },

  getById: async (id: number): Promise<Staff> => {
    try {
      const res = await api.get(`/api/staff/${id}`);
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to load staff member"); }
  },

  create: async (req: StaffRequest): Promise<Staff> => {
    try {
      const res = await api.post("/api/staff", req);
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to create staff member"); }
  },

  update: async (id: number, req: StaffRequest): Promise<Staff> => {
    try {
      const res = await api.put(`/api/staff/${id}`, req);
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to update staff member"); }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/api/staff/${id}`);
    } catch (e) { throw extractErrorMessage(e, "Failed to delete staff member"); }
  },
};
```

- [ ] **Step 12: Create `dashboard.service.ts`**

```ts
import api from "./api";
import type { DashboardStats } from "../types/dashboard";
import { extractErrorMessage } from "../utils/error";

export const dashboardService = {
  get: async (from?: string, to?: string): Promise<DashboardStats> => {
    try {
      const params: Record<string, string> = {};
      if (from) params.from = from;
      if (to) params.to = to;
      const res = await api.get("/api/dashboard", { params });
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to load dashboard"); }
  },
};
```

- [ ] **Step 13: TypeScript check**

```bash
cd apps/website && npx tsc --noEmit
```

Expected: only errors inside page files (which still reference old shapes) — not inside `services/` or `types/` or `utils/`.

- [ ] **Step 14: Commit**

```bash
git add apps/website/src/services/ apps/website/src/utils/
git commit -m "feat(frontend): add full service layer for all API domains"
```

---

## Task 6: Frontend — BookingContext + App.tsx

**Files:**
- Create: `apps/website/src/contexts/BookingContext.tsx`
- Modify: `apps/website/src/App.tsx`

- [ ] **Step 1: Create `BookingContext.tsx`**

```tsx
import { createContext, useContext, useState, type ReactNode } from "react";

interface BookingState {
  showtimeId: number | null;
  selectedSeatIds: number[];
  bookingId: number | null;
  orderId: number | null;
  paymentId: number | null;
}

interface BookingContextValue extends BookingState {
  setShowtime: (id: number) => void;
  setSeats: (ids: number[]) => void;
  setBookingId: (id: number) => void;
  setOrderId: (id: number) => void;
  setPaymentId: (id: number) => void;
  reset: () => void;
}

const initial: BookingState = {
  showtimeId: null,
  selectedSeatIds: [],
  bookingId: null,
  orderId: null,
  paymentId: null,
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BookingState>(initial);

  const setShowtime = (id: number) => setState(s => ({ ...s, showtimeId: id }));
  const setSeats = (ids: number[]) => setState(s => ({ ...s, selectedSeatIds: ids }));
  const setBookingId = (id: number) => setState(s => ({ ...s, bookingId: id }));
  const setOrderId = (id: number) => setState(s => ({ ...s, orderId: id }));
  const setPaymentId = (id: number) => setState(s => ({ ...s, paymentId: id }));
  const reset = () => setState(initial);

  return (
    <BookingContext.Provider value={{ ...state, setShowtime, setSeats, setBookingId, setOrderId, setPaymentId, reset }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking(): BookingContextValue {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used inside BookingProvider");
  return ctx;
}
```

- [ ] **Step 2: Wrap user routes in `App.tsx`**

In `App.tsx`, add the import at the top:

```tsx
import { BookingProvider } from "./contexts/BookingContext";
```

Then wrap the user routes block (home, movies, theater, seats, snacks, payment, confirmation) with `<BookingProvider>`:

```tsx
{/* ================= USER ROUTES ================= */}
<Route path="/home" element={<BookingProvider><MainLayout><Home /></MainLayout></BookingProvider>} />
<Route path="/movies" element={<BookingProvider><MainLayout><Movies /></MainLayout></BookingProvider>} />
<Route path="/theater" element={<BookingProvider><MainLayout><Theater /></MainLayout></BookingProvider>} />
<Route path="/seats" element={<BookingProvider><MainLayout><Seats /></MainLayout></BookingProvider>} />
<Route path="/snacks" element={<BookingProvider><MainLayout><Snacks /></MainLayout></BookingProvider>} />
<Route path="/payment" element={<BookingProvider><MainLayout><Payment /></MainLayout></BookingProvider>} />
<Route path="/confirmation" element={<BookingProvider><MainLayout><BookingConfirmation /></MainLayout></BookingProvider>} />
```

> Note: React Context doesn't share state across page navigations when each route creates its own provider. To share state across the entire booking flow, wrap all user routes in a **single** `BookingProvider` at the layout level. Update `App.tsx` to wrap `MainLayout` itself, or create a `UserLayout` wrapper that includes `BookingProvider`:

Replace the user routes block with a nested route approach:

```tsx
import { BookingProvider } from "./contexts/BookingContext";

// In App.tsx Routes:
<Route element={<BookingProvider><MainLayout><Outlet /></MainLayout></BookingProvider>}>
  <Route path="/home" element={<Home />} />
  <Route path="/movies" element={<Movies />} />
  <Route path="/theater" element={<Theater />} />
  <Route path="/seats" element={<Seats />} />
  <Route path="/snacks" element={<Snacks />} />
  <Route path="/payment" element={<Payment />} />
  <Route path="/confirmation" element={<BookingConfirmation />} />
</Route>
```

Also add the `Outlet` import: `import { HashRouter as Router, Routes, Route, Outlet } from "react-router-dom";`

- [ ] **Step 3: TypeScript check**

```bash
cd apps/website && npx tsc --noEmit
```

Expected: no new errors in `contexts/` or `App.tsx`.

- [ ] **Step 4: Commit**

```bash
git add apps/website/src/contexts/BookingContext.tsx apps/website/src/App.tsx
git commit -m "feat(frontend): add BookingContext and update App routing"
```

---

## Task 7: Frontend — Auth Pages

**Files:**
- Modify: `apps/website/src/pages/auth/Login.tsx`
- Modify: `apps/website/src/pages/auth/ForgotPassword.tsx`

- [ ] **Step 1: Read `Login.tsx`**

Read the file to understand its current form structure before making changes.

- [ ] **Step 2: Wire Login to `authService.login()`**

Find where the form submit handler is (it currently calls a mock). Replace it with:

```tsx
const [error, setError] = useState<string | null>(null);
const [loading, setLoading] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setLoading(true);
  try {
    await authService.login(email, password);
    navigate("/home");
  } catch (err) {
    setError(typeof err === "string" ? err : "Login failed");
  } finally {
    setLoading(false);
  }
};
```

Add `import { authService } from "../../services/auth.service";` at the top.

Display `{error && <p className="text-red-500 text-sm">{error}</p>}` in the JSX near the submit button.

Disable the submit button while `loading` is `true`.

- [ ] **Step 3: Wire `ForgotPassword.tsx` to OTP flow**

Read the file first. The page should have three steps: enter email → enter OTP → reset password.

Add state and handlers:

```tsx
import { authService } from "../../services/auth.service";

const [step, setStep] = useState<"email" | "otp" | "reset">("email");
const [email, setEmail] = useState("");
const [otp, setOtp] = useState("");
const [newPassword, setNewPassword] = useState("");
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [success, setSuccess] = useState<string | null>(null);

const handleSendOtp = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setLoading(true);
  try {
    await authService.forgotPassword(email);
    setSuccess("OTP sent to your email.");
    setStep("otp");
  } catch (err) {
    setError(typeof err === "string" ? err : "Failed to send OTP");
  } finally {
    setLoading(false);
  }
};

const handleVerifyOtp = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setLoading(true);
  try {
    await authService.verifyOtp(email, otp);
    setStep("reset");
  } catch (err) {
    setError(typeof err === "string" ? err : "OTP verification failed");
  } finally {
    setLoading(false);
  }
};

const handleResetPassword = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setLoading(true);
  try {
    await authService.resetPassword(email, otp, newPassword);
    navigate("/");
  } catch (err) {
    setError(typeof err === "string" ? err : "Password reset failed");
  } finally {
    setLoading(false);
  }
};
```

Wire each form's `onSubmit` to the appropriate handler based on `step`. Show `error` and `success` messages.

- [ ] **Step 4: Compile check**

```bash
cd apps/website && npx tsc --noEmit 2>&1 | grep "auth/"
```

Expected: no errors in auth pages.

- [ ] **Step 5: Commit**

```bash
git add apps/website/src/pages/auth/
git commit -m "feat(frontend): wire auth pages to real API"
```

---

## Task 8: Frontend — User Booking Flow (Home → Theater → Seats)

**Files:**
- Modify: `apps/website/src/pages/home/Home.tsx`
- Modify: `apps/website/src/pages/movie/Movies.tsx`
- Modify: `apps/website/src/pages/movie/Theater.tsx`
- Modify: `apps/website/src/pages/movie/Seats.tsx`

For each page: (1) read the file, (2) locate mock data arrays, (3) replace with the pattern below, (4) pass real data to the existing UI components.

**Shared fetch pattern** (use for every page):

```tsx
const [data, setData] = useState<T[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  service.method()
    .then(setData)
    .catch(err => setError(typeof err === "string" ? err : "Failed to load"))
    .finally(() => setLoading(false));
}, []);

if (loading) return <div className="text-center p-8">Loading…</div>;
if (error) return <div className="text-center p-8 text-red-500">{error}</div>;
```

- [ ] **Step 1: Wire `Home.tsx`**

Read the file. Find the mock movie list. Replace with:

```tsx
import { useEffect, useState } from "react";
import { movieService } from "../../services/movie.service";
import type { Movie } from "../../types/movie";

// inside component:
const [movies, setMovies] = useState<Movie[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  movieService.getNowShowing()
    .then(setMovies)
    .catch(() => {})
    .finally(() => setLoading(false));
}, []);
```

Update JSX to render `movies` instead of the hardcoded array. Use `movie.posterUrl`, `movie.title`, `movie.genre`, `movie.durationMinutes`.

- [ ] **Step 2: Wire `Movies.tsx`**

Read the file. Replace mock movies with:

```tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { movieService } from "../../services/movie.service";
import { showtimeService } from "../../services/showtime.service";
import { useBooking } from "../../contexts/BookingContext";
import type { Movie } from "../../types/movie";

const navigate = useNavigate();
const { setShowtime } = useBooking();
const [movies, setMovies] = useState<Movie[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  movieService.getAll()
    .then(setMovies)
    .catch(err => setError(typeof err === "string" ? err : "Failed to load movies"))
    .finally(() => setLoading(false));
}, []);

const handleSelectMovie = async (movieId: number) => {
  // fetch showtimes for this movie, then navigate to Theater to pick one
  navigate("/theater", { state: { movieId } });
};
```

On movie card click, call `handleSelectMovie(movie.id)`.

- [ ] **Step 3: Wire `Theater.tsx` (Showtime Picker)**

Read the file. This page currently shows hardcoded theater locations. Replace with real showtimes for the movie passed via router state:

```tsx
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { showtimeService } from "../../services/showtime.service";
import { useBooking } from "../../contexts/BookingContext";
import type { Showtime } from "../../types/showtime";

const navigate = useNavigate();
const location = useLocation();
const { setShowtime } = useBooking();
const movieId: number | undefined = (location.state as { movieId?: number })?.movieId;

const [showtimes, setShowtimes] = useState<Showtime[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  if (!movieId) { navigate("/movies"); return; }
  showtimeService.getAll(movieId)
    .then(setShowtimes)
    .catch(err => setError(typeof err === "string" ? err : "Failed to load showtimes"))
    .finally(() => setLoading(false));
}, [movieId]);

const handleSelect = (showtimeId: number) => {
  setShowtime(showtimeId);
  navigate("/seats");
};
```

Update the JSX to render each showtime as a selectable card showing `showtime.roomName`, `showtime.startTime`, `showtime.basePrice`. Call `handleSelect(showtime.id)` on click.

- [ ] **Step 4: Wire `Seats.tsx`**

Read the file. Replace mock seat grid with:

```tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { seatService } from "../../services/seat.service";
import { bookingService } from "../../services/booking.service";
import { useBooking } from "../../contexts/BookingContext";
import type { SeatAvailability } from "../../types/cinema";

const navigate = useNavigate();
const { showtimeId, setBookingId, setSeats } = useBooking();

const [seats, setSeatsData] = useState<SeatAvailability[]>([]);
const [selected, setSelected] = useState<number[]>([]);
const [loading, setLoading] = useState(true);
const [submitting, setSubmitting] = useState(false);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  if (!showtimeId) { navigate("/theater"); return; }
  seatService.getAvailable(showtimeId)
    .then(setSeatsData)
    .catch(err => setError(typeof err === "string" ? err : "Failed to load seats"))
    .finally(() => setLoading(false));
}, [showtimeId]);

const toggleSeat = (id: number, isBooked: boolean) => {
  if (isBooked) return;
  setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
};

const handleConfirm = async () => {
  if (selected.length === 0 || !showtimeId) return;
  setSubmitting(true);
  try {
    const booking = await bookingService.create({ showtimeId, seatIds: selected });
    setBookingId(booking.id);
    setSeats(selected);
    navigate("/snacks");
  } catch (err) {
    setError(typeof err === "string" ? err : "Failed to create booking");
  } finally {
    setSubmitting(false);
  }
};
```

Render each seat from `seats`: use `seat.rowLabel + seat.seatNumber` as label, `seat.isBooked` to disable/grey out, `selected.includes(seat.id)` for selection highlight.

- [ ] **Step 5: Compile check**

```bash
cd apps/website && npx tsc --noEmit 2>&1 | grep "movie/\|home/"
```

Expected: no errors in these page files.

- [ ] **Step 6: Commit**

```bash
git add apps/website/src/pages/home/ apps/website/src/pages/movie/Movies.tsx \
        apps/website/src/pages/movie/Theater.tsx apps/website/src/pages/movie/Seats.tsx
git commit -m "feat(frontend): wire home, movies, theater, seats pages to API"
```

---

## Task 9: Frontend — User Booking Flow (Snacks → Payment → Confirmation)

**Files:**
- Modify: `apps/website/src/pages/movie/Snacks.tsx`
- Modify: `apps/website/src/pages/movie/Payment.tsx`
- Modify: `apps/website/src/pages/movie/BookingConfirmation.tsx`

- [ ] **Step 1: Wire `Snacks.tsx`**

Read the file. Replace mock food list:

```tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { foodService } from "../../services/food.service";
import { orderService } from "../../services/order.service";
import { useBooking } from "../../contexts/BookingContext";
import type { FoodItem } from "../../types/food";
import { CATEGORY_LABELS } from "../../types/food";

const navigate = useNavigate();
const { bookingId, setOrderId } = useBooking();

const [foods, setFoods] = useState<FoodItem[]>([]);
const [cart, setCart] = useState<{ foodItemId: number; quantity: number }[]>([]);
const [loading, setLoading] = useState(true);
const [submitting, setSubmitting] = useState(false);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  if (!bookingId) { navigate("/seats"); return; }
  foodService.getAll()
    .then(setFoods)
    .catch(err => setError(typeof err === "string" ? err : "Failed to load food"))
    .finally(() => setLoading(false));
}, [bookingId]);

const addToCart = (foodItemId: number) => {
  setCart(prev => {
    const existing = prev.find(i => i.foodItemId === foodItemId);
    if (existing) return prev.map(i => i.foodItemId === foodItemId ? { ...i, quantity: i.quantity + 1 } : i);
    return [...prev, { foodItemId, quantity: 1 }];
  });
};

const handleContinue = async () => {
  setSubmitting(true);
  try {
    const order = await orderService.place({ bookingId, items: cart });
    setOrderId(order.id);
    navigate("/payment");
  } catch (err) {
    setError(typeof err === "string" ? err : "Failed to place order");
  } finally {
    setSubmitting(false);
  }
};
```

Render foods using `food.imageUrl`, `food.name`, `food.price`, `food.category` (map via `CATEGORY_LABELS`). The cart can skip food (navigate directly to `/payment` with empty items handled gracefully by the backend — or skip calling `orderService.place` if cart is empty and just navigate with no orderId set).

- [ ] **Step 2: Wire `Payment.tsx`**

Read the file. The page collects payment method and triggers payment creation:

```tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { paymentService } from "../../services/payment.service";
import { useBooking } from "../../contexts/BookingContext";
import type { PaymentMethod } from "../../types/payment";

const navigate = useNavigate();
const { bookingId, orderId, setPaymentId } = useBooking();

const [method, setMethod] = useState<PaymentMethod>("CASH");
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const handlePay = async () => {
  if (!bookingId) { navigate("/seats"); return; }
  setLoading(true);
  try {
    // Fetch booking total to send as payment amount
    const booking = await bookingService.getById(bookingId);
    const payment = await paymentService.create({
      bookingId,
      orderId: orderId ?? null,
      amount: booking.totalPrice,
      method,
    });
    setPaymentId(payment.id);
    navigate("/confirmation");
  } catch (err) {
    setError(typeof err === "string" ? err : "Payment failed");
  } finally {
    setLoading(false);
  }
};
```

Wire the existing pay button to `handlePay`. Show `error` if set. Render method selection for CASH / VNPAY.

- [ ] **Step 3: Wire `BookingConfirmation.tsx`**

Read the file. Replace mock receipt with real data:

```tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { bookingService } from "../../services/booking.service";
import { orderService } from "../../services/order.service";
import { useBooking } from "../../contexts/BookingContext";
import type { Booking } from "../../types/booking";
import type { Order } from "../../types/order";

const navigate = useNavigate();
const { bookingId, orderId, reset } = useBooking();

const [booking, setBooking] = useState<Booking | null>(null);
const [order, setOrder] = useState<Order | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  if (!bookingId) { navigate("/home"); return; }
  const fetches = [
    bookingService.getById(bookingId).then(setBooking),
    orderId ? orderService.getById(orderId).then(setOrder) : Promise.resolve(),
  ];
  Promise.all(fetches).finally(() => setLoading(false));
}, [bookingId, orderId]);

const handleGoHome = () => {
  reset();
  navigate("/home");
};
```

Render `booking.movieTitle`, `booking.startTime`, `booking.roomName`, `booking.tickets` (seat labels), `order?.items` (food list), `booking.totalPrice`. Wire the "Back to Home" button to `handleGoHome`.

- [ ] **Step 4: Compile check**

```bash
cd apps/website && npx tsc --noEmit 2>&1 | grep "movie/Snacks\|movie/Payment\|movie/Booking"
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add apps/website/src/pages/movie/Snacks.tsx \
        apps/website/src/pages/movie/Payment.tsx \
        apps/website/src/pages/movie/BookingConfirmation.tsx
git commit -m "feat(frontend): wire snacks, payment, confirmation pages to API"
```

---

## Task 10: Frontend — Admin Pages

**Files:**
- Modify: `apps/website/src/pages/admin/AdminDashboard.tsx`
- Modify: `apps/website/src/pages/admin/AdminMovies.tsx`
- Modify: `apps/website/src/pages/admin/AdminFoods.tsx`
- Modify: `apps/website/src/pages/admin/AdminShowtimes.tsx`
- Modify: `apps/website/src/pages/admin/AdminRooms.tsx`
- Modify: `apps/website/src/pages/admin/AdminStaff.tsx`

For each page: read the file first, then apply the changes below.

**Pattern for admin list pages** (list + CRUD via local state, backed by service calls):

```tsx
const [items, setItems] = useState<T[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  service.getAll()
    .then(setItems)
    .catch(err => setError(typeof err === "string" ? err : "Failed to load"))
    .finally(() => setLoading(false));
}, []);

const handleCreate = async (data: TRequest) => {
  const created = await service.create(data);
  setItems(prev => [...prev, created]);
};

const handleUpdate = async (id: number, data: TRequest) => {
  const updated = await service.update(id, data);
  setItems(prev => prev.map(i => i.id === id ? updated : i));
};

const handleDelete = async (id: number) => {
  await service.delete(id);
  setItems(prev => prev.filter(i => i.id !== id));
};
```

- [ ] **Step 1: Wire `AdminDashboard.tsx`**

```tsx
import { useEffect, useState } from "react";
import { dashboardService } from "../../services/dashboard.service";
import type { DashboardStats } from "../../types/dashboard";

const [stats, setStats] = useState<DashboardStats | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  dashboardService.get()
    .then(setStats)
    .catch(() => {})
    .finally(() => setLoading(false));
}, []);
```

Replace mock stat cards with `stats?.totalTicketsSold`, `stats?.totalRevenue`, `stats?.dailySummaries` (for the chart data).

- [ ] **Step 2: Wire `AdminMovies.tsx`**

```tsx
import { movieService } from "../../services/movie.service";
import type { Movie } from "../../types/movie";
```

Apply the list+CRUD pattern. For create/update, build a `FormData` from the modal form fields:

```tsx
const handleCreate = async (fields: { title: string; description: string; durationMinutes: number; releaseDate: string; rating: string; genre: string; ageRating: string; poster?: File }) => {
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => { if (v !== undefined) fd.append(k, v as string | Blob); });
  const created = await movieService.create(fd);
  setItems(prev => [...prev, created]);
};
```

- [ ] **Step 3: Wire `AdminFoods.tsx`**

```tsx
import { foodService } from "../../services/food.service";
import type { FoodItem } from "../../types/food";
```

Apply list+CRUD pattern. For create, use `FormData` since the backend expects `multipart/form-data`:

```tsx
const handleCreate = async (fields: { name: string; description: string; price: number; category: string; image?: File }) => {
  const fd = new FormData();
  fd.append("name", fields.name);
  fd.append("description", fields.description);
  fd.append("price", String(fields.price));
  if (fields.category) fd.append("category", fields.category);
  if (fields.image) fd.append("image", fields.image);
  const created = await foodService.create(fd);
  setItems(prev => [...prev, created]);
};
```

For update, use `foodService.update(id, { name, description, price, category, imageUrl, isAvailable })`.

- [ ] **Step 4: Wire `AdminShowtimes.tsx`**

```tsx
import { showtimeService } from "../../services/showtime.service";
import { movieService } from "../../services/movie.service";
import { theaterRoomService } from "../../services/theaterRoom.service";
import type { Showtime } from "../../types/showtime";
import type { Movie } from "../../types/movie";
import type { TheaterRoom } from "../../types/cinema";
```

Fetch all three lists in parallel:

```tsx
useEffect(() => {
  Promise.all([
    showtimeService.getAll(),
    movieService.getAll(),
    theaterRoomService.getAll(),
  ]).then(([s, m, r]) => {
    setShowtimes(s);
    setMovies(m);
    setRooms(r);
  }).catch(err => setError(typeof err === "string" ? err : "Failed to load"))
    .finally(() => setLoading(false));
}, []);
```

Apply CRUD pattern. `create`/`update` call `showtimeService.create({ movieId, roomId, startTime, endTime, basePrice })`.

- [ ] **Step 5: Wire `AdminRooms.tsx`**

```tsx
import { theaterRoomService } from "../../services/theaterRoom.service";
import { seatService } from "../../services/seat.service";
import type { TheaterRoom, Seat } from "../../types/cinema";
```

Load rooms with `theaterRoomService.getAll()`. When a room is selected/expanded, load its seats with `seatService.getByRoom(roomId)`. CRUD for rooms uses `theaterRoomService.*`. Seat CRUD uses `seatService.*`.

- [ ] **Step 6: Wire `AdminStaff.tsx`**

```tsx
import { staffService } from "../../services/staff.service";
import type { Staff } from "../../types/staff";
```

Apply list+CRUD pattern with `staffService.*`.

- [ ] **Step 7: Compile check**

```bash
cd apps/website && npx tsc --noEmit 2>&1 | grep "admin/"
```

Expected: no errors in admin pages.

- [ ] **Step 8: Commit**

```bash
git add apps/website/src/pages/admin/
git commit -m "feat(frontend): wire all admin pages to real API"
```

---

## Task 11: Frontend — Staff / POS Pages

**Files:**
- Modify: `apps/website/src/pages/staff/StaffDashboard.tsx`
- Modify: `apps/website/src/pages/staff/POS.tsx`
- Modify: `apps/website/src/pages/staff/FoodPOS.tsx`
- Modify: `apps/website/src/pages/staff/StaffHistory.tsx`

- [ ] **Step 1: Wire `StaffDashboard.tsx`**

```tsx
import { useEffect, useState } from "react";
import { dashboardService } from "../../services/dashboard.service";
import type { DashboardStats } from "../../types/dashboard";

const [stats, setStats] = useState<DashboardStats | null>(null);

useEffect(() => {
  dashboardService.get().then(setStats).catch(() => {});
}, []);
```

Replace hardcoded stat numbers with `stats?.totalTicketsSold`, `stats?.totalRevenue`.

- [ ] **Step 2: Wire `POS.tsx`**

Read the file. The POS lets staff select a movie → showtime → seats → place a booking + optional food order.

```tsx
import { useEffect, useState } from "react";
import { movieService } from "../../services/movie.service";
import { showtimeService } from "../../services/showtime.service";
import { seatService } from "../../services/seat.service";
import { bookingService } from "../../services/booking.service";
import { orderService } from "../../services/order.service";
import type { Movie } from "../../types/movie";
import type { Showtime } from "../../types/showtime";
import type { SeatAvailability } from "../../types/cinema";

const [movies, setMovies] = useState<Movie[]>([]);
const [showtimes, setShowtimes] = useState<Showtime[]>([]);
const [seats, setSeats] = useState<SeatAvailability[]>([]);
const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
const [selectedShowtimeId, setSelectedShowtimeId] = useState<number | null>(null);
const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]);
const [submitting, setSubmitting] = useState(false);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  movieService.getAll().then(setMovies).catch(() => {});
}, []);

useEffect(() => {
  if (!selectedMovieId) return;
  showtimeService.getAll(selectedMovieId).then(setShowtimes).catch(() => {});
}, [selectedMovieId]);

useEffect(() => {
  if (!selectedShowtimeId) return;
  seatService.getAvailable(selectedShowtimeId).then(setSeats).catch(() => {});
}, [selectedShowtimeId]);

const handleConfirm = async () => {
  if (!selectedShowtimeId || selectedSeatIds.length === 0) return;
  setSubmitting(true);
  try {
    await bookingService.create({ showtimeId: selectedShowtimeId, seatIds: selectedSeatIds });
    // reset form
    setSelectedSeatIds([]);
    setSelectedShowtimeId(null);
  } catch (err) {
    setError(typeof err === "string" ? err : "Booking failed");
  } finally {
    setSubmitting(false);
  }
};
```

- [ ] **Step 3: Wire `FoodPOS.tsx`**

```tsx
import { useEffect, useState } from "react";
import { foodService } from "../../services/food.service";
import { orderService } from "../../services/order.service";
import type { FoodItem } from "../../types/food";

const [foods, setFoods] = useState<FoodItem[]>([]);
const [cart, setCart] = useState<{ foodItemId: number; quantity: number }[]>([]);
const [submitting, setSubmitting] = useState(false);
const [error, setError] = useState<string | null>(null);
const [success, setSuccess] = useState(false);

useEffect(() => {
  foodService.getAll().then(setFoods).catch(() => {});
}, []);

const addToCart = (id: number) =>
  setCart(prev => {
    const ex = prev.find(i => i.foodItemId === id);
    return ex ? prev.map(i => i.foodItemId === id ? { ...i, quantity: i.quantity + 1 } : i)
               : [...prev, { foodItemId: id, quantity: 1 }];
  });

const handleCheckout = async () => {
  if (cart.length === 0) return;
  setSubmitting(true);
  try {
    await orderService.place({ bookingId: null, items: cart });
    setCart([]);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  } catch (err) {
    setError(typeof err === "string" ? err : "Order failed");
  } finally {
    setSubmitting(false);
  }
};
```

- [ ] **Step 4: Wire `StaffHistory.tsx`**

```tsx
import { useEffect, useState } from "react";
import { orderService } from "../../services/order.service";
import type { Order } from "../../types/order";

const [orders, setOrders] = useState<Order[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  orderService.getAll()
    .then(setOrders)
    .catch(() => {})
    .finally(() => setLoading(false));
}, []);
```

Render each order's `id`, `status`, `totalPrice`, `createdAt`, and `items` list.

- [ ] **Step 5: Compile check**

```bash
cd apps/website && npx tsc --noEmit 2>&1 | grep "staff/"
```

Expected: no errors in staff pages.

- [ ] **Step 6: Commit**

```bash
git add apps/website/src/pages/staff/
git commit -m "feat(frontend): wire all staff/POS pages to real API"
```

---

## Final Verification

- [ ] **Start backend and frontend together**

```bash
# Terminal 1
cd apps/server && ./gradlew bootRun

# Terminal 2
cd apps/website && npm run dev
```

- [ ] **Run full TypeScript check**

```bash
cd apps/website && npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Manual smoke test — booking flow**

1. Register a new user at `/register`
2. Log in at `/`
3. Navigate to `/home` — verify movies load from backend
4. Select a movie → `/movies` → pick one → `/theater` — verify showtimes appear
5. Select a showtime → `/seats` — verify seat grid with booked/available states
6. Select seats → confirm → `/snacks` — verify food items load
7. Add snacks → continue → `/payment` — select CASH → pay
8. Verify `/confirmation` shows real booking details
9. Click "Back to Home" — verify context resets

- [ ] **Manual smoke test — admin CRUD**

1. Log in as ADMIN
2. `/admin/dashboard` — verify stat cards show real numbers
3. `/admin/movies` — create a movie, verify it appears; edit it; delete it
4. `/admin/foods` — same CRUD cycle
5. `/admin/showtimes` — create showtime, verify conflict detection works
6. `/admin/staff` — create/edit/delete a staff member

- [ ] **Manual smoke test — staff POS**

1. Log in as STAFF
2. `/staff/pos` — select movie → showtime → seats → confirm booking
3. `/staff/food` — add food items to cart → checkout
4. `/staff/history` — verify orders list populates
