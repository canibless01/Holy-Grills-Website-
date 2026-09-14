"use client";

/**
 * HeroCarousel.tsx
 * ---------------------------------------------------------------------------
 * Renders the homepage hero section as an animated carousel/slideshow.
 *
 * Each slide comes from the database (fetched server-side in app/page.tsx) and
 * contains: tag badge, title, description, up to 2 CTA buttons, and a hero image.
 *
 * Carousel behaviour:
 *  - Auto-advances every 5 seconds.
 *  - Pause-on-hover so users can read the current slide.
 *  - Smooth crossfade transition powered by Framer Motion.
 *  - Vertical dot indicator positioned at the centre-right of the section.
 *
 * How admin changes reach users:
 *  Admin saves slides → PUT /api/hero updates in-memory store →
 *  Next page load fetches updated slides server-side (SSR) →
 *  This component receives them as props and renders the updated carousel.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, ArrowRight } from 'lucide-react';
import { Link } from '@/lib/router';
import type { HeroSlide } from '@/types';

interface HeroCarouselProps {
  slides: HeroSlide[];
}

const SLIDE_DURATION_MS = 5000;

export function HeroCarousel({ slides }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeSlides = slides.filter((s) => s.isActive);
  const total = activeSlides.length;

  /** Advance to the next slide, wrapping around */
  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % total);
  }, [total]);

  /** Auto-play: reset timer whenever current slide or pause state changes */
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!isPaused && total > 1) {
      timerRef.current = setTimeout(next, SLIDE_DURATION_MS);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [current, isPaused, next, total]);

  if (total === 0) return null;

  const slide = activeSlides[current];

  return (
    <section
      className="relative md:pt-16 overflow-hidden min-h-[520px] md:min-h-[600px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.55, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          {/* ── Full-bleed background image (all breakpoints) ── */}
          <div className="absolute inset-0">
            <img
              src={slide.imageUrl}
              alt={slide.title.replace(/\n/g, ' ')}
              className="w-full h-full object-cover object-center"
            />
            {/* Dark-brown tint for moody contrast */}
            <div className="absolute inset-0 bg-[#1a0802]/65" />
            {/* Bottom-to-top fade keeps the text area deeply shadowed */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Slide text content */}
      <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={`content-${slide.id}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            {/* Tag badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/30 mb-6">
              <Flame size={14} className="text-white" />
              <span className="text-xs font-body font-medium text-white">{slide.tag}</span>
            </div>

            {/* Title — newlines become line breaks for dramatic multi-line effect */}
            <h1 className="font-display font-extrabold text-4xl md:text-6xl lg:text-7xl text-white leading-[1.05] mb-6 whitespace-pre-line">
              {formatTitle(slide.title)}
            </h1>

            {/* Description */}
            <p className="font-body text-white/80 text-base md:text-lg max-w-lg mb-8 leading-relaxed">
              {slide.description}
            </p>

            {/* CTA buttons (max 2) */}
            <div className="flex flex-wrap gap-3">
              {slide.ctaButtons.slice(0, 2).map((cta) =>
                cta.variant === 'primary' ? (
                  <Link
                    key={cta.label}
                    to="/menu"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-gradient-fire text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity shadow-glow"
                  >
                    {cta.label}
                    <ArrowRight size={16} />
                  </Link>
                ) : (
                  <Link
                    key={cta.label}
                    to="/menu"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-secondary text-foreground font-display font-bold text-sm hover:bg-border transition-colors"
                  >
                    {cta.label}
                  </Link>
                )
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Vertical dot indicator – centre-right of the hero section ── */}
      {total > 1 && (
        <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2.5">
          {activeSlides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrent(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className="group relative flex items-center justify-center focus:outline-none"
            >
              <span
                className={`block rounded-full transition-all duration-300 ${
                  idx === current
                    ? 'w-2.5 h-7 bg-primary shadow-glow'
                    : 'w-2 h-2 bg-primary/30 group-hover:bg-primary/60'
                }`}
              />
            </button>
          ))}
        </div>
      )}

      {/* Progress bar at the very bottom of the section */}
      {total > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary/10 z-20">
          <motion.div
            key={`progress-${slide.id}-${isPaused ? 'paused' : 'playing'}`}
            className="h-full bg-gradient-fire origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isPaused ? 0 : 1 }}
            transition={{ duration: SLIDE_DURATION_MS / 1000, ease: 'linear' }}
          />
        </div>
      )}
    </section>
  );
}

/**
 * Renders the title with the middle line wrapped in a fire-gradient span.
 * Lines are split on newline characters so the admin can control line breaks.
 */
function formatTitle(title: string) {
  const lines = title.split('\n').filter(Boolean);
  if (lines.length === 1) return <span className="text-gradient-fire">{lines[0]}</span>;

  return (
    <>
      {lines[0]}
      {lines.length > 1 && (
        <>
          {' '}
          <span className="text-gradient-fire">{lines[1]}</span>
        </>
      )}
      {lines.length > 2 && (
        <>
          {' '}
          {lines[2]}
        </>
      )}
    </>
  );
}
