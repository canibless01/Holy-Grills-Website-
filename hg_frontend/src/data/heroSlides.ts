/**
 * heroSlides.ts
 * ---------------------------------------------------------------------------
 * In-memory "database" for hero carousel slides.
 *
 * In a production app this data would live in a real database (e.g. Postgres,
 * MongoDB) and be read/written via server-side API calls. For demo purposes we
 * use a mutable module-level array so that:
 *  - The GET /api/hero route can return the current slides.
 *  - The PUT /api/hero route can update the array in place.
 *  - The Next.js server component in app/page.tsx reads the same array on each
 *    request, giving true SSR behaviour with zero client-side delay.
 *
 * The demo slides intentionally reuse existing menu images and titles so you
 * can see the carousel working immediately without any external assets.
 */

import type { HeroSlide } from '@/types';

const IMG_BASE =
  'https://raw.githubusercontent.com/Ibidapo-Ayo/holygrill/main/public/images/custom-images/menu';

/** Mutable store – mutated by the admin PUT /api/hero route.
 *
 * ⚠️  Production note: Replace this in-memory array with real database reads/writes
 * (e.g. `db.heroSlides.findMany()`). Module-level mutation is only safe for
 * demo/prototyping where a single Node.js process serves all requests.
 */
export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    tag: "FUTA's Only Flame Grill 🔥",
    title: 'Grill the Vibe.\nFeel Alive.',
    description:
      "Real flame-grilled chicken, wings, kebabs + crispy sides — crafted the way others won't. Delivered to you.",
    ctaButtons: [
      { label: 'Order Now →', href: '/menu', variant: 'primary' },
    ],
    imageUrl: `${IMG_BASE}/campus_menu1.jpg`,
    isActive: true,
  },
  {
    id: 'slide-2',
    tag: 'Faith in Every Flame 🙏🔥',
    title: 'Grilled with Faith.\nServed with Love.',
    description:
      'Every plate is made with open flame and genuine care. Not a shortcut in sight — just the Holy Flame Method, every time.',
    ctaButtons: [
      { label: 'Feel the Difference →', href: '/menu', variant: 'primary' },
    ],
    imageUrl: `${IMG_BASE}/mediterranean_menu3.jpg`,
    isActive: true,
  },
  {
    id: 'slide-3',
    tag: 'Built for FUTA. Built Together. ❤️‍🔥',
    title: 'From one grill,\nto a million thrills.',
    description:
      'From the post-exam plate to the Friday night squad order — Holy Grills is always somewhere in the middle of the best campus moments.',
    ctaButtons: [
      { label: 'Join the Vibe →', href: '/signup', variant: 'primary' },
    ],
    imageUrl: `${IMG_BASE}/campus_menu2.jpg`,
    isActive: true,
  },
  {
    id: 'slide-4',
    tag: 'Only Flame. No Shortcuts. 🔥',
    title: 'Faith. Love.\nEnergy. Flavor.',
    description:
      'The four pillars behind every marinade, every baste, every flame-grilled order that arrives at your door.',
    ctaButtons: [
      { label: 'Experience Holy Grills →', href: '/menu', variant: 'primary' },
    ],
    imageUrl: `${IMG_BASE}/mediterranean_menu2.jpg`,
    isActive: true,
  },
];
