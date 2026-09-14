# Holy Grills Backend API Inventory

## Backend base URL
`NEXT_PUBLIC_BACKEND_URL` (fallback: `NEXT_PUBLIC_API_BASE_URL`)

## Access note
The task environment could not reach `https://holy-grills-backend.onrender.com/api/docs/apispec.json` (DNS/network blocked), so the inventory below is based on the endpoints already referenced in the codebase and now wired in the service layer.

## Authentication

### POST /auth/login
- Purpose: Authenticate user.
- Authentication: Public.
- Frontend: `src/lib/api/auth.ts` → login flow.
- Status: Implemented.

### POST /auth/signup
- Purpose: Register user.
- Authentication: Public.
- Frontend: `src/lib/api/auth.ts` → signup flow.
- Status: Implemented.

### POST /auth/logout
- Purpose: End session.
- Authentication: Bearer.
- Frontend: `src/lib/api/auth.ts`.
- Status: Implemented.

### POST /auth/refresh
- Purpose: Refresh access token.
- Authentication: Refresh token payload.
- Frontend: `src/lib/api/client.ts` interceptor.
- Status: Implemented.

### GET /auth/me
- Purpose: Current user/profile/wallet payload.
- Authentication: Bearer.
- Frontend: `src/lib/api/auth.ts` + `providers/AuthProvider.tsx`.
- Status: Implemented.

### GET /auth/streak
- Purpose: Fetch activity streak.
- Authentication: Bearer.
- Frontend: `src/hooks/useAuthStreak.ts`.
- Status: Implemented.

### GET/PATCH /auth/profile
- Purpose: Read/update auth profile.
- Authentication: Bearer.
- Frontend: `src/lib/api/auth.ts`, `src/hooks/useAuthProfile.ts`.
- Status: Implemented.

### POST /auth/forgot-password
- Purpose: Send password reset request.
- Authentication: Public.
- Frontend: `src/lib/api/auth.ts`.
- Status: Implemented.

### POST /auth/reset-password
- Purpose: Reset password.
- Authentication: Token in request body.
- Frontend: `src/lib/api/auth.ts`.
- Status: Implemented.

## Menu

### GET /menu
- Purpose: List menu items.
- Authentication: Public.
- Frontend: `src/services/api/menu.service.ts` + home/menu/detail/admin menu pages.
- Status: Implemented.

### GET /menu/:id
- Purpose: Fetch menu item detail.
- Authentication: Public.
- Frontend: `src/services/api/menu.service.ts` + menu detail page.
- Status: Implemented.

## Cart

### GET /cart
- Purpose: Retrieve server cart snapshot.
- Authentication: Optional/depends on backend.
- Frontend: `src/services/api/cart.service.ts`.
- Status: Implemented.

## Orders

### GET /orders
- Purpose: List orders.
- Authentication: Authenticated user/admin contexts.
- Frontend: `src/services/api/order.service.ts`, customer/admin/kitchen flows.
- Status: Implemented.

### GET /orders/:id
- Purpose: Get order detail.
- Authentication: Depends on backend policy.
- Frontend: `src/services/api/order.service.ts`, order tracking.
- Status: Implemented.

### PATCH /orders/:id
- Purpose: Update order status.
- Authentication: Admin/kitchen role.
- Frontend: `src/services/api/order.service.ts`, admin orders page.
- Status: Implemented.

### POST /orders/:id/cancel
- Purpose: Cancel order.
- Authentication: Role-restricted.
- Frontend: `src/services/api/order.service.ts`, admin orders page.
- Status: Implemented.

### POST /orders/:id/refund
- Purpose: Trigger refund.
- Authentication: Role-restricted.
- Frontend: `src/services/api/order.service.ts`, admin orders page.
- Status: Implemented.

## Payments

### POST /payments/process
- Purpose: Process checkout payment.
- Authentication: Depends on backend policy.
- Frontend: `src/lib/api/payments.ts`, payment processing route.
- Status: Implemented.

### GET /payments
- Purpose: Payment history for admin reporting.
- Authentication: Admin role.
- Frontend: `src/services/api/admin.service.ts`, admin payments page.
- Status: Implemented.

## Rewards / HP

### GET /rewards
- Purpose: Rewards snapshot (balance, tiers, redemptions, challenges, transactions).
- Authentication: Bearer.
- Frontend: `src/services/api/reward.service.ts`, rewards page.
- Status: Implemented.

## Delivery

### GET /delivery-window
- Purpose: Delivery/open-window status.
- Authentication: Public.
- Frontend: `src/services/api/delivery.service.ts`, `useDeliveryWindow` hook.
- Status: Implemented.

## Admin Users

### GET /admin/users
- Purpose: Admin user list and balances.
- Authentication: Admin role.
- Frontend: `src/services/api/admin.service.ts`, admin users page.
- Status: Implemented.

---

## Remaining endpoint groups
The following groups are present in UI navigation but still need final schema-backed endpoint verification from the OpenAPI JSON before complete contract-level integration: referrals, leaderboard, wallet, events, marketplace, notifications, rider operations, CMS/storefront, and full analytics/report exports.
