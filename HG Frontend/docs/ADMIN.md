# Admin Integration Notes

## Admin access model
- Admin UI remains under `app/admin/*`.
- Route gating uses `AdminGuard` and user role from `useAuthStore`.
- Kitchen route remains separately gated with `allowKitchen`.

## Admin API services
- `src/services/api/admin.service.ts`
  - `getAdminUsers()` → `GET /admin/users`
  - `getAdminPayments()` → `GET /payments`
  - `getAdminAnalyticsSnapshot()` → composes menu + orders + users services
- `src/services/api/order.service.ts`
  - `updateOrderStatus()`
  - `cancelOrder()`
  - `refundOrder()`

## Integrated admin pages
- Dashboard: now reads live order feed for totals and active orders.
- Menu: initializes management grid from live menu endpoint.
- Orders: uses live orders with backend mutation attempts for status/cancel/refund.
- Users: uses admin users endpoint for list/sort and local HP adjustment UI.
- Payments: reads backend payment feed for filtering and stats.
- Analytics: computes KPIs and charts from live orders/menu/users snapshots.

## Remaining admin modules
Pages still using reusable placeholder shells need schema-backed endpoint mapping from the OpenAPI source before completion:
- delivery windows
- notifications
- abandoned carts
- leaderboard controls
- operating hours
- riders
- challenge engine
- rewards/HP advanced controls
- events and marketplace admin pages (currently disabled)

## Security and behavior
- API calls use shared auth header and refresh flow.
- Frontend route protection is enforced, while backend authorization remains source of truth.
