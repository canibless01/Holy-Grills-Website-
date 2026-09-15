import React, { useEffect, useRef, useState } from 'react';

/**
 * AnimatedNumber — counts up to `value` with an ease-out curve.
 * Used for HP balance, wallet balance, and any stat that should "roll"
 * instead of jump-cutting (per the micro-interaction spec).
 *
 *   <AnimatedNumber value={hpBalance.total_visible} className="text-sm font-bold" />
 */
export default function AnimatedNumber({ value = 0, duration = 1000, className }) {
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    const to = Number(value) || 0;
    if (from === to) {
      setDisplay(to);
      return;
    }
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setDisplay(Math.round(from + (to - from) * eased));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <span className={className}>{display.toLocaleString()}</span>;
}