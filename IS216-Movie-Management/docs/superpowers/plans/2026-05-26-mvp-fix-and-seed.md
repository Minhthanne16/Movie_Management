# MVP Fix & Seed Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 4 critical blockers (startup crash, PaymentRequest no setters, CASH payment validation, empty DB) and commit all pending working-tree changes so the full-stack cinema booking MVP is demo-ready.

**Architecture:** Surgical patches to `ImageUploadService`, `PaymentRequest`, and `PaymentService`; a new idempotent `DataSeeder` ApplicationRunner that seeds the full entity graph (tiers → rooms → seats → users → movies → showtimes → food) on first boot; fix frontend `PaymentStatus` type mismatch; commit all pending changes.

**Tech Stack:** Spring Boot 3.3 / Java 21 / JPA / PostgreSQL (dev) / H2 (test); React + Vite + TypeScript; JUnit 5 + Mockito

---

## File Map

| Status | Path | Change |
|---|---|---|
| Modify | `apps/server/src/main/java/com/movie/server/service/ImageUploadService.java` | Default `@Value`, lazy Cloudinary init |
| Modify | `apps/server/src/main/java/com/movie/server/dto/request/PaymentRequest.java` | Add setters |
| Modify | `apps/server/src/main/java/com/movie/server/service/PaymentService.java` | Auto-SUCCESS for CASH |
| Create | `apps/server/src/main/java/com/movie/server/DataSeeder.java` | Full seed data |
| Modify | `apps/server/src/test/resources/application.properties` | Add `CLOUDINARY_URL`, change `ddl-auto` to `create-drop` |
| Create | `apps/server/src/test/java/com/movie/server/dto/request/PaymentRequestTest.java` | Jackson deserialization test |
| Create | `apps/server/src/test/java/com/movie/server/service/ImageUploadServiceTest.java` | Startup + upload guard test |
| Create | `apps/server/src/test/java/com/movie/server/service/PaymentServiceCashTest.java` | CASH auto-SUCCESS test |
| Modify | `apps/website/src/types/payment.ts` | `"COMPLETED"` → `"SUCCESS"` |
| Commit | `apps/server/src/main/java/com/movie/server/config/CorsConfig.java` | New untracked file |
| Commit | `apps/server/src/main/java/com/movie/server/security/SecurityConfig.java` | OPTIONS permit |
| Commit | `apps/server/src/main/resources/application.properties` | Email config |
| Commit | `apps/website/src/pages/home/components/NowShowing.tsx` | JSX fix |
| Commit | `apps/website/src/types/showtime.ts` | Type fix |

---

## Task 1: Commit Pending Working-Tree Changes + Fix PaymentStatus Type

**Files:**
- Modify: `apps/website/src/types/payment.ts`
- Commit: `apps/server/src/main/java/com/movie/server/config/CorsConfig.java`
- Commit: `apps/server/src/main/java/com/movie/server/security/SecurityConfig.java`
- Commit: `apps/server/src/main/resources/application.properties`
- Commit: `apps/website/src/pages/home/components/NowShowing.tsx`
- Commit: `apps/website/src/types/showtime.ts`

- [ ] **Step 1: Fix the PaymentStatus type mismatch in `payment.ts`**

  Open `apps/website/src/types/payment.ts`. The backend `PaymentStatus` enum is `PENDING, SUCCESS, FAILED, REFUNDED`. The frontend type wrongly has `"COMPLETED"`. Replace the entire file with:

  ```typescript
  export type PaymentMethod = "CASH" | "VNPAY";
  export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";

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

- [ ] **Step 2: Stage and commit all pending changes**

  ```bash
  git add apps/server/src/main/java/com/movie/server/config/CorsConfig.java \
          apps/server/src/main/java/com/movie/server/security/SecurityConfig.java \
          apps/server/src/main/resources/application.properties \
          apps/website/src/pages/home/components/NowShowing.tsx \
          apps/website/src/types/showtime.ts \
          apps/website/src/types/payment.ts
  git commit -m "fix: commit cors config, security OPTIONS, email settings, frontend type fixes"
  ```

  Expected: `6 files changed`

---

## Task 2: Fix PaymentRequest Missing Setters

**Files:**
- Modify: `apps/server/src/main/java/com/movie/server/dto/request/PaymentRequest.java`
- Create: `apps/server/src/test/java/com/movie/server/dto/request/PaymentRequestTest.java`

- [ ] **Step 1: Write the failing test**

  Create `apps/server/src/test/java/com/movie/server/dto/request/PaymentRequestTest.java`:

  ```java
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
  ```

- [ ] **Step 2: Run the test to confirm it fails**

  ```bash
  cd apps/server && ./gradlew test --tests "com.movie.server.dto.request.PaymentRequestTest" --info 2>&1 | tail -30
  ```

  Expected: `FAILED` — `assertEquals` on `bookingId` fails with `expected: <7> but was: <null>` because there are no setters for Jackson to write into.

- [ ] **Step 3: Add setters to PaymentRequest**

  Replace the full content of `apps/server/src/main/java/com/movie/server/dto/request/PaymentRequest.java`:

  ```java
  package com.movie.server.dto.request;

  import com.movie.server.enums.PaymentMethod;
  import com.movie.server.enums.PaymentStatus;
  import java.math.BigDecimal;
  import java.time.LocalDateTime;

  public class PaymentRequest {
      private Long bookingId;
      private Long orderId;
      private BigDecimal amount;
      private PaymentMethod method;
      private PaymentStatus status;
      private LocalDateTime paidAt;
      private String bankCode;
      private String language;

      public PaymentRequest() {}

      public Long getBookingId() { return bookingId; }
      public void setBookingId(Long bookingId) { this.bookingId = bookingId; }

      public Long getOrderId() { return orderId; }
      public void setOrderId(Long orderId) { this.orderId = orderId; }

      public BigDecimal getAmount() { return amount; }
      public void setAmount(BigDecimal amount) { this.amount = amount; }

      public PaymentMethod getMethod() { return method; }
      public void setMethod(PaymentMethod method) { this.method = method; }

      public PaymentStatus getStatus() { return status; }
      public void setStatus(PaymentStatus status) { this.status = status; }

      public LocalDateTime getPaidAt() { return paidAt; }
      public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }

      public String getBankCode() { return bankCode; }
      public void setBankCode(String bankCode) { this.bankCode = bankCode; }

      public String getLanguage() { return language; }
      public void setLanguage(String language) { this.language = language; }
  }
  ```

- [ ] **Step 4: Run the test again to confirm it passes**

  ```bash
  cd apps/server && ./gradlew test --tests "com.movie.server.dto.request.PaymentRequestTest" --info 2>&1 | tail -20
  ```

  Expected: `BUILD SUCCESSFUL`, `1 test completed`

- [ ] **Step 5: Commit**

  ```bash
  cd apps/server && git add src/main/java/com/movie/server/dto/request/PaymentRequest.java \
      src/test/java/com/movie/server/dto/request/PaymentRequestTest.java
  git commit -m "fix(backend): add missing setters to PaymentRequest for Jackson deserialization"
  ```

---

## Task 3: Fix ImageUploadService Startup Crash

**Files:**
- Modify: `apps/server/src/main/java/com/movie/server/service/ImageUploadService.java`
- Modify: `apps/server/src/test/resources/application.properties`
- Create: `apps/server/src/test/java/com/movie/server/service/ImageUploadServiceTest.java`

- [ ] **Step 1: Write the failing test**

  Create `apps/server/src/test/java/com/movie/server/service/ImageUploadServiceTest.java`:

  ```java
  package com.movie.server.service;

  import com.movie.server.exception.BadRequestException;
  import org.junit.jupiter.api.Test;
  import org.springframework.mock.web.MockMultipartFile;

  import static org.junit.jupiter.api.Assertions.*;

  class ImageUploadServiceTest {

      @Test
      void constructorDoesNotThrowWhenUrlIsBlank() {
          assertDoesNotThrow(() -> new ImageUploadService(""));
      }

      @Test
      void uploadImageThrowsBadRequestWhenNotConfigured() {
          ImageUploadService service = new ImageUploadService("");
          MockMultipartFile file = new MockMultipartFile(
                  "poster", "test.jpg", "image/jpeg", new byte[]{1, 2, 3});
          assertThrows(BadRequestException.class, () -> service.uploadImage(file));
      }
  }
  ```

- [ ] **Step 2: Run the test to confirm it fails**

  ```bash
  cd apps/server && ./gradlew test --tests "com.movie.server.service.ImageUploadServiceTest" --info 2>&1 | tail -30
  ```

  Expected: `FAILED` — `constructorDoesNotThrowWhenUrlIsBlank` fails because the constructor currently throws `IllegalStateException` when the URL is blank.

- [ ] **Step 3: Fix ImageUploadService**

  Replace the full content of `apps/server/src/main/java/com/movie/server/service/ImageUploadService.java`:

  ```java
  package com.movie.server.service;

  import com.cloudinary.Cloudinary;
  import com.cloudinary.utils.ObjectUtils;
  import com.movie.server.exception.BadRequestException;
  import java.io.IOException;
  import java.util.Map;
  import org.springframework.beans.factory.annotation.Value;
  import org.springframework.stereotype.Service;
  import org.springframework.web.multipart.MultipartFile;

  @Service
  public class ImageUploadService {

      private final Cloudinary cloudinary;

      public ImageUploadService(@Value("${CLOUDINARY_URL:}") String cloudinaryUrl) {
          this.cloudinary = (cloudinaryUrl != null && !cloudinaryUrl.isBlank())
                  ? new Cloudinary(cloudinaryUrl)
                  : null;
      }

      public String uploadImage(MultipartFile image) {
          if (cloudinary == null) {
              throw new BadRequestException("Image upload is not configured (CLOUDINARY_URL missing)");
          }
          validateImage(image);
          try {
              Map<?, ?> uploadResult = cloudinary.uploader().upload(image.getBytes(), ObjectUtils.emptyMap());
              Object secureUrl = uploadResult.get("secure_url");
              if (secureUrl == null) {
                  throw new IllegalStateException("Cloudinary did not return secure_url");
              }
              return secureUrl.toString();
          } catch (IOException ex) {
              throw new RuntimeException("Failed to upload image to Cloudinary", ex);
          }
      }

      private void validateImage(MultipartFile image) {
          if (image == null || image.isEmpty()) {
              throw new BadRequestException("image file is required");
          }
          String contentType = image.getContentType();
          if (contentType == null || !contentType.startsWith("image/")) {
              throw new BadRequestException("file must be an image");
          }
      }
  }
  ```

- [ ] **Step 4: Add CLOUDINARY_URL to the test application.properties so `@SpringBootTest` can load**

  Open `apps/server/src/test/resources/application.properties` and replace its full content with:

  ```properties
  spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;MODE=PostgreSQL
  spring.datasource.driver-class-name=org.h2.Driver
  spring.datasource.username=sa
  spring.datasource.password=
  spring.jpa.hibernate.ddl-auto=create-drop
  spring.jpa.show-sql=false
  app.jwt.secret=12345678901234567890123456789012
  app.jwt.expiration-ms=86400000
  spring.mail.host=localhost
  spring.mail.port=2525
  CLOUDINARY_URL=cloudinary://000:000@dummy
  ```

  Key changes: `ddl-auto` changed from `none` → `create-drop` (so H2 creates tables when DataSeeder runs later), and `CLOUDINARY_URL` added.

- [ ] **Step 5: Run the test again to confirm it passes**

  ```bash
  cd apps/server && ./gradlew test --tests "com.movie.server.service.ImageUploadServiceTest" --info 2>&1 | tail -20
  ```

  Expected: `BUILD SUCCESSFUL`, `2 tests completed`

- [ ] **Step 6: Commit**

  ```bash
  cd apps/server && git add src/main/java/com/movie/server/service/ImageUploadService.java \
      src/test/resources/application.properties \
      src/test/java/com/movie/server/service/ImageUploadServiceTest.java
  git commit -m "fix(backend): defer Cloudinary init to upload time, add CLOUDINARY_URL default"
  ```

---

## Task 4: Fix PaymentService — Auto-SUCCESS for CASH

**Files:**
- Modify: `apps/server/src/main/java/com/movie/server/service/PaymentService.java`
- Create: `apps/server/src/test/java/com/movie/server/service/PaymentServiceCashTest.java`

- [ ] **Step 1: Write the failing test**

  Create `apps/server/src/test/java/com/movie/server/service/PaymentServiceCashTest.java`:

  ```java
  package com.movie.server.service;

  import com.movie.server.dto.request.PaymentRequest;
  import com.movie.server.dto.response.PaymentResponse;
  import com.movie.server.entity.Booking;
  import com.movie.server.enums.PaymentMethod;
  import com.movie.server.enums.PaymentStatus;
  import com.movie.server.repository.BookingRepository;
  import com.movie.server.repository.OrderRepository;
  import com.movie.server.repository.PaymentRepository;
  import org.junit.jupiter.api.BeforeEach;
  import org.junit.jupiter.api.Test;
  import org.junit.jupiter.api.extension.ExtendWith;
  import org.mockito.ArgumentCaptor;
  import org.mockito.Mock;
  import org.mockito.junit.jupiter.MockitoExtension;

  import java.math.BigDecimal;
  import java.util.Optional;

  import static org.junit.jupiter.api.Assertions.*;
  import static org.mockito.ArgumentMatchers.any;
  import static org.mockito.Mockito.*;

  @ExtendWith(MockitoExtension.class)
  class PaymentServiceCashTest {

      @Mock private PaymentRepository paymentRepository;
      @Mock private BookingRepository bookingRepository;
      @Mock private OrderRepository orderRepository;

      private PaymentService paymentService;

      @BeforeEach
      void setUp() {
          paymentService = new PaymentService(
                  paymentRepository, bookingRepository, orderRepository,
                  "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
                  "", "", "");
      }

      @Test
      void cashPaymentSucceedsWithoutStatusInRequest() {
          // Arrange
          Booking booking = new Booking();
          booking.setId(1L);
          booking.setTotalPrice(new BigDecimal("240000"));
          when(bookingRepository.findByIdAndDeletedAtIsNull(1L))
                  .thenReturn(Optional.of(booking));

          com.movie.server.entity.Payment savedPayment = new com.movie.server.entity.Payment();
          savedPayment.setId(10L);
          savedPayment.setBooking(booking);
          savedPayment.setAmount(new BigDecimal("240000"));
          savedPayment.setMethod(PaymentMethod.CASH);
          savedPayment.setStatus(PaymentStatus.SUCCESS);
          when(paymentRepository.save(any())).thenReturn(savedPayment);

          PaymentRequest req = new PaymentRequest();
          req.setBookingId(1L);
          req.setOrderId(null);
          req.setAmount(new BigDecimal("240000"));
          req.setMethod(PaymentMethod.CASH);
          // No status set — this is what the frontend sends

          // Act
          PaymentResponse response = paymentService.create(req, "127.0.0.1");

          // Assert
          assertNotNull(response);
          ArgumentCaptor<com.movie.server.entity.Payment> captor =
                  ArgumentCaptor.forClass(com.movie.server.entity.Payment.class);
          verify(paymentRepository).save(captor.capture());
          assertEquals(PaymentStatus.SUCCESS, captor.getValue().getStatus());
          assertNotNull(captor.getValue().getPaidAt());
      }
  }
  ```

- [ ] **Step 2: Run the test to confirm it fails**

  ```bash
  cd apps/server && ./gradlew test --tests "com.movie.server.service.PaymentServiceCashTest" --info 2>&1 | tail -30
  ```

  Expected: `FAILED` — throws `BadRequestException: status is required` because the current code validates that status must be present for non-VNPAY.

- [ ] **Step 3: Fix PaymentService — remove status validation for non-VNPAY and auto-set SUCCESS**

  Open `apps/server/src/main/java/com/movie/server/service/PaymentService.java`.

  Find the `validate` method (lines 207-217) and replace it:

  ```java
  private void validate(PaymentRequest request) {
      if (request.getBookingId() == null && request.getOrderId() == null) {
          throw new BadRequestException("bookingId or orderId is required");
      }
      if (request.getMethod() == null) {
          throw new BadRequestException("method is required");
      }
  }
  ```

  Then find the `create` method's payment status block (around lines 87-93). Replace:

  ```java
  if (request.getMethod() == PaymentMethod.VNPAY) {
      payment.setStatus(PaymentStatus.PENDING);
      payment.setPaidAt(null);
  } else {
      payment.setStatus(request.getStatus());
      payment.setPaidAt(request.getPaidAt());
  }
  ```

  With:

  ```java
  if (request.getMethod() == PaymentMethod.VNPAY) {
      payment.setStatus(PaymentStatus.PENDING);
      payment.setPaidAt(null);
  } else {
      payment.setStatus(PaymentStatus.SUCCESS);
      payment.setPaidAt(LocalDateTime.now());
  }
  ```

- [ ] **Step 4: Run the test to confirm it passes**

  ```bash
  cd apps/server && ./gradlew test --tests "com.movie.server.service.PaymentServiceCashTest" --info 2>&1 | tail -20
  ```

  Expected: `BUILD SUCCESSFUL`, `1 test completed`

- [ ] **Step 5: Commit**

  ```bash
  cd apps/server && git add src/main/java/com/movie/server/service/PaymentService.java \
      src/test/java/com/movie/server/service/PaymentServiceCashTest.java
  git commit -m "fix(backend): auto-set SUCCESS status for non-VNPAY payments"
  ```

---

## Task 5: Create DataSeeder

**Files:**
- Create: `apps/server/src/main/java/com/movie/server/DataSeeder.java`

- [ ] **Step 1: Create the DataSeeder**

  Create `apps/server/src/main/java/com/movie/server/DataSeeder.java` with the full content below. The seeder is idempotent — it checks `movieRepository.count() > 0` and returns immediately if data already exists.

  ```java
  package com.movie.server;

  import com.movie.server.entity.*;
  import com.movie.server.enums.Role;
  import com.movie.server.repository.*;
  import org.springframework.boot.ApplicationArguments;
  import org.springframework.boot.ApplicationRunner;
  import org.springframework.security.crypto.password.PasswordEncoder;
  import org.springframework.stereotype.Component;

  import java.math.BigDecimal;
  import java.time.LocalDate;
  import java.time.LocalDateTime;
  import java.util.List;

  @Component
  public class DataSeeder implements ApplicationRunner {

      private final MovieRepository movieRepository;
      private final UserRepository userRepository;
      private final SeatTierRepository seatTierRepository;
      private final TheaterRoomRepository theaterRoomRepository;
      private final SeatRepository seatRepository;
      private final ShowtimeRepository showtimeRepository;
      private final FoodItemRepository foodItemRepository;
      private final PasswordEncoder passwordEncoder;

      public DataSeeder(
              MovieRepository movieRepository,
              UserRepository userRepository,
              SeatTierRepository seatTierRepository,
              TheaterRoomRepository theaterRoomRepository,
              SeatRepository seatRepository,
              ShowtimeRepository showtimeRepository,
              FoodItemRepository foodItemRepository,
              PasswordEncoder passwordEncoder) {
          this.movieRepository = movieRepository;
          this.userRepository = userRepository;
          this.seatTierRepository = seatTierRepository;
          this.theaterRoomRepository = theaterRoomRepository;
          this.seatRepository = seatRepository;
          this.showtimeRepository = showtimeRepository;
          this.foodItemRepository = foodItemRepository;
          this.passwordEncoder = passwordEncoder;
      }

      @Override
      public void run(ApplicationArguments args) {
          if (movieRepository.count() > 0) return;

          LocalDateTime now = LocalDateTime.now();

          // 1. Seat tiers
          SeatTier standard = createTier("Standard", new BigDecimal("1.00"), "Regular seating", now);
          SeatTier premium  = createTier("Premium",  new BigDecimal("1.30"), "Extra legroom",   now);
          SeatTier vip      = createTier("VIP",      new BigDecimal("1.50"), "Recliner seats",  now);

          // 2. Theater rooms
          TheaterRoom hall1 = createRoom("Hall 1", 6, 8,  now);
          TheaterRoom hall2 = createRoom("Hall 2", 5, 10, now);

          // 3. Seats — rows A-B standard, C-D premium, E-F (or E) vip
          seedSeats(hall1, new String[]{"A","B","C","D","E","F"}, 8,  standard, premium, vip, now);
          seedSeats(hall2, new String[]{"A","B","C","D","E"},     10, standard, premium, vip, now);

          // 4. Users
          createUser("Admin User",    "admin@cinema.com",    "Admin@123",    null,            Role.ADMIN,    now);
          createUser("Staff One",     "staff1@cinema.com",   "Staff@123",    "Morning Shift", Role.STAFF,    now);
          createUser("Staff Two",     "staff2@cinema.com",   "Staff@123",    "Evening Shift", Role.STAFF,    now);
          createUser("Test Customer", "customer@cinema.com", "Customer@123", null,            Role.CUSTOMER, now);

          // 5. Movies
          Movie m1 = createMovie(
              "Avengers: Endgame",
              "After the devastating events of Infinity War, the Avengers assemble once more to reverse Thanos's actions.",
              181, LocalDate.of(2019, 4, 26), "PG-13", "Action, Adventure, Drama",
              "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg", null, now);
          Movie m2 = createMovie(
              "The Dark Knight",
              "When the Joker wreaks havoc on Gotham, Batman must accept one of the greatest psychological tests of his ability to fight injustice.",
              152, LocalDate.of(2008, 7, 18), "PG-13", "Action, Crime, Drama",
              "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg", null, now);
          Movie m3 = createMovie(
              "Inception",
              "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into a CEO's mind.",
              148, LocalDate.of(2010, 7, 16), "PG-13", "Action, Sci-Fi, Thriller",
              "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg", null, now);
          Movie m4 = createMovie(
              "Interstellar",
              "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
              169, LocalDate.of(2014, 11, 7), "PG", "Adventure, Drama, Sci-Fi",
              "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", null, now);
          Movie m5 = createMovie(
              "Spider-Man: No Way Home",
              "With his identity revealed, Peter Parker asks Doctor Strange for help. When a spell goes wrong, dangerous foes from other worlds appear.",
              148, LocalDate.of(2021, 12, 17), "PG-13", "Action, Adventure, Fantasy",
              "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg", null, now);

          // 6. Showtimes — next 7 days, one showtime per movie per day, spread across halls
          BigDecimal basePrice = new BigDecimal("120000");
          List<Movie> movies = List.of(m1, m2, m3, m4, m5);
          int[] startHours = {10, 13, 16, 10, 13}; // one slot per movie per day
          for (int day = 1; day <= 7; day++) {
              for (int i = 0; i < movies.size(); i++) {
                  Movie movie = movies.get(i);
                  TheaterRoom room = (i % 2 == 0) ? hall1 : hall2;
                  LocalDateTime start = LocalDateTime.now()
                          .plusDays(day).withHour(startHours[i]).withMinute(0).withSecond(0).withNano(0);
                  LocalDateTime end = start.plusMinutes(movie.getDurationMinutes() + 30);
                  createShowtime(movie, room, start, end, basePrice, now);
              }
          }

          // 7. Food items
          createFood("Large Popcorn",              "Freshly popped buttered popcorn (large bucket)", new BigDecimal("80000"),  "POPCORN",    now);
          createFood("Nachos",                     "Crispy nachos with cheese sauce and jalapeños",  new BigDecimal("65000"),  "POPCORN",    now);
          createFood("Coca-Cola (Large)",          "Ice cold Coca-Cola — large cup",                 new BigDecimal("45000"),  "DRINK",      now);
          createFood("Sprite (Large)",             "Ice cold Sprite — large cup",                    new BigDecimal("45000"),  "DRINK",      now);
          createFood("Combo 1 — Popcorn + Coke",  "Large popcorn + large Coca-Cola",                new BigDecimal("110000"), "COMBO",      now);
          createFood("Couple Set",                 "2 medium popcorns + 2 drinks + 1 candy pack",    new BigDecimal("180000"), "COUPLE_SET", now);
          createFood("M&Ms",                       "Classic M&Ms chocolate candy pack",              new BigDecimal("35000"),  "CANDY",      now);
      }

      // ── helpers ──────────────────────────────────────────────────────────────

      private SeatTier createTier(String name, BigDecimal multiplier, String desc, LocalDateTime now) {
          SeatTier t = new SeatTier();
          t.setName(name); t.setPriceMultiplier(multiplier); t.setDescription(desc);
          t.setCreatedAt(now); t.setCreatedBy("seeder");
          t.setUpdatedAt(now); t.setUpdatedBy("seeder");
          return seatTierRepository.save(t);
      }

      private TheaterRoom createRoom(String name, int totalRows, int seatsPerRow, LocalDateTime now) {
          TheaterRoom r = new TheaterRoom();
          r.setName(name); r.setTotalRows(totalRows); r.setSeatsPerRow(seatsPerRow);
          r.setCreatedAt(now); r.setCreatedBy("seeder");
          r.setUpdatedAt(now); r.setUpdatedBy("seeder");
          return theaterRoomRepository.save(r);
      }

      private void seedSeats(TheaterRoom room, String[] rowLabels, int seatsPerRow,
                             SeatTier standard, SeatTier premium, SeatTier vip, LocalDateTime now) {
          for (int i = 0; i < rowLabels.length; i++) {
              SeatTier tier = (i < 2) ? standard : (i < 4) ? premium : vip;
              for (int num = 1; num <= seatsPerRow; num++) {
                  Seat seat = new Seat();
                  seat.setRoom(room); seat.setRowLabel(rowLabels[i]); seat.setSeatNumber(num); seat.setTier(tier);
                  seat.setCreatedAt(now); seat.setCreatedBy("seeder");
                  seat.setUpdatedAt(now); seat.setUpdatedBy("seeder");
                  seatRepository.save(seat);
              }
          }
      }

      private void createUser(String name, String email, String rawPw, String shift, Role role, LocalDateTime now) {
          if (userRepository.existsByEmail(email)) return;
          User u = new User();
          u.setName(name); u.setEmail(email); u.setPassword(passwordEncoder.encode(rawPw));
          u.setRole(role); u.setShift(shift);
          u.setCreatedAt(now); u.setCreatedBy("seeder");
          u.setUpdatedAt(now); u.setUpdatedBy("seeder");
          userRepository.save(u);
      }

      private Movie createMovie(String title, String desc, int duration, LocalDate release,
                                String rating, String genre, String posterUrl, String trailerUrl, LocalDateTime now) {
          Movie m = new Movie();
          m.setTitle(title); m.setDescription(desc); m.setDurationMinutes(duration);
          m.setReleaseDate(release); m.setRating(rating); m.setGenre(genre);
          m.setPosterUrl(posterUrl); m.setTrailerUrl(trailerUrl);
          m.setCreatedAt(now); m.setCreatedBy("seeder");
          m.setUpdatedAt(now); m.setUpdatedBy("seeder");
          return movieRepository.save(m);
      }

      private void createShowtime(Movie movie, TheaterRoom room, LocalDateTime start,
                                  LocalDateTime end, BigDecimal basePrice, LocalDateTime now) {
          Showtime s = new Showtime();
          s.setMovie(movie); s.setRoom(room); s.setStartTime(start); s.setEndTime(end); s.setBasePrice(basePrice);
          s.setCreatedAt(now); s.setCreatedBy("seeder");
          s.setUpdatedAt(now); s.setUpdatedBy("seeder");
          showtimeRepository.save(s);
      }

      private void createFood(String name, String desc, BigDecimal price, String category, LocalDateTime now) {
          FoodItem f = new FoodItem();
          f.setName(name); f.setDescription(desc); f.setPrice(price); f.setCategory(category);
          f.setIsAvailable(true);
          f.setCreatedAt(now); f.setCreatedBy("seeder");
          f.setUpdatedAt(now); f.setUpdatedBy("seeder");
          foodItemRepository.save(f);
      }
  }
  ```

- [ ] **Step 2: Run the full test suite to verify contextLoads passes with the seeder**

  ```bash
  cd apps/server && ./gradlew test --info 2>&1 | tail -30
  ```

  Expected: `BUILD SUCCESSFUL`, all tests pass including `contextLoads`. The DataSeeder will run inside the `@SpringBootTest` context against H2 — that's expected and harmless.

- [ ] **Step 3: Commit**

  ```bash
  cd apps/server && git add src/main/java/com/movie/server/DataSeeder.java
  git commit -m "feat(backend): add idempotent DataSeeder with movies, rooms, seats, users, showtimes, food"
  ```

---

## Task 6: End-to-End Smoke Test

- [ ] **Step 1: Start the database**

  ```bash
  docker compose up -d
  ```

  Expected: container `movie_db` starts healthy. Wait ~5 seconds for Postgres to be ready.

- [ ] **Step 2: Start the backend**

  ```bash
  cd apps/server && ./gradlew bootRun 2>&1 | tee /tmp/server.log &
  ```

  Wait ~15 seconds, then check:

  ```bash
  grep -E "(Started|ERROR|seeder)" /tmp/server.log | head -20
  ```

  Expected: `Started ServerApplication` — no `ERROR` lines. The seeder runs silently (no log output — that's fine; its queries appear in the SQL output if `show-sql=true`).

- [ ] **Step 3: Verify seed data via API**

  ```bash
  # Register a quick test account
  curl -s -X POST http://localhost:8080/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"name":"Test","email":"test@test.com","password":"Test@123"}' | python3 -m json.tool

  # Login
  TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@cinema.com","password":"Admin@123"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['token'])")

  echo "Token: $TOKEN"

  # Fetch movies
  curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/movies | python3 -m json.tool | grep '"title"'

  # Fetch food items
  curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/food-items | python3 -m json.tool | grep '"name"'
  ```

  Expected: 5 movie titles printed, 7 food item names printed.

- [ ] **Step 4: Start the frontend**

  ```bash
  cd apps/website && npm run dev 2>&1 &
  ```

  Wait ~5 seconds, then open `http://localhost:5173` (or the port printed).

- [ ] **Step 5: Verify the full booking flow manually**

  1. Login as `customer@cinema.com` / `Customer@123`
  2. Home page → movies should appear in "Now Showing"
  3. Click a movie → Theater page → showtimes listed
  4. Select a showtime → Seats page → seat map rendered
  5. Select 1-2 seats → Confirm → Snacks page → food items listed
  6. Add snacks → Continue → Payment page
  7. Select "Card" payment → fill dummy card → Pay → Confirmation page shows booking ID

- [ ] **Step 6: Verify admin login**

  Login as `admin@cinema.com` / `Admin@123`. Navigate to `/admin/dashboard`. Dashboard should show stats.

- [ ] **Step 7: Verify staff login**

  Login as `staff1@cinema.com` / `Staff@123`. Navigate to `/staff/pos`. POS page should load with showtime selector.
