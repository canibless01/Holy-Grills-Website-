# Holy Grills Backend Integration Implementation

## Architecture
- Framework: Next.js App Router + client-side React Query + Zustand.
- API client: `src/lib/api/client.ts` with centralized base URL, auth header injection, and token refresh retry on `401`.
- Feature services: `src/services/api/*` now host backend calls and response normalization.

## Environment variables
- `NEXT_PUBLIC_BACKEND_URL` (primary)
- `NEXT_PUBLIC_API_BASE_URL` (fallback)
- Final fallback is `/api` for local mock routes.

## Authentication
- Login/signup/logout/profile/password reset remain in `src/lib/api/auth.ts`.
- Access token is attached centrally in the axios request interceptor.
- Session refresh uses `/auth/refresh` in the response interceptor.
- Cookie persistence continues through `src/lib/auth-session.ts`.

## Server state
- React Query is used across public/admin/kitchen pages for menu, orders, users, rewards, payments, and delivery status.
- Components consume service functions; raw HTTP calls stay out of UI files.

## Implemented integrations in this pass
- Menu list and menu detail (`/menu`, `/menu/:id`)
- Cart snapshot (`/cart`)
- Orders list/detail and admin mutations (`/orders`, `/orders/:id`, `PATCH /orders/:id`, `/orders/:id/cancel`, `/orders/:id/refund`)
- Payment processing and admin payment feed (`/payments/process`, `/payments`)
- Rewards snapshot (`/rewards`)
- Delivery window status (`/delivery-window`)
- Admin user list (`/admin/users`)

## UI integration updates
- Replaced direct mock usage with service-backed queries in:
  - Home
  - Menu item detail
  - Cart (saved-to-cart/menu linking)
  - Orders list
  - Order tracking
  - Rewards
  - Dashboard (customer)
  - Kitchen queue
  - Admin dashboard/menu/orders/users/payments/analytics

## Error/loading behavior
- Existing page-level empty/error messaging was preserved.
- Added loading/error hints where pages were previously fully static.

## Known limitations
- Full OpenAPI document could not be fetched from this environment due network resolution blocking on the provided host.
- Endpoint inventory and mapping are based on endpoints already referenced by the codebase and wired service contracts.
- Remaining modules (wallet, referrals, leaderboard, events, marketplace, notification center, CMS/system tools) require full OpenAPI access for schema-accurate end-to-end integration.
