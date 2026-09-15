import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * AutoScrollCarousel — a horizontal row that auto-scrolls continuously and
 * loops seamlessly, pausing on hover/touch so manual swipe works too.
 * Respects reduced-motion.
 *
 * Children must each have a fixed width + `flex-shrink-0`.
 *
 * Auto-scroll and manual swipe coexist: the rAF loop only advances scrollLeft
 * when not paused. On touch start we pause immediately; on touch end we resume
 * after a short delay so the user's swipe momentum settles first.
 */
export default function AutoScrollCarousel({ children, speed = 30, className = '' }) {
  const ref = useRef(null);
  const [paused, setPaused] = useState(false);
  const resumeTimer = useRef(null);

  const pause = useCallback(() => {
    setPaused(true);
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
  }, []);

  const resume = useCallback(() => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setPaused(false), 2500);
  }, []);

  useEffect(() => {
    return () => { if (resumeTimer.current) clearTimeout(resumeTimer.current); };
  }, []);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = ref.current;
    if (!el) return;
    let raf;
    let last = performance.now();
    const tick = (now) => {
      const dt = now - last;
      last = now;
      el.scrollLeft += (speed * dt) / 1000;
      // Seamless loop: when we reach the end of the first set of children,
      // jump back to the start. Because children are duplicated (see below),
      // the visual content is identical so the jump is invisible.
      const half = el.scrollWidth / 2;
      if (el.scrollLeft >= half) {
        el.scrollLeft -= half;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused, speed]);

  return (
    <div
      ref={ref}
      onMouseEnter={pause}
      onMouseLeave={resume}
      onTouchStart={pause}
      onTouchEnd={resume}
      className={`flex gap-3 overflow-x-auto scrollbar-hide snap-x ${className}`}
    >
      {children}
      {/* Duplicate children for a seamless infinite loop */}
      {children}
    </div>
  );
}