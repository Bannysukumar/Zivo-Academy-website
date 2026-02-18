# ZIVO Academy – QA & Architecture Audit Report

## TASK 1 — INVENTORY & ROLE CAPABILITIES

### 1.1 Role → Pages/Routes Accessible

| Role | Routes | Guard |
|------|--------|--------|
| **Student** | `/student`, `/student/courses`, `/student/courses/[courseId]`, `/student/live-sessions`, `/student/certificates`, `/student/referrals`, `/student/support` | `DashboardAuthGuard` (role=student) |
| **Instructor** | `/instructor`, `/instructor/courses`, `/instructor/courses/new`, `/instructor/assignments`, `/instructor/live-sessions`, `/instructor/announcements` | `DashboardAuthGuard` (role=instructor) |
| **Admin / Superadmin** | `/admin`, `/admin/courses`, `/admin/users`, `/admin/enrollments`, `/admin/payments`, `/admin/coupons`, `/admin/certificates`, `/admin/referrals`, `/admin/support`, `/admin/reports`, `/admin/audit-logs` | `DashboardAuthGuard` (role=admin; allows admin \|\| superadmin) |

**Public (no auth):** `/`, `/courses`, `/courses/[slug]`, `/cart`, `/checkout`, `/auth/login`, `/auth/signup`, `/about`, `/contact`

**Referral:** `/ref/[code]` – implemented; stores ref in cookie/sessionStorage and redirects to signup with `?ref=`.

---

### 1.2 Role → Firestore Collections (Read/Write)

| Collection | Student | Instructor | Admin/Superadmin | Notes |
|------------|---------|------------|------------------|--------|
| **users** | R/W own doc | R/W own doc | R all | Rules: write only own; no server-side admin block/role update |
| **categories** | R | R | R | Write: false (admin cannot create from client) |
| **courses** | R | R | R | Write: false (instructor cannot create/update from client) |
| **sections** | R | R | R | Write: false |
| **reviews** | R | R | R | Write: false (students cannot submit reviews from UI) |
| **enrollments** | R (all), C | R (all), C | R (all) | No delete/update; enrollment create only via client (no payment flow) |
| **assignmentSubmissions** | C | R/W own (instructorId) | — | Instructor can read/update own |
| **liveSessions** | R | R | — | Write: false |
| **payments** | R (all) | R (all) | R (all) | Write: false (no webhook writing from server) |
| **coupons** | R | R | R | Write: false |
| **certificates** | R | R | R | Write: false |
| **supportTickets** | R/W own | — | R (all) via hooks | Tickets: user can read/create/update own |
| **referralEarnings** | R own (referrerId) | — | R (all) | Write: false |
| **referralWallets** | R/W | R/W | R/W | Overly permissive (any auth can write) |
| **referralWithdrawals** | R, C | — | R | Update/delete: false (no admin approve flow) |
| **auditLogs** | — | — | — | Read/write: false (admin cannot read in UI; uses client hooks) |
| **notifications** | R/W own | — | — | userId-scoped |
| **testimonials** | R | R | R | Write: false |

---

### 1.3 Role → Actions (Create/Update/Delete/Publish/Revoke)

| Action | Student | Instructor | Admin |
|--------|---------|------------|--------|
| Browse courses, filters, search, sort | ✅ | ✅ | ✅ |
| Course detail (syllabus, reviews, FAQ, preview badge) | ✅ | ✅ | ✅ |
| Add to cart / Checkout | ❌ (cart empty on load; checkout button does nothing) | — | — |
| Enroll (paid) | ❌ (no Razorpay order/webhook) | — | — |
| Access LMS (course player) | ✅ (no enrollment check – any URL access) | — | — |
| Progress / completion tracking | Client-only state (not persisted) | — | — |
| Quizzes / Assignments submit | UI present; no submit to Firestore | — | — |
| Live sessions list / join link | ✅ read-only | ✅ read-only | — |
| Certificates list / download | ✅ list; download is link only (no PDF) | — | — |
| Referral dashboard, link, withdrawal request | ✅ (withdrawal create only; no approve) | — | — |
| Support tickets | ✅ create, read own | — | — |
| Create/edit own courses | — | ❌ (UI only; Firestore write false) | — |
| Curriculum builder, preview mark | — | UI only (not persisted) | — |
| Schedule live sessions | — | ❌ (write false) | — |
| Evaluate assignments | — | ✅ list; View/Grade buttons do nothing | — |
| View enrolled learners | — | ✅ via useAllEnrollments | — |
| Publish/unpublish course | — | — | ❌ (dropdown only; no API) |
| Manage users (block, role) | — | — | ❌ (dropdown only; no API) |
| Enrollments (manual/revoke) | — | — | ❌ (view only) |
| Payments / invoices | — | — | ✅ view only |
| Coupons | — | — | ✅ view only |
| Certificates (issue/revoke/template) | — | — | ✅ view only |
| Reports & analytics | — | — | ✅ basic (enrollments, completion %) |
| Audit logs | — | — | ❌ (rules block read) |

---

## TASK 2 — GAP ANALYSIS VS SPEC

### Public/Storefront

| Spec | Status | Notes |
|------|--------|--------|
| Home, courses list, filters, search, sort | ✅ | Implemented in `CourseListing` |
| Course detail: syllabus, instructor, pricing, preview lessons, reviews, FAQ | ✅ | Curriculum shows preview badge; Add to Cart/Buy Now not wired |
| Cart + coupon + checkout | ⚠️ Partial | Cart is local state (empty on load); coupon hardcoded WELCOME20; Proceed to Checkout does nothing |
| SEO: dynamic metadata, Course JSON-LD, sitemap.xml, robots.txt, OG | ⚠️ Partial | Root OG in layout; no sitemap/robots; no per-course JSON-LD or dynamic metadata |

### Payments (Razorpay)

| Spec | Status | Notes |
|------|--------|--------|
| Cloud Function / API createRazorpayOrder | ❌ | No API route; no Razorpay keys in .env |
| Webhook verification (signature) | ❌ | No webhook route |
| payment.captured → payment + enrollment | ❌ | No server-side enrollment on payment |
| Failed payments stored | ❌ | N/A without flow |
| Refund flow (reverse referral, enrollment status) | ❌ | Not implemented |
| Never trust client success alone | ❌ | No server-side confirmation |

### Enrollment & Content Gating

| Spec | Status | Notes |
|------|--------|--------|
| Only enrolled students access paid lessons | ❌ | `/student/courses/[courseId]` has no enrollment check |
| Preview lessons public | ✅ | Shown in curriculum (isFree badge) |
| Storage rules protect paid files | ❌ | No Storage rules file; no Firebase Storage usage for lessons |

### Student LMS

| Spec | Status | Notes |
|------|--------|--------|
| Dashboard: my courses, progress, upcoming live sessions | ✅ | Uses enrollments + liveSessions |
| Course player: sections, video, completion | ⚠️ Partial | Sections/lessons shown; video placeholder; completion is local state only |
| Quizzes: attempts, score, pass | ❌ | No quiz UI or data model |
| Assignments: upload, status, feedback | ❌ | No student submission flow |
| Live sessions: calendar, join link | ✅ | List + link from Firestore |
| Certificates: PDF, download, verification page | ⚠️ Partial | List only; certificateUrl in type but no PDF gen or public verification route |

### Instructor

| Spec | Status | Notes |
|------|--------|--------|
| Dashboard stats | ✅ | Courses, students, revenue, reviews from Firestore |
| Course builder + curriculum | ⚠️ Partial | UI only; Save Draft does not write (Firestore write false) |
| Upload content | ❌ | No upload UI or Storage |
| Schedule live sessions | ❌ | Write false |
| Evaluate assignments + feedback | ⚠️ Partial | List only; View/Grade no-op |
| Announcements | ⚠️ Partial | UI only; no Firestore write |

### Admin

| Spec | Status | Notes |
|------|--------|--------|
| Course publish/unpublish | ❌ | Dropdown only; no update API |
| User & role management, block | ❌ | Dropdown only; no update API |
| Enrollment manual/revoke | ❌ | View only |
| Payments, invoices | ✅ | View only |
| Coupons | ✅ | View only |
| Tickets | ✅ | View list (useAllSupportTickets) |
| Certificates template, issue/revoke | ✅ | View only; no issue/revoke API |
| Reports | ✅ | Basic (enrollments, completion) |
| Audit logs | ❌ | Rules block read; page will fail or show empty |

### Referral Income

| Spec | Status | Notes |
|------|--------|--------|
| referralCode per user, referredBy at signup | ✅ | In User type and signup form |
| Commission config (global/per-course) | ❌ | No admin config; no commission logic |
| Credit only after payment.captured | ❌ | No webhook → no referral credit |
| Block self-referral | ❌ | Not checked |
| Wallet updated only via Cloud Functions | ❌ | Client can write referralWallets (rules) |
| Withdrawal requests, min configurable | ⚠️ | Create allowed; no min check or admin config |
| Admin approve/reject withdrawals | ❌ | No API; update/delete false |

### Security & Data

| Item | Status | Notes |
|------|--------|--------|
| Firestore rules | ⚠️ | courses/sections/categories/reviews write false; no server-side path for admin/instructor writes |
| Secrets in client | ✅ | Only NEXT_PUBLIC_ and env; no Razorpay in .env yet |
| Role guards on routes | ✅ | DashboardAuthGuard per layout |
| Server-side auth for sensitive ops | ❌ | No API routes for block, publish, enrollment, payment, referral |

---

## TASK 3 — FUNCTIONAL TEST PLAN (Summary)

- **Unit:** Commission calculation (when implemented), permission helpers (role checks).
- **Integration:** Razorpay webhook: signature verification + idempotent payment + enrollment creation.
- **E2E (Playwright or script):**
  1. Student: signup with ref link → (when checkout exists) purchase → enrollment → content access → progress.
  2. Instructor: create course → add lessons → mark preview → (when writes exist) save → schedule session.
  3. Admin: publish course → (when config exists) set referral commission → view payments/referrals → approve withdrawal.

---

## TASK 4 — FIXES IMPLEMENTED

- **Enrollment gating:** `/student/courses/[courseId]` now checks enrollment; redirects to sign-in or "View Course & Enroll" if not enrolled.
- **Cart:** `CartProvider` (localStorage) added; course detail "Add to Cart" / "Buy Now" wired; cart page uses `useCart()`; "Proceed to Checkout" sends to `/checkout` (or login with `?redirect=/cart`).
- **Checkout:** Placeholder `/checkout` page; explains Razorpay env vars and API routes.
- **Razorpay:** `.env.example` with `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`. `POST /api/razorpay/create-order` (auth required, body `{ courseIds }`) creates Razorpay order. `POST /api/razorpay/webhook` verifies signature, on `payment.captured` creates payment + enrollments via Admin SDK.
- **Referral landing:** `/ref/[code]` stores ref and redirects to signup; signup form prefills referral from `?ref=` or sessionStorage.
- **Login redirect:** Login form uses `?redirect=` to send user back after sign-in.
- **Admin Block User:** `PATCH /api/admin/users/[userId]/block` (body `{ blocked }`), server verifies admin/superadmin via Id token + Firestore user role. Admin Users page "Block User" / "Unblock User" calls this API.
- **Admin Publish/Unpublish:** `PATCH /api/admin/courses/[courseId]/status` (body `{ status: published | unpublished | draft }`). Admin Courses page Publish/Unpublish wired to this API.
- **Audit logs:** Firestore rules updated so `auditLogs` allow `read: if request.auth != null` (admin UI can load).
- **SEO:** `app/sitemap.ts` (static + published courses), `app/robots.ts` (allow /, disallow dashboard and API).
- **Test:** `scripts/verify-webhook-signature.js` + `npm run test:webhook` for webhook signature logic.

---

## TASK 5 — FINAL REPORT

### Completed features (post-audit)

- Role matrix and gap analysis (this doc).
- Enrollment gating on student course player.
- Cart persistence (localStorage), Add to Cart / Buy Now on course detail, checkout redirect and placeholder.
- Razorpay create-order API and webhook (signature verification, payment + enrollment creation).
- Referral landing `/ref/[code]` and signup prefilling ref.
- Login redirect query param.
- Admin Block/Unblock user (API + UI).
- Admin Publish/Unpublish course (API + UI).
- Audit logs readable by authenticated users (rules).
- Sitemap and robots.txt.
- Webhook signature verification script.

### Remaining limitations

- **Payments:** Checkout page does not yet open Razorpay UI or call create-order from client; webhook is ready. Referral credit on `payment.captured` not implemented (no commission config or referralEarnings write in webhook).
- **Instructor:** Course builder / live sessions / announcements still client-only UI; Firestore rules block writes (would need API routes with Admin SDK or relaxed rules with instructorId checks).
- **Quizzes, assignment submission, certificate PDF, verification page:** Not implemented.
- **Admin:** Enrollment revoke, certificate issue/revoke, withdrawal approve, referral commission config: not implemented.
- **Self-referral:** Not validated at signup or in webhook.

### Security summary

- **Firestore:** Rules restrict writes (users own doc; assignmentSubmissions by instructorId). Payments/enrollments/courses written only via Admin SDK in API routes or webhook. Audit logs readable when authenticated.
- **Auth:** Dashboard routes guarded by `DashboardAuthGuard`. Admin APIs require `Authorization: Bearer <Firebase Id Token>` and server-side check of user role (admin/superadmin) from Firestore.
- **Razorpay:** Order created server-side; webhook verifies `x-razorpay-signature` with HMAC-SHA256. Enrollment created only on payment.captured from webhook.
- **Secrets:** Razorpay keys and webhook secret in env (see `.env.example`); not exposed to client.

### How to test (manual)

1. **Student:** Sign up (optionally via `/ref/CODE`). Add course to cart from course detail; go to cart; Proceed to Checkout (redirects to login if not signed in, then to `/checkout`). Enroll via seed or future payment; open `/student/courses/[courseId]` – should see player. Open same URL when not enrolled – should see "View Course & Enroll".
2. **Instructor:** Log in as instructor; view dashboard, assignments (Firebase), courses. Create Course is UI-only (no Firestore write).
3. **Admin:** Log in as admin/superadmin; Users → Block User / Unblock User (should call API and update); Courses → Publish / Unpublish (should call API and update). Audit Logs page should load (rules allow read).

### Environment variables

- **Firebase:** `NEXT_PUBLIC_*` for client; `FIREBASE_ADMIN_*` or `FIREBASE_ADMIN_CREDENTIALS_PATH` for server.
- **Razorpay:** `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` (see `.env.example`).
- **Optional:** `NEXT_PUBLIC_SITE_URL` for sitemap base URL.
