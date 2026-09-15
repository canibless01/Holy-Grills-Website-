# MERGE LOG: Legacy (frontend-main) -> Primary (hg_frontend)

This document records the exact feature migration, motion mapping, responsive adaptations, backend endpoint integrations, and hardcoded value replacements during the merge from `frontend-main` into `hg_frontend`.

---

## Panel 1: Student Panel

### 1. Global Layout & Components
* **LEGACY Files:** `src/components/WhatsAppFloatingButton.jsx`, `src/components/CookieConsent.jsx`, `src/components/InstallPrompt.jsx`, `src/components/Layout.jsx`
* **PRIMARY Files:** `hg_frontend/src/app/layouts/SiteLayout.tsx`
* **UI Elements Ported:** Floating WhatsApp support widget, cookie banner consent modal, PWA install prompt toast/banner.
* **Motion Ported:** Framer Motion smooth slide-in/fade-in transitions mapped to Tailwind design system classes (`animate-in fade-in slide-in-from-bottom`).
* **Backend Endpoints Wired:** Integrated with `/api/storefront/config/public` for dynamic contact links.
* **Responsive Fixes:** Positioned floating buttons with mobile-safe padding (`bottom-20 md:bottom-6`).

### 2. Home Page & Hero CMS Integration
* **LEGACY Files:** `src/pages/Home.jsx`, `src/components/SquadOrderEducation.jsx`, `src/components/CateringCard.jsx`, `src/components/EarlySupportersSection.jsx`
* **PRIMARY Files:** `hg_frontend/src/app/routes/public/Home.tsx`, `hg_frontend/src/components/shared/EarlySupportersSection.tsx`
* **UI Elements Ported:** Marquee food carousel, Squad order education banner, Catering request modal card, Early Supporters section.
* **Backend Endpoints Wired:**
  * Banners: `GET /api/storefront/banners`
  * Supporters: `GET /api/storefront/config/public` (dynamic supporters list)
  * Catering Requests: `POST /api/events/catering-requests`
  * Newsletter: `POST /api/storefront/newsletter`
* **Hardcoded Values Removed:** Replaced static supporters array in `EarlySupportersSection` with dynamic backend payload.

### 3. Events & Check-In Scanner
* **LEGACY Files:** `src/pages/Events.jsx`, `src/components/EventCheckInScanner.jsx`
* **PRIMARY Files:** `hg_frontend/src/app/routes/public/Events.tsx`, `hg_frontend/src/components/events/EventCheckInScanner.tsx`
* **UI Elements Ported:** Event list grid, ticket tier selector, QR ticket scanner component.
* **Backend Endpoints Wired:**
  * Events list: `GET /api/events`
  * Event check-in: `POST /api/events/checkin`
  * Catering submission: `POST /api/events/catering-requests`

### 4. Checkout & Off-Campus Map
* **LEGACY Files:** `src/pages/Checkout.jsx`, `src/components/OffCampusMap.jsx`
* **PRIMARY Files:** `hg_frontend/src/app/routes/public/Checkout.tsx`, `hg_frontend/src/components/checkout/FulfillmentDialog.tsx`, `hg_frontend/src/components/checkout/OffCampusMap.tsx`
* **UI Elements Ported:** Guest checkout fields, delivery/pickup toggle tabs, interactive off-campus map spot selector with GPS capture.
* **Backend Endpoints Wired:**
  * Order creation: `POST /api/orders`
  * Order capacity check: Response error handling for `CAPACITY_FULL` with deferral to `next_available_date`.

---

## Panel 2: Admin Panel

### 1. Menu Modifier & Image Upload Management
* **LEGACY Files:** `src/components/admin/AdminMenu.jsx`, `src/components/admin/ImageUploader.jsx`, `src/components/admin/MenuItemModifiers.jsx`
* **PRIMARY Files:** `hg_frontend/src/app/routes/admin/Menu.tsx`, `hg_frontend/src/components/admin/ImageUploader.tsx`
* **UI Elements Ported:** Menu item search, category filter, availability toggle, hidden/secret item checkbox, direct Cloudinary file uploader.
* **Backend Endpoints Wired:**
  * Upload signature: `POST /api/upload/signature`
  * Direct Cloudinary upload: `POST https://api.cloudinary.com/v1_1/{cloud_name}/image/upload`
  * Menu management: `GET /api/menu`, `PATCH /api/menu/{id}`

---

## Panel 3: Kitchen Panel

### 1. Kitchen Display System (KDS) & Prep Queue
* **LEGACY Files:** `src/pages/Kitchen.jsx`, `src/components/kitchen/KitchenHeader.jsx`, `src/components/kitchen/KitchenOrderCard.jsx`, `src/components/kitchen/KitchenSettings.jsx`
* **PRIMARY Files:** `hg_frontend/src/app/routes/kitchen/Kitchen.tsx`
* **UI Elements Ported:** Kitchen open/closed status switch, live Kanban prep queue, scheduled order promotion list, window batch consolidation summary card, kitchen settings modal.
* **Backend Endpoints Wired:**
  * Queue: `GET /api/kitchen/queue`
  * Scheduled: `GET /api/kitchen/scheduled`
  * Metrics: `GET /api/kitchen/metrics`
  * Settings: `GET /api/kitchen/settings`, `PATCH /api/kitchen/settings`
  * Batch advance: `POST /api/kitchen/batch/{id}/advance`
  * Order status: `PATCH /api/orders/{id}/status`

---

## Panel 4: Rider Panel

### 1. Logistics & Dispatch Dashboard
* **LEGACY Files:** `src/pages/Rider.jsx`, `src/components/rider/RiderHeader.jsx`, `src/components/rider/RiderOrderCard.jsx`
* **PRIMARY Files:** `hg_frontend/src/app/routes/rider/Rider.tsx`
* **UI Elements Ported:** Online duty toggle with browser GPS capture, active batch delivery stop list, pickup/deliver status triggers, delivery attempt modal with reason notes, earnings breakdown, call customer link wrapper.
* **Backend Endpoints Wired:**
  * Duty toggle: `PATCH /api/riders/availability`
  * My batch: `GET /api/riders/my-batch`
  * Pickup order: `POST /api/riders/orders/{id}/pickup`
  * Deliver order: `POST /api/riders/orders/{id}/deliver`
  * Attempt order: `POST /api/riders/orders/{id}/attempt`
  * Call link: `GET /api/riders/call/{id}`
  * Stats & earnings: `GET /api/riders/stats`, `GET /api/riders/earnings`, `GET /api/riders/history`
