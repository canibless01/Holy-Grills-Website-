import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * TestimonialSlider — an auto-rotating testimonial carousel that supports
 * manual swipe (framer-motion drag), arrow controls, and pill-dot tracking.
 * Pauses on hover / while the user is interacting. Honors prefers-reduced-motion.
 *
 *   - `compact`      (default false): smaller padding + text, for item-level reviews
 *   - `subtext`      (default 'Verified Student Order'): small caption shown under the name
 *   - `testimonials`: array of `{ text, name, rating? }`. When `rating` (1–5)
 *                    is included the rendered stars reflect it, otherwise the slide
 *                    shows a fixed five-star block.
 */
export default function TestimonialSlider({ testimonials = [], intervalMs = 5500, compact = false, subtext = 'Verified Student Order' }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const dragStartX = useRef(null);

  useEffect(() => {
    if (paused || testimonials.length <= 1) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setI((p) => (p + 1) % testimonials.length), intervalMs);
    return () => clearInterval(t);
  }, [paused, testimonials.length, intervalMs]);

  if (testimonials.length === 0) return null;
  const current = testimonials[i];
  const rating = typeof current.rating === 'number' ? current.rating : 5;

  const next = () => setI((p) => (p + 1) % testimonials.length);
  const prev = () => setI((p) => (p - 1 + testimonials.length) % testimonials.length);

  const cardClass = compact
    ? 'rounded-2xl bg-white border border-cocoa-100 p-4 sm:p-5 max-w-xl mx-auto'
    : 'rounded-2xl bg-white border border-cocoa-100 p-6 sm:p-8 max-w-2xl mx-auto';
  const textClass = compact
    ? 'font-medium text-sm sm:text-base text-cocoa-700 italic leading-relaxed'
    : 'font-medium text-lg sm:text-xl text-cocoa-800 italic leading-relaxed';
  const starSize = compact ? 'w-3 h-3' : 'w-4 h-4';
  const avatarClass = compact ? 'w-9 h-9 text-sm' : 'w-10 h-10';
  const subtextClass = compact ? 'text-[11px]' : 'text-xs';
  const userWrapClass = compact ? 'mt-3 flex items-center gap-3' : 'mt-4 flex items-center gap-3';

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => { dragStartX.current = e.touches[0].clientX; setPaused(true); }}
      onTouchEnd={(e) => {
        if (dragStartX.current != null) {
          const dx = e.changedTouches[0].clientX - dragStartX.current;
          if (Math.abs(dx) > 40) (dx < 0 ? next : prev)();
          dragStartX.current = null;
        }
        setTimeout(() => setPaused(false), 2500);
      }}
    >
      <div className="overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, x: compact ? 12 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: compact ? -12 : -20 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            onDragEnd={(e, info) => {
              if (Math.abs(info.offset.x) > 40) (info.offset.x < 0 ? next : prev)();
            }}
            transition={{ duration: compact ? 0.3 : 0.4, ease: 'easeOut' }}
          >
            <div className={cardClass}>
              {/* Star rating — gold per brand (Stars / Ratings = #FFC251) */}
              <div className="flex gap-0.5 mb-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`${starSize} ${s <= rating ? 'fill-gold-300 text-gold-300' : 'text-cocoa-200'}`} />
                ))}
              </div>
              <p className={textClass}>"{current.text}"</p>
              <div className={userWrapClass}>
                <div className={`rounded-full flame-gradient text-white font-bold flex items-center justify-center ${avatarClass}`}>
                  {current.name.charAt(0)}
                </div>
                <div>
                  <div className="font-heading font-bold text-sm text-cocoa-800">{current.name}</div>
                  <div className={`${subtextClass} text-cocoa-400`}>{subtext}</div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-4 mt-4">
        <button onClick={prev} aria-label="Previous testimonial" className="w-9 h-9 rounded-lg bg-white border border-cocoa-200 hover:border-flame-300 hover:text-flame-600 text-cocoa-500 flex items-center justify-center transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-1.5">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              aria-label={`Go to ${idx + 1}`}
              className={`h-2 rounded-full transition-all ${idx === i ? 'bg-flame-600 w-5' : 'bg-cocoa-200 w-2 hover:bg-cocoa-300'}`}
            />
          ))}
        </div>
        <button onClick={next} aria-label="Next testimonial" className="w-9 h-9 rounded-lg bg-white border border-cocoa-200 hover:border-flame-300 hover:text-flame-600 text-cocoa-500 flex items-center justify-center transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}