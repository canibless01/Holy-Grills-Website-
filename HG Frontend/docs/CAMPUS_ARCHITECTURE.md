# Shared Architectural Specification: Multi-Campus, Ticketing, Birthday & Milestones

Per task scope rules ("If a change would require touching a shared component, config, or context file used by other domains, stop and describe the change instead of making it directly"), this document specifies the required shared architectural changes across the frontend application.

## 1. Global Multi-Campus Scoping

### 1.1 API Interceptor (`src/lib/api/client.ts`) - Mechanism 1
Add request header interceptor for `X-Campus-ID` header:
- Reads stored guest/session campus UUID from `sessionStorage` or `localStorage` (`hg_selected_campus_id`).
- Automatically attaches `X-Campus-ID: <campus-uuid>` header to all outgoing guest browsing requests (menu, events, marketplace, storefront).

### 1.2 Shared Layout & Non-Cancelable Gate (`src/app/layouts/SiteLayout.tsx` & `src/components/layout/CampusSelectorModal.tsx`)
- Add a persistent `CampusContext` / Zustand store to manage selected campus state.
- Render a non-cancelable modal `CampusSelectorModal` on guest interactions targeting campus-scoped actions (Menu browse, Event registration, Checkout).
- The modal cannot be closed/dismissed without selecting a campus. Upon selection, saves `campus_id` and sets `X-Campus-ID` in `apiClient`.

### 1.3 Admin Shared Components (`src/components/admin/AdminLayout.tsx` & Admin Pages) - Mechanism 2 & 3
- **Admin Campus Filter Dropdown**: In `AdminLayout` / top bar, add a campus selector dropdown for `super_admin` users, pulling options from `GET /api/admin/campuses`. Appends `?campus_id=<uuid>` to admin list/analytics API calls.
- **Admin Analytics Breakdown**: Build side-by-side per-campus breakdown widgets across sales, orders, HP, and user metrics.
- **Admin Create/Edit Forms**: In shared form dialogs (Menu, Events, Rewards, Storefront, Delivery), append `campus_id` to JSON request payload for `super_admin`.

## 2. Event Ticketing Architecture
- **Event Detail & Comparison**: Add dynamic tier comparison table component comparing feature arrays, badges, and early-bird deadlines.
- **Dynamic Registration Builder**: Render custom form fields based on `registration_fields` in event schema for guest and student registration flows.
- **User Dashboard ("My Tickets")**: Add QR code view and ticket status cards under student profile routes.

## 3. Birthday HP & Peer Pre-Fill Flow
- Route deep-linking for push notifications (`/hp`).
- Pre-fill transfer target user ID/email when navigating from birthday notification ("Send HP" action).

## 4. PWA & Push Notification Milestones
- Extend Activities/Challenges route with lifetime Milestones list (`Install PWA`, `Enable Notifications`).
- Integrate `display-mode: standalone` and `beforeinstallprompt` browser event hooks.
- Trigger `POST /api/challenges/pwa-installed` and `POST /api/challenges/push-subscribed` upon verified user actions.
