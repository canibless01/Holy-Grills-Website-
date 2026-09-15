import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame } from 'lucide-react';
import { liveApi } from '@/lib/liveApi';

const DEFAULT_SLIDES = [
  { tag: 'Faith. Love. Energy. Flavor.', sub: 'Experience Holy Grills — real flame-grilled goodness.', cta: 'Order Now' },
  { tag: 'Flame-Grilled. Always.', sub: 'Real chicken, real fire, real flavour.', cta: 'See the Menu' },
  { tag: 'Earn Holy Points. Climb the Ranks.', sub: 'Every order fuels your flame.', cta: 'Start Earning' },
];

const DEFAULT_HERO_IMG = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80';

export default function HeroCarousel({ onCta }) {
  const [slides, setSlides] = useState(DEFAULT_SLIDES);
  const [heroImg, setHeroImg] = useState(DEFAULT_HERO_IMG);
  const [i, setI] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const loadHero = async () => {
      try {
        const sections = await liveApi.storefront.getSections({ section_type: 'hero' });
        if (cancelled || !Array.isArray(sections) || !sections.length) return;
        const active = sections.filter((s) => s.is_active !== false);
        if (!active.length) return;
        const mapped = active.map((s) => ({
          tag: s.content?.tag || s.content?.title || s.title || '',
          sub: s.content?.sub || s.content?.subtitle || s.subtitle || '',
          cta: s.content?.cta || 'Order Now',
        }));
        if (mapped.length) setSlides(mapped);
        const firstImg = active[0]?.content?.image_url || active[0]?.content?.image;
        if (firstImg) setHeroImg(firstImg);
      } catch { /* keep defaults */ }
    };
    loadHero();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  const s = slides[i % slides.length];

  return (
    <div className="relative rounded-3xl overflow-hidden flame-gradient min-h-[280px]">
      <img
        src={heroImg}
        alt="Holy Grill flame-grilled food"
        loading="eager"
        decoding="async"
        fetchpriority="high"
        className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-multiply animate-ken-burns"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-cocoa-900/70 via-cocoa-900/20 to-transparent" />

      <div className="relative p-6 pt-8 flex flex-col h-full min-h-[280px] justify-end">
        <span className="inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full bg-flame-600/90 text-white text-xs font-bold mb-3">
          <Flame className="w-3.5 h-3.5" />
          FUTA's Only Flame Grill
        </span>
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <h1 className="font-heading font-extrabold text-3xl text-white leading-tight mb-2 text-balance">{s.tag}</h1>
            <p className="text-sm text-cocoa-200 mb-4 max-w-xs">{s.sub}</p>
          </motion.div>
        </AnimatePresence>
        <button
          onClick={onCta}
          className="self-start px-5 py-2.5 rounded-full flame-gradient text-white font-bold text-sm shadow-lg hover:scale-105 transition-transform"
        >
          {s.cta} →
        </button>
      </div>

      {/* Red dot indicators (bottom-right) */}
      <div className="absolute bottom-3 right-4 flex gap-1.5">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-2 rounded-full transition-all ${idx === i % slides.length ? 'bg-flame-500 w-5' : 'bg-white/50 w-2'}`}
          />
        ))}
      </div>
    </div>
  );
}