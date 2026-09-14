'use client';

import { useState } from 'react';
import { Crown } from 'lucide-react';
import { SiteLayout } from '@/app/layouts/SiteLayout';
import { LEADERBOARD_ENTRIES } from '@/services/mocks/platform';

export default function Page() {
  const [tab, setTab] = useState<'weekly' | 'all-time'>('weekly');

  return (
    <SiteLayout title="Leaderboard">
      <main className="flex-1 pb-12 pt-4 md:pt-24">
        <div className="container mx-auto max-w-4xl space-y-6 px-4">
          <section className="rounded-[2rem] border border-border bg-card p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Leaderboard</p>
            <h1 className="mt-2 font-display text-3xl font-bold text-foreground">Compete for weekly bragging rights.</h1>
            <div className="mt-4 inline-flex rounded-full border border-border bg-background p-1">
              {(['weekly', 'all-time'] as const).map((value) => (
                <button key={value} onClick={() => setTab(value)} className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>{value === 'weekly' ? 'Weekly' : 'All-time'}</button>
              ))}
            </div>
          </section>

          <div className="rounded-[2rem] border border-primary/20 bg-primary/10 p-5">
            <p className="text-sm font-semibold text-foreground">Current user highlight</p>
            <p className="mt-1 text-sm text-muted-foreground">Adewale Johnson sits at #3 with 248 HP and a 3-day streak.</p>
          </div>

          <div className="space-y-3">
            {LEADERBOARD_ENTRIES.map((entry, index) => (
              <div key={entry.id} className="flex items-center gap-4 rounded-[2rem] border border-border bg-card p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary font-display text-lg font-bold text-foreground">{index + 1}</div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">{entry.avatarSeed}</div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{entry.name}</p>
                  <p className="text-xs text-muted-foreground">{entry.streak}-day streak</p>
                </div>
                <span className="font-semibold text-primary">{entry.hp} HP</span>
              </div>
            ))}
          </div>

          <div className="rounded-[2rem] border border-border bg-card p-5 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 text-foreground font-semibold"><Crown size={16} className="text-primary" /> Prize callout</div>
            Winner gets a featured rewards drop and front-row placement in next week&apos;s leaderboard teaser strip.
          </div>
        </div>
      </main>
    </SiteLayout>
  );
}
