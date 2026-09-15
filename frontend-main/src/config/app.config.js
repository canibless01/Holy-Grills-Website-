/**
 * Holy Grill — Central Application Configuration
 * ============================================================================
 * THE single source of truth for app-wide brand, PWA, SEO, and integration
 * constants. Every page, component, and future builder MUST import from here
 * — never hardcode the app name, currency, theme color, or brand values
 * anywhere else.
 *
 *   import APP_CONFIG from '@/config/app.config';
 *
 * See BUILDER_RULES.md for the full set of binding rules.
 * ============================================================================
 */
export const APP_CONFIG = {
  name: 'Holy Grills',
  shortName: 'HolyGrills',
  tagline: "FUTA's Only Flame Grill",
  emoji: '🔥',

  // Update to your production domain before going live (used for canonical URLs + OG).
  domain: 'https://holygrill.app',

  university: 'FUTA',
  currency: { code: 'NGN', symbol: '₦', locale: 'en-NG' },

  // Brand colors — mirror the `flame` scale in tailwind.config.js / src/index.css.
  themeColor: '#FF4E2D',
  backgroundColor: '#FFF5F0',
  accentColor: '#FFB400',

  pwa: {
    startUrl: '/',
    display: 'standalone',
    orientation: 'portrait',
    scope: '/',
  },

  // OneSignal web push. The App ID is a PUBLIC value (safe in client code).
  // Set it here to enable push notifications. The REST API key (server-only)
  // is stored as a secret — see base44/functions/sendPushNotification.
  onesignal: {
    appId: '', // ← Paste your OneSignal App ID here to enable push
  },

  seo: {
    defaultTitle: "Holy Grills 🔥 — FUTA's Only Flame Grill",
    defaultDescription:
      "FUTA's Only Flame Grill — Real flame-grilled chicken, wings, kebabs + crispy sides. Earn Holy Points, climb the leaderboard, unlock rewards.",
    ogType: 'website',
    twitterCard: 'summary_large_image',
    // Default social share image (absolute URL recommended for crawlers).
    defaultImage: '',
  },

  // Channel defaults — push and in-app notifications are ALWAYS delivered together.
  notifications: {
    pushAndInAppTogether: true,
  },
};

export default APP_CONFIG;