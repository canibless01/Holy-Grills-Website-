'use client';

import { Link } from '@/lib/router';
import { Users, ArrowRight, Tag, Truck, Sparkles } from 'lucide-react';

export function SquadOrderEducation() {
  const minItems = 5;
  const maxItems = 15;
  const discountPct = 10;
  const deliveryDiscountPct = 100;

  const benefits = [
    { icon: Tag, title: `${discountPct}% off`, body: 'Discount on the whole squad order total.' },
    { icon: Truck, title: 'Free delivery', body: `${deliveryDiscountPct}% delivery discount for squad.` },
    { icon: Sparkles, title: 'Even HP split', body: 'HP splits across every member instantly.' },
  ];

  return (
    <section className="rounded-3xl border border-border bg-card p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-2">
            <Users size={14} /> Squad Orders
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground">Feast together. Earn together. 🔥</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl">
            Order as a squad! Stack <span className="font-bold text-foreground">{minItems}–{maxItems} items</span>, get bulk discounts + free delivery, and share HP rewards across all squad members automatically.
          </p>
        </div>
        <Link
          to="/menu"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors shrink-0"
        >
          Start a squad order <ArrowRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        {benefits.map((b) => (
          <div key={b.title} className="rounded-2xl bg-secondary/50 border border-border p-4">
            <b.icon size={20} className="text-primary mb-2" />
            <h4 className="font-display font-bold text-sm text-foreground">{b.title}</h4>
            <p className="text-xs text-muted-foreground mt-1">{b.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
