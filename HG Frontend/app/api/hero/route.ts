/**
 * app/api/hero/route.ts
 * ---------------------------------------------------------------------------
 * REST endpoints for the hero carousel slides.
 *
 * GET  /api/hero  – Returns all slides (used by the admin panel).
 * PUT  /api/hero  – Replaces the full slides array (admin save).
 *
 * The data lives in the in-memory HERO_SLIDES store (src/data/heroSlides.ts).
 * In a real project these handlers would read/write a database instead.
 */

import { NextRequest, NextResponse } from "next/server";
import { HERO_SLIDES } from "@/data/heroSlides";
import type { HeroSlide } from "@/types";

/** Returns the full list of hero slides */
export async function GET() {
  return NextResponse.json({ data: HERO_SLIDES });
}

/**
 * Replaces the slides array in the in-memory store.
 * Body: { slides: HeroSlide[] }
 */
export async function PUT(request: NextRequest) {
  const body = await request.json();
  const slides: HeroSlide[] = body.slides;

  if (!Array.isArray(slides)) {
    return NextResponse.json({ error: "slides must be an array" }, { status: 400 });
  }

  // Mutate the shared in-memory store so the next SSR render picks up the change.
  // ⚠️  Production note: Replace this with a proper database write. Mutating a
  // module-level array is only safe in single-process demo environments.
  HERO_SLIDES.splice(0, HERO_SLIDES.length, ...slides);

  return NextResponse.json({ data: HERO_SLIDES });
}
