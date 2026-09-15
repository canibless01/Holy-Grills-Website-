'use client';

import { Heart } from 'lucide-react';

const SUPPORTERS = [
  { id: '1', full_name: 'David A.', note: 'Believed in the flame from day one.' },
  { id: '2', full_name: 'Grace O.', note: 'First customer at FUTA hostelling.' },
  { id: '3', full_name: 'Tobi M.', note: 'Always repping Holy Grills.' },
];

export function EarlySupportersSection() {
  return (
    <section className="rounded-3xl border border-border bg-card p-6 md:p-8">
      <div className="flex items-center gap-2 mb-4">
        <Heart className="w-5 h-5 text-primary" />
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Grateful</span>
          <h2 className="font-display font-bold text-lg text-foreground">Early Supporters</h2>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {SUPPORTERS.map((s) => (
          <div key={s.id} className="rounded-2xl bg-secondary/40 border border-border p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/20 text-primary font-bold text-lg flex items-center justify-center mx-auto mb-2">
              {s.full_name.charAt(0)}
            </div>
            <div className="font-display font-bold text-sm text-foreground">{s.full_name}</div>
            <p className="text-xs text-muted-foreground mt-1 leading-snug">{s.note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
