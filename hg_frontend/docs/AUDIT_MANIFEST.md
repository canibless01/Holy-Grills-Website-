# HOLY GRILL FRONTEND RECONCILIATION, POLISH, AND ACTIVATION AUDIT MANIFEST

## 1. BACKEND MANIFEST

The Holy Grill Flask backend exposes the following blueprints and endpoints under `/api/v1` (with `/health` at root `/` level):

### Auth Blueprint (`/api/v1/auth`)
- `POST /register`: Registers user. Payload: `{ email, password, full_name, phone_number, campus_id, nickname, department_id, academic_level_id }`. Returns `{ user, token, refresh_token }`.
- `POST /login`: Logs in user. Payload: `{ email, password }` or `{ phone_number, password }`. Returns `{ user, token, refresh_token }`.
- `POST /refresh`: Refresh access token. Header: `Bearer <refresh_token>`. Returns `{ token }`.
- `POST /logout`: Revokes token. Header `Bearer <token>`. Returns `{ message }`.
- `GET /me`: Fetches current authenticated profile & streak info.
- `PATCH /me`: Updates profile (full_name, nickname, phone_number, campus_id, department_id, academic_level_id, avatar_url).
- `POST /verify-email/request` & `POST /verify-email/confirm`: Email verification flow.
- `POST /reset-password/request` & `POST /reset-password/confirm`: Password reset flow.
- `GET /streak`: Returns user's streak information.
- `POST /streak/reclaim`: Reclaims a lost streak using HP or streak freeze.
- `GET /addresses` & `POST /addresses` & `PATCH /addresses/<id>` & `DELETE /addresses/<id>`: User address management.
- `POST /device-token`: Registers FCM push notification device token.

### Storefront & Menu (`/api/v1/storefront`, `/api/v1/menu`, `/api/v1/departments`, `/api/v1/academic-levels`)
- `GET /storefront/config/public`: Public configuration parameters.
- `GET /storefront/operating-hours` & `PATCH /storefront/operating-hours`: Campus operating hours and controls.
- `GET /storefront/banners`, `POST /storefront/banners`: Hero banners.
- `GET /menu`, `GET /menu/<id>`: Menu items with categories, options, variations, add-ons.
- `GET /departments`, `GET /academic-levels`: Academic taxonomy lists.

### Orders & Cart (`/api/v1/cart`, `/api/v1/saved-for-later`, `/api/v1/orders`, `/api/v1/delivery`)
- `GET /cart`, `POST /cart`, `PATCH /cart/<item_id>`, `DELETE /cart/<item_id>`: Cart management.
- `POST /orders`: Order creation (payment_method: `wallet`, `card`, `cash`, `bank_transfer`).
- `GET /orders`, `GET /orders/<id>`, `POST /orders/<id>/cancel`, `POST /orders/<id>/reorder`: Order tracking and history.
- `POST /orders/<id>/review`, `POST /orders/<id>/claim`: Order reviews and guest claiming.
- `GET /delivery/windows`, `GET /delivery/zones`: Delivery schedules and fees.

### Wallet & HP (`/api/v1/wallet`, `/api/v1/hp`)
- `GET /wallet`: Wallet balance and virtual account info.
- `POST /wallet/fund/card`, `POST /wallet/fund/bank`: Top-up methods.
- `GET /wallet/transactions`: History of transactions.
- `GET /hp`: HP balance, tier, multipliers, thresholds.
- `GET /hp/transactions`: HP history.
- `POST /hp/transfer`: Transfer HP to another student.
- `POST /hp/flash-redeem`: Flash HP redemption.

### Rewards, Tiers, & Spins (`/api/v1/rewards`, `/api/v1/exclusive-spin`, `/api/v1/free-sides`)
- `GET /rewards`, `POST /rewards/<id>/redeem`, `GET /rewards/redemptions`: Rewards catalog and history.
- `GET /exclusive-spin/status`, `POST /exclusive-spin/spin`: Exclusive spin pool.
- `GET /free-sides/available`, `POST /free-sides/claim`: Tier free side privileges.

### Referrals, Squads, Events, Marketplace, Order Locks (`/api/v1/...`)
- `GET /referrals`, `GET /referrals/stats`: Referral codes, milestones, list.
- `POST /squads`, `GET /squads`, `GET /squads/<id>`: Squad creation and order association.
- `GET /events`, `GET /events/<id>`, `POST /events/<id>/tickets/purchase`: Campus events & tickets.
- `GET /marketplace`, `POST /marketplace`, `POST /marketplace/<id>/purchase`: Marketplace listings & code delivery.
- `GET /order-locks`, `POST /order-locks`: Pre-ordering and scheduled order locks.

### Kitchen, Rider, Admin (`/api/v1/kitchen`, `/api/v1/riders`, `/api/v1/admin`)
- `GET /kitchen/queue`, `PATCH /kitchen/orders/<id>/status`, `POST /kitchen/batches/advance`: Kitchen workflow.
- `GET /riders/my-batch`, `POST /riders/orders/<id>/deliver`, `POST /riders/orders/<id>/attempt`: Rider workflow.
- `GET /admin/users`, `GET /admin/orders`, `PATCH /admin/users/<id>/role`, `GET /admin/analytics`: Comprehensive admin suite.

---

## 2. FRONTEND AUDIT

- Pages in `hg_frontend/app/` and `hg_frontend/src/app/routes/`:
  - Student: Home (`/`), Menu (`/menu`, `/menu/[id]`), Cart (`/cart`), Checkout (`/checkout`), Wallet (`/wallet`), HP (`/hp`), Rewards (`/rewards`), Streaks (`/streak`), Referrals (`/referrals`), Squads/Leaderboard (`/leaderboard`), Marketplace (`/marketplace`), Events (`/events`), Order Locks (`/order-locks`), Profile (`/profile`), Addresses (`/addresses`), Notifications (`/notifications`).
  - Kitchen: `/kitchen` (Queue, Batches, Prep Windows, Metrics, Settings).
  - Rider: `/rider` (My Batch, Delivery Status, Earnings, Call Customer).
  - Admin: `/admin/*` (Users, Orders, HP Economics, Rewards, Spin Pool, Delivery Windows, Feature Flags).

---

## 3. GAP LIST

1. `/checkin` & `/checkin/history` endpoints are deprecated in backend (replaced by `/streak`). Frontend references in `challenges.service.ts` or `daily_checkin` must be cleaned up.
2. Incomplete mapping for squad invites and order share HP bonuses.
3. Missing visual Recharts diagrams on Kitchen Prep throughput and Rider daily earnings.
4. Sound feedback triggers missing on Tier-Up celebration and HP Flash Redeem.

---

## 4. WIRING MAP

- `Auth`: `src/lib/api/auth.ts` -> `/api/v1/auth/*`
- `Menu & Cart`: `src/lib/api/menu.ts`, `src/services/api/cart.service.ts` -> `/api/v1/menu`, `/api/v1/cart`
- `Wallet & HP`: `src/lib/api/payments.ts`, `src/services/api/hp.service.ts` -> `/api/v1/wallet/*`, `/api/v1/hp/*`
- `Kitchen`: `src/services/api/kitchen.service.ts` -> `/api/v1/kitchen/*`
- `Rider`: `src/services/api/rider.service.ts` -> `/api/v1/riders/*`
- `Admin`: `src/services/api/admin.service.ts` -> `/api/v1/admin/*`

---

## 5. VALUE FLOW MAP

- HP Tier Thresholds, Multipliers, Wallet Bonuses, Delivery Windows, Operating Hours, and Campus List flow from `/storefront/config/public`, `/hp`, and `/storefront/operating-hours`.

---

## 6. STRING MAP

- Every backend error message returned in `{ "error": "..." }` or `{ "message": "..." }` is displayed verbatim in Sonner toasts without client-side paraphrase.

---

## 7. CONNECTIVITY MAP

- Header -> Menu, Cart, Wallet, HP, Profile, Notifications.
- Bottom Bar (Mobile) -> Home, Menu, Orders, HP, Account.
- Profile -> Streaks, Rewards, Referrals, Order Locks, Squads, Addresses.
- Kitchen / Rider / Admin accessible via role-based navigation and protected by `AdminGuard`.

---

## 8. ROLE & AUTH MAP

- `student`: Standard access.
- `kitchen`: Allowed `/kitchen`, redirected from `/admin` or `/rider`.
- `rider`: Allowed `/rider`, redirected from `/admin` or `/kitchen`.
- `admin` / `super_admin`: Access to `/admin/*`, `/kitchen`, `/rider`.

---

## 9. CAMPUS MAP

- Saved in `localStorage` under `selected_campus_id` and synced via `CampusContext`.
- Included in header `X-Campus-Id` for API requests.

---

## 10. DESIGN INCONSISTENCY LOG

- Compact Timer: `KitchenCountdownCard` converted to a sleek compact badge.
- Autoscrolling Featured Items: `HeroCarousel` updated with autoscrolling support.
- Testimonials: Ensured full mobile responsiveness without horizontal scroll overflow.

---

## 11. MOTION & INTERACTION LOG

- Added Framer Motion fade/slide animations to modals, drawers, toasts, and celebration overlays.

---

## 12. DATA VISUALIZATION PLAN

- Recharts integrated across HP trends, Streak activity, Squad contribution, Kitchen queue throughput, Rider earnings, and Admin economics.

---

## 13. SOUND PLAN

- Audio triggers in `src/utils/sound.ts` for:
  1. `order_confirmed`
  2. `reward_claimed`
  3. `hp_earned`
  4. `streak_milestone`
  5. `tier_up`
- Respects `user_sound_muted` setting in `localStorage`.

---

## 14. PWA VERIFICATION

- Service Worker registration, manifest icons, offline fallback shell, and FCM push notification token registration verified.

---

## 15. BLOCKED LIST

- No blocked features. The backend covers 100% of required functionality.
