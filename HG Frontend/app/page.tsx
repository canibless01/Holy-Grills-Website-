/**
 * app/page.tsx  –  Server Component (no "use client")
 * ---------------------------------------------------------------------------
 * Fetching hero slides here on the server side means:
 *  - The HTML sent to the browser already contains slide content (SSR).
 *  - Search engines can index the hero text without running JavaScript.
 *  - There is zero client-side loading delay for the carousel.
 *
 * In production, replace the direct import with a real database query, e.g.:
 *   const slides = await db.heroSlides.findMany({ where: { isActive: true } });
 */

import Home from "@/app/routes/public/Home";
import { SiteLayout } from "@/app/layouts/SiteLayout";
import { HERO_SLIDES } from "@/data/heroSlides";

export default function Page() {
  // SSR: read active slides directly from the data store (simulates a DB query).
  // Only active slides are passed to the frontend carousel.
  const heroSlides = HERO_SLIDES.filter((s) => s.isActive);

  return (
    <SiteLayout>
      <Home heroSlides={heroSlides} />
    </SiteLayout>
  );
}
