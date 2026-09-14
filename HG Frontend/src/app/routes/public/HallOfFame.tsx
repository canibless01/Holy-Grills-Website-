'use client';

import { Crown, Share2 } from 'lucide-react';
import { LEADERBOARD_ENTRIES } from '@/services/mocks/platform';

const HallOfFamePage = () => {
  const inductees = LEADERBOARD_ENTRIES.slice(0, 3);

  return (
    <main className="flex-1 pb-12 pt-4 md:pt-24">
      <div className="container mx-auto max-w-3xl space-y-5 px-4">
        <section className="rounded-[2rem] border border-border bg-card p-5">
          <h1 className="font-display text-3xl font-bold text-foreground">Hall of Fame</h1>
          <p className="mt-1 text-sm text-muted-foreground">Top performers with repeated leaderboard finishes.</p>
        </section>
        <section className="space-y-3">
          {inductees.map((entry, index) => (
            <div key={entry.id} className="rounded-[2rem] bg-gradient-dark p-5 text-brand-brown-foreground">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.2em] opacity-80"><Crown size={12} /> #{index + 1} inductee</p>
                  <h2 className="mt-2 font-display text-2xl font-bold">{entry.name}</h2>
                  <p className="text-sm opacity-80">{entry.hp} HP · {entry.streak}-day streak</p>
                </div>
                <button className="inline-flex items-center gap-1 rounded-full border border-white/30 px-3 py-1.5 text-xs font-semibold"><Share2 size={12} /> Share</button>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
};

export default HallOfFamePage;
