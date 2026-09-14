# Holy Grills (Next.js)

Holy Grills is a food-ordering web app built with **Next.js App Router**, Tailwind CSS, Zustand, React Query, and mock API routes.

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Zustand (state stores)
- TanStack Query (client data/query cache)
- Axios (API client)
- Route handlers (`app/api/*`) for backend-like mock endpoints

## Project Structure

- `app/` — Next.js routes, layouts, and API route handlers
- `src/app/routes/public/` — main public UI screens
- `src/app/routes/admin/` — admin UI screens
- `src/components/` — reusable UI and feature components
- `src/stores/` — Zustand stores (cart, auth, fulfillment, orders)
- `src/data/` — mock domain data used by UI and mock APIs
- `src/lib/api/` — axios client + endpoint helper functions
- `app/api/` — mock backend endpoints you can replace with real backend logic later

## Important Functions and How the Code Works

### 1) Routing and page composition

- Next routes are file-based inside `app/**/page.tsx`.
- Each page composes the existing feature views from `src/app/routes/*` and wraps them with:
  - `SiteLayout` for customer-facing pages
  - `AdminPage` for admin sections

### 2) Global providers (`app/providers.tsx`)

- Creates the React Query client (`QueryClientProvider`)
- Mounts tooltip and toast providers used across the app

### 3) State management with Zustand

Key stores:

- `src/stores/cartStore.ts`: add/update/remove/clear cart, derived totals
- `src/stores/fulfillmentStore.ts`: delivery vs pickup details used in checkout
- `src/stores/orderStore.ts`: order lifecycle state
- `src/stores/authStore.ts`: auth/session model

### 4) API layer with Axios

- `src/lib/api/client.ts`: central axios instance (`/api` base URL)
- `src/lib/api/menu.ts`: menu fetch helper
- `src/lib/api/payments.ts`: payment processing helper

This keeps UI logic separated from request details so you can swap endpoints safely.

### 5) Mock backend endpoints (backend-mimicking)

Implemented in `app/api`:

- `GET /api/menu` → returns menu items
- `POST /api/orders` → accepts payload and returns created order object
- `GET /api/orders/:id` → returns one order or 404
- `POST /api/payments/process` → validates payment payload and returns success response

When your real backend is ready, replace these handlers or change axios base URL/helpers.

## Fetching Pattern Used (Next + best practice)

- UI uses **React Query + Axios** for client-side data fetching and cache.
- Example: `src/app/routes/public/Menu.tsx` fetches menu items with `useQuery` via `fetchMenuItems()`.
- This pattern keeps network code centralized and supports retries/cache/invalidation cleanly.

## Running the Project

```bash
npm install
npm run dev
```

Open: `http://localhost:3000`

## Scripts

- `npm run dev` — Next dev server
- `npm run build` — production build
- `npm run start` — run production server
- `npm run lint` — lint project
- `npm run test` — run tests

## Notes for Backend Integration

To wire a real backend with minimal friction:

1. Keep request/response shapes in `src/lib/api/*` stable.
2. Point axios to your real backend base URL.
3. Replace `app/api/*` handlers or remove them once backend routes are live.
4. Keep UI calling API helpers, not raw URLs, so endpoint changes stay isolated.
