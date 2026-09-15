# Holy Grill — Builder Rules (Binding)

> **Every builder (AI or human) working on this app MUST read this file first.**
> These are constants — they apply to every new page, component, and refactor.
> The frontend stack is **React + Vite (SPA)**, not Next.js. SSR/SSG is not
> available; SEO is handled client-side via meta management + structured data.

---

## 1. Single Source of Truth

| Concern | Source | Import |
|---|---|---|
| App name, currency, theme color, OneSignal ID, SEO defaults | `src/config/app.config.js` | `import APP_CONFIG from '@/config/app.config'` |
| Colors, spacing, radius, shadows, z-index, breakpoints (JS) | `src/config/designTokens.js` | `import { COLORS, RADIUS, Z_INDEX } from '@/config/designTokens'` |
| Icons (lucide) + sizes + custom brand icons | `src/config/icons.js` | `import { ICONS, ICON_SIZES, HpIcon } from '@/config/icons'` |
| Sounds | `src/lib/soundManager.js` | `import { playSound } from '@/lib/soundManager'` |
| Animation variants | `src/lib/animationPresets.js` | `import { fadeUp, staggerContainer } from '@/lib/animationPresets'` |
| CSS tokens (primary styling source) | `src/index.css` + `tailwind.config.js` | use mapped Tailwind classes (`bg-primary`, `font-heading`) |

**Never hardcode** the app name, currency symbol, theme color, or brand hex
values in a component. Always import from the config.

**Never import icons directly from `lucide-react` in new components.** Add the
icon to `ICONS` in `src/config/icons.js` first, then import from there. Icon
size is always an `ICON_SIZES` value, never an arbitrary pixel number.

---

## 2. PWA — Every Page Is a PWA Page

The service worker (`public/service-worker.js`) is registered globally in
`src/main.jsx` and caches the app shell + runtime assets. **You do not need to
do anything per-page for caching** — but:

- **New static assets** referenced at app load (fonts, critical images) should
  be added to `SHELL_ASSETS` in the service worker if they must be available
  offline.
- **Offline fallback** is `public/offline.html`. Keep it self-contained.
- **Update flow** is automatic: a new SW installs → client reloads. Don't
  build custom update UI without coordinating with `main.jsx`.
- **Install prompt** is global (`src/components/InstallPrompt.jsx`, rendered in
  `App.jsx`). Don't add a second install banner.
- **manifest.json** lives in `public/`. App shortcuts (Order, HP, Events) are
  defined there — add new primary destinations as shortcuts.
- **PNG icons (pre-launch task):** export `icon-192.png`, `icon-512.png`, and
  `maskable-512.png` into `public/icons/` and re-add them to `manifest.json`'s
  `icons` array. SVG icons are present now (Chrome installable); PNGs are needed
  for full Lighthouse + iOS home-screen parity.
- **iOS splash screen (pre-launch task):** add `apple-touch-startup-image` links
  to `index.html` for each iOS device size once a splash PNG exists.

---

## 3. SEO — Every Page Must Set Its Meta

**Every new page MUST render `<SEO />` (or call `useSEO`) at the top:**

```jsx
import SEO from '@/components/SEO';

export default function Menu() {
  return (
    <>
      <SEO title="Menu" description="Browse Holy Grill's flame-grilled menu" />
      {/* page content */}
    </>
  );
}
```

- Defaults (title, description, OG/Twitter) come from `APP_CONFIG.seo` — only
  override what's specific to the page.
- `index.html` holds the global defaults + JSON-LD restaurant schema. Don't
  duplicate OG tags statically in `index.html` for per-page content — use `<SEO />`.
- For share images, pass an absolute `image` URL.
- Because this is a SPA, social crawlers see `index.html` defaults; per-route
  meta updates for in-app sharing and Google's JS crawler.

---

## 4. Performance & Accessibility

- **Lazy-load images**: use `src/components/LazyImage.jsx` (or
  `loading="lazy" decoding="async"` + explicit width/height). Never load
  offscreen images eagerly.
- **Route-level code splitting**: new top-level pages should be lazy-imported
  in `App.jsx` (`React.lazy(() => import(...))`) and wrapped in `<Suspense>`.
- **Touch targets**: all interactive elements ≥ 44×44px. Primary actions
  within thumb reach on mobile. No horizontal scrolling.
- **Accessibility**: semantic HTML, `aria-label` on icon-only buttons, proper
  focus management, support `prefers-reduced-motion` (animations use the
  `reducedMotion` fallback where motion is essential).
- **Lighthouse target**: 90+ on PWA, Performance, Accessibility, SEO.

---

## 5. Sound — Amplify Moments That Matter

Use `playSound(name)` (or `useSound().play(name)`) **only** for moments that
matter to the student. Routine navigation/filtering/reading stays silent.

| Sound name | When |
|---|---|
| `cart_add` | Item added to cart |
| `cart_remove` | Item removed from cart |
| `order_placed` | Order placed successfully |
| `order_status` | Order status update |
| `push_received` | Push notification received |
| `hp_earned` | HP earned after delivery |
| `review_submitted` | Review submitted |
| `spin_spinning` | Spin wheel spinning |
| `spin_win` | Spin wheel win |
| `spin_no_win` | Spin wheel no-win |
| `badge_unlock` | Badge unlocked |
| `tier_upgrade` | Tier upgraded |
| `set_completed` | Collectible set completed |
| `leaderboard_up` | Leaderboard rank increased |
| `streak_milestone` | Streak milestone hit |
| `hp_transfer_sent` | HP transfer sent |
| `hp_transfer_received` | HP transfer received |
| `first_order` | First order ever (once per account) |
| `spin_idle` | Spin wheel idle (ambient, optional) |
| `flash_countdown` | Flash redemption countdown (ambient, optional) |

- Audio **always** respects device silent mode (Web Audio is hardware-muted).
- Global on/off toggle persists in `localStorage` (`hg_sound_enabled`) and is
  surfaced in user settings.
- Valid names are in `SOUND_NAMES` — calling an unknown name logs a warning.

---

## 6. Micro-Animations — Feel Alive, Not Loud

Import variants from `src/lib/animationPresets.js`. Match the spec:

- **Cart add**: item thumbnail scales up → snaps into cart icon; cart icon
  bounces once (`cartAddPop`, `cartIconBounce`).
- **Cart total**: number rolls (slot-machine digit), never a jump cut.
- **HP balance**: counts up over 1.5s with a gold shimmer on land
  (`hpCountUp`).
- **Spin wheel**: idle slow rotation (1 rev / 8s) → accelerate → decelerate
  with friction; win flashes segment twice + confetti; no-win gentle pulse.
- **Badge unlock**: face-down flip + shimmer + bounce (`badgeUnlock`); banner
  slides in from top (`bannerSlideDown`).
- **Tier upgrade**: full-screen moment — dim background, badge scales in with
  glow pulse, particle burst, 4s auto-dismiss (`tierUpgrade`).
- **Leaderboard**: rows slide in sequentially (50ms stagger, `leaderboardRow`);
  user's own row pulses gold (`leaderboardSelfPulse`); rank-change arrow
  green-up / muted-down.
- **Streak**: flame grows with each day; pulses at 7 days (`streakFlame`).
- **Tier progress**: liquid fill, not a sliding bar (`liquidFill`).
- **Profile**: tier-colored ring around photo (Ember=orange, Flame=brighter
  orange, Blaze=gold, Holy=animated gold shimmer). Ring transitions on tier
  change over 0.5s. Badge shelf: earned badges with 3D tilt on hover; unearned
  in greyscale + lock icon.

**Principle**: if the moment matters, amplify it. If it's routine, keep it
smooth and invisible.

---

## 7. Push Notifications (OneSignal)

- Set your OneSignal App ID in `src/config/app.config.js` → `onesignal.appId`
  (public value — safe in client code; added at launch as env config).
- Set the OneSignal REST API Key as an environment secret
  (`ONESIGNAL_REST_API_KEY`) at launch — never hardcode it.
- `src/lib/onesignal.js` initializes the SDK and maps the app user ID. Call
  `initOneSignal(user.id)` after login.
- Device tokens are stored in the `DeviceToken` entity.
- **Channel default**: push + in-app are always delivered together.
- To send a push from a backend function, call the `sendPushNotification`
  function with `{ appId, playerId, title, body, data }` (requires the
  `ONESIGNAL_REST_API_KEY` env secret).

---

## 8. Component Conventions

- Export every page/component as **default**, named same as its file.
- Files ≤ 50 lines; split oversized components into focused files.
- Use shadcn/ui from `@/components/ui`; Tailwind for styling.
- Write Tailwind classes as **literal strings** (the build purges dynamic
  class names). Never use `bg-${color}-500` patterns.
- Use `@/` alias imports, never relative `src/` paths.
- Let errors bubble (no try/catch) unless it's a user-facing form/auth flow.