# MVP Fix & Seed — Design Spec
**Date:** 2026-05-26  
**Status:** Approved  
**Scope:** Fix 3 critical blockers + comprehensive data seeder for full-stack demo

---

## Problem Summary

The application is fully wired (frontend ↔ backend API) but cannot run in its current state due to three critical bugs:

1. **Server crashes at startup** — `ImageUploadService` injects `${CLOUDINARY_URL}` with no default; if the env var is absent Spring fails to resolve the placeholder and the JVM exits before serving any requests.
2. **Every CASH payment returns 400** — `PaymentService.validate()` requires `status` for non-VNPAY methods, but the frontend `PaymentRequest` interface has no `status` field and never sends one.
3. **Empty database** — No seed data exists. Every page shows empty state or 401/404 errors.

Additionally, several working-tree and untracked changes (`CorsConfig.java`, `SecurityConfig`, `application.properties`, frontend type fixes) are not yet committed.

---

## Architecture

### Backend (Spring Boot 3.3, Java 21, PostgreSQL)

```
apps/server/src/main/java/com/movie/server/
├── config/CorsConfig.java          ← new file, needs commit
├── security/SecurityConfig.java    ← OPTIONS permit added, needs commit
├── service/
│   ├── ImageUploadService.java     ← FIX: lazy-init Cloudinary
│   └── PaymentService.java        ← FIX: auto-set SUCCESS for CASH
└── DataSeeder.java                 ← NEW: ApplicationRunner, idempotent
```

### Frontend (React + Vite + TypeScript)

```
apps/website/src/
├── types/payment.ts                ← FIX: "COMPLETED" → "SUCCESS"
├── types/showtime.ts               ← already fixed in working tree
└── pages/home/components/
    └── NowShowing.tsx              ← already fixed in working tree
```

---

## Fix 1: ImageUploadService — Defer Cloudinary to Upload Time

**File:** `apps/server/src/main/java/com/movie/server/service/ImageUploadService.java`

Change `@Value("${CLOUDINARY_URL}")` to `@Value("${CLOUDINARY_URL:}")` so Spring resolves it to an empty string when absent. Store `cloudinary = null` when URL is blank. Throw `BadRequestException("Image upload is not configured")` only when `uploadImage()` is actually called.

This allows the server to start without `CLOUDINARY_URL` configured. The seeder uses direct poster URLs (not uploads), so Cloudinary is not needed for the demo.

---

## Fix 2: PaymentService — Auto-SUCCESS for CASH

**File:** `apps/server/src/main/java/com/movie/server/service/PaymentService.java`

In `create()`, when `method == CASH` (or any non-VNPAY method), set:
```java
payment.setStatus(PaymentStatus.SUCCESS);
payment.setPaidAt(LocalDateTime.now());
```

Remove the validation requirement for `status` when method is non-VNPAY. The frontend CASH flow sends `{ bookingId, orderId, amount, method: "CASH" }` — this must succeed.

---

## Fix 3: Frontend PaymentStatus Type

**File:** `apps/website/src/types/payment.ts`

Change `"COMPLETED"` → `"SUCCESS"` to match the backend `PaymentStatus` enum (`PENDING`, `SUCCESS`, `FAILED`, `REFUNDED`).

---

## DataSeeder

**File:** `apps/server/src/main/java/com/movie/server/DataSeeder.java`

Implements `ApplicationRunner`. Checks `movieRepository.count() == 0` as the idempotency guard — if movies already exist, skip all seeding.

### Seed Data

**Seat Tiers (3)**
| Name | Multiplier | Description |
|---|---|---|
| Standard | 1.0 | Regular seating |
| Premium | 1.3 | Extra legroom |
| VIP | 1.5 | Recliner seats |

**Theater Rooms (2)**
| Name | Rows | Seats/Row | Total |
|---|---|---|---|
| Hall 1 | 6 (A–F) | 8 | 48 |
| Hall 2 | 5 (A–E) | 10 | 50 |

Tier distribution per room:
- Rows A–B → Standard
- Rows C–D → Premium
- Rows E–F (or E only for Hall 2) → VIP

**Users (4)**
| Email | Password | Role |
|---|---|---|
| admin@cinema.com | Admin@123 | ADMIN |
| staff1@cinema.com | Staff@123 | STAFF |
| staff2@cinema.com | Staff@123 | STAFF |
| customer@cinema.com | Customer@123 | CUSTOMER |

**Movies (5)** — use publicly accessible TMDB poster image URLs, release dates in the past, all with genre and rating.

**Showtimes** — for each movie, create 3 showtimes in the next 7 days (spread across Hall 1 and Hall 2, different times of day). Base price: 120,000 VND.

**Food Items (7)**
| Name | Category | Price |
|---|---|---|
| Large Popcorn | POPCORN | 80,000 |
| Nachos | POPCORN | 65,000 |
| Coke | DRINK | 45,000 |
| Sprite | DRINK | 45,000 |
| Combo 1 (Popcorn + Coke) | COMBO | 110,000 |
| Couple Set | COUPLE_SET | 180,000 |
| M&Ms | CANDY | 35,000 |

---

## Commit Strategy

1. Stage and commit `CorsConfig.java` (new file) + `SecurityConfig.java` (OPTIONS fix) + `application.properties` (email config) + frontend type fixes (`showtime.ts`, `NowShowing.tsx`, `payment.ts`)
2. Commit backend fixes (`ImageUploadService.java`, `PaymentService.java`)
3. Commit `DataSeeder.java`

---

## Out of Scope

- Frontend route guards (admin/staff pages have no auth gate — acceptable for demo)
- VNPay real payment (CASH flow works; QR flow will fail gracefully with config error)
- Cloudinary image upload (seeder uses direct URLs; admin movie creation with file upload will fail gracefully)
- Email OTP in dev (SMTP is configured with real credentials — should work)
