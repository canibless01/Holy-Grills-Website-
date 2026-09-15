import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, ChevronRight } from 'lucide-react';

export default function OurStory() {
  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center pt-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-flame-50 text-flame-600 text-[11px] font-bold uppercase tracking-wider rounded-lg">
          <Flame className="w-3.5 h-3.5" /> Our Story
        </span>
        <h1 className="font-heading font-extrabold text-3xl text-cocoa-800 mt-3">Real Flame. No Shortcuts. 🔥</h1>
        <p className="text-sm text-cocoa-500 mt-2 max-w-md mx-auto">
          Holy Grills was born on FUTA campus out of one simple belief: that flame-grilled, well-seasoned food should be easy to get your hands on — without the wait, without the fuss.
        </p>
      </div>

      {/* Hero image */}
      <div className="relative rounded-2xl overflow-hidden aspect-[16/9] bg-cocoa-100">
        <img
          src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=80"
          alt="Holy Grills flame-grilled food"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cocoa-900/80 to-transparent" />
        <div className="absolute bottom-4 left-4 text-white">
          <div className="font-heading font-extrabold text-lg">The Holy Flame Method</div>
          <div className="text-xs text-cocoa-200">Real charcoal. Real time. Real flavour.</div>
        </div>
      </div>

      {/* Story body */}
      <div className="rounded-2xl bg-white border border-cocoa-100 p-6 space-y-4 text-sm text-cocoa-600 leading-relaxed">
        <p>
          We started small — a single grill, a few seasoned friends, and a belief that the food sold around campus deserved more care. Everyone said the secret was in the baste, so we basted like the building was on fire. Turns out the secret was actually in the consistency: real flame, real time, every single order.
        </p>
        <p>
          Today Holy Grills serves the FUTA community through delivery windows that open at predictable times — so you always know when the kitchen is live. Holy Points reward the students who keep coming back, and the leaderboard is the friendly fire that keeps us all ordering and climbing together.
        </p>
        <p>
          We are not trying to be the biggest grill in town. We are trying to be the most honest one — every plate made on real open flame, with the same care the very first one was.
        </p>
      </div>

      {/* Values grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { icon: '🔥', title: 'Open flame only', body: 'Every protein hits real flame — never a flat top, never a shortcut.' },
          { icon: '⏰', title: 'Predictable windows', body: 'Kitchen Radar means you always know when ordering is live and when your food arrives.' },
          { icon: '❤️', title: 'Built for students', body: 'Squad Orders, Holy Points, and rewards designed around how students actually eat.' },
        ].map((v) => (
          <div key={v.title} className="rounded-xl bg-white border border-cocoa-100 p-5">
            <div className="text-2xl mb-2">{v.icon}</div>
            <div className="font-bold text-sm text-cocoa-800 mb-1">{v.title}</div>
            <p className="text-xs text-cocoa-500 leading-relaxed">{v.body}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="rounded-2xl flame-gradient p-6 text-white text-center">
        <h3 className="font-heading font-bold text-lg mb-1">Ready to taste the difference?</h3>
        <p className="text-sm text-white/80 mb-4">Order now and earn Holy Points on every bite.</p>
        <Link to="/menu" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-white text-flame-600 font-bold text-sm">
          View the menu <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}