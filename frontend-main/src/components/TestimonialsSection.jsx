import React from 'react';
import { Star, Quote } from 'lucide-react';
import TestimonialSlider from '@/components/TestimonialSlider';

/**
 * TestimonialsSection — on-brand testimonials block for the Home page.
 *
 * Desktop (md+): a 2×2 grid of quote cards with star ratings.
 * Mobile: the auto-rotating TestimonialSlider (swipeable, dots, arrows).
 *
 * NOTE: testimonials are hardcoded. The previous implementation fetched
 * storefront sections with section_type='testimonial', but the
 * StorefrontSection enum only allows hero, banner, promo, faq,
 * early_supporter — so that fetch always returned empty. Removed.
 */
export default function TestimonialsSection({ testimonials = [] }) {
  return (
    <section>
      <div className="text-center mb-6">
        <span className="hg-eyebrow">Testimonials</span>
        <h2 className="font-heading font-bold text-xl text-cocoa-800 mt-1">Real Students. Real Flavour. 🔥</h2>
        <p className="text-sm text-cocoa-400 mt-1.5 max-w-md mx-auto">Every review earned through open flame and genuine craft.</p>
      </div>

      {/* Desktop grid */}
      <div className="hidden md:grid grid-cols-2 gap-4 max-w-3xl mx-auto">
        {testimonials.map((t, idx) => (
          <div key={idx} className="rounded-2xl bg-white border border-cocoa-100 p-5 hover:shadow-selected-soft transition-shadow">
            <div className="flex items-start gap-3">
              <Quote className="w-8 h-8 text-flame-100 shrink-0 -mt-1" />
              <div className="min-w-0">
                <div className="flex gap-0.5 mb-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-3.5 h-3.5 fill-gold-300 text-gold-300" />
                  ))}
                </div>
                <p className="text-sm text-cocoa-700 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-2.5 mt-3">
                  <div className="w-8 h-8 rounded-full flame-gradient text-white font-bold flex items-center justify-center text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-heading font-bold text-sm text-cocoa-800">{t.name}</div>
                    <div className="text-[11px] text-cocoa-400">Verified Student Order</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile slider */}
      <div className="md:hidden">
        <TestimonialSlider testimonials={testimonials} />
      </div>
    </section>
  );
}