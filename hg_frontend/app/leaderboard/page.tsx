'use client';

import { useState } from 'react';
import { Crown, Trophy, Flame, Award } from 'lucide-react';
import { SiteLayout } from '@/app/layouts/SiteLayout';
import { LEADERBOARD_ENTRIES } from '@/services/mocks/platform';

export default function Page() {
  const [tab, setTab] = useState<'weekly' | 'all-time'>('weekly');

  const top3 = LEADERBOARD_ENTRIES.slice(0, 3);
  const runnersUp = LEADERBOARD_ENTRIES.slice(3);

  return (
    <SiteLayout title="Leaderboard">
      <main className="flex-1 pb-12 pt-4 md:pt-24">
        <div className="container mx-auto max-w-4xl space-y-6 px-4">
          <section className="rounded-[2rem] border border-border bg-card p-6 md:p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Leaderboard</p>
                <h1 className="mt-2 font-display text-3xl font-bold text-foreground">Compete for campus bragging rights. 🔥</h1>
                <p className="mt-1 text-xs text-muted-foreground">Top performers win exclusive drops and Hall of Fame points.</p>
              </div>

              <div className="inline-flex rounded-full border border-border bg-secondary/50 p-1">
                {(['weekly', 'all-time'] as const).map((value) => (
                  <button
                    key={value}
                    onClick={() => setTab(value)}
                    className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                      tab === value ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {value === 'weekly' ? 'Weekly Sprint' : 'Hall of Fame'}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Visual Podium for Top 3 */}
          <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
            <h2 className="font-display font-bold text-lg text-foreground text-center mb-6">🏆 Campus Podium</h2>
            <div className="grid grid-cols-3 gap-3 items-end max-w-lg mx-auto">
              {/* Rank 2 (Silver) */}
              {top3[1] && (
                <div className="flex flex-col items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold border-2 border-slate-300">
                    2
                  </div>
                  <p className="mt-2 font-display font-bold text-xs text-foreground truncate max-w-[90px]">{top3[1].name}</p>
                  <p className="text-[11px] font-semibold text-primary">{top3[1].hp} HP</p>
                  <div className="mt-3 w-full bg-slate-300/40 dark:bg-slate-700/40 rounded-t-2xl h-24 flex items-center justify-center text-xs font-bold text-slate-500">
                    🥈 Silver
                  </div>
                </div>
              )}

              {/* Rank 1 (Gold) */}
              {top3[0] && (
                <div className="flex flex-col items-center">
                  <Crown size={24} className="text-amber-500 animate-bounce mb-1" />
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500 text-white font-bold border-4 border-amber-300 shadow-glow">
                    1
                  </div>
                  <p className="mt-2 font-display font-bold text-sm text-foreground truncate max-w-[100px]">{top3[0].name}</p>
                  <p className="text-xs font-bold text-primary">{top3[0].hp} HP</p>
                  <div className="mt-3 w-full bg-amber-500/20 rounded-t-2xl h-32 flex items-center justify-center text-xs font-extrabold text-amber-600 dark:text-amber-400">
                    🥇 Champion
                  </div>
                </div>
              )}

              {/* Rank 3 (Bronze) */}
              {top3[2] && (
                <div className="flex flex-col items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-800/20 text-amber-700 dark:text-amber-400 font-bold border-2 border-amber-800/40">
                    3
                  </div>
                  <p className="mt-2 font-display font-bold text-xs text-foreground truncate max-w-[90px]">{top3[2].name}</p>
                  <p className="text-[11px] font-semibold text-primary">{top3[2].hp} HP</p>
                  <div className="mt-3 w-full bg-amber-800/10 rounded-t-2xl h-20 flex items-center justify-center text-xs font-bold text-amber-700 dark:text-amber-500">
                    🥉 Bronze
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Current User Highlight */}
          <div className="rounded-[2rem] border border-primary/20 bg-primary/10 p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary">Your Standings</p>
              <p className="mt-1 font-display font-bold text-base text-foreground">Rank #3 · 248 HP Earned</p>
              <p className="text-xs text-muted-foreground">You are only 12 HP away from Rank #2!</p>
            </div>
            <div className="flex items-center gap-1 text-primary font-bold text-sm bg-background px-3 py-1.5 rounded-full border border-primary/20">
              <Flame size={16} /> 3-Day Streak
            </div>
          </div>

          {/* Runners Up List */}
          <div className="space-y-3">
            {runnersUp.map((entry, index) => (
              <div key={entry.id} className="flex items-center gap-4 rounded-[2rem] border border-border bg-card p-4 hover:border-primary/30 transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary font-display text-sm font-bold text-foreground">
                  #{index + 4}
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                  {entry.avatarSeed}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground text-sm">{entry.name}</p>
                  <p className="text-xs text-muted-foreground">{entry.streak}-day streak</p>
                </div>
                <span className="font-display font-bold text-primary text-sm">{entry.hp} HP</span>
              </div>
            ))}
          </div>

          <div className="rounded-[2rem] border border-border bg-card p-5 text-xs text-muted-foreground flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Award size={18} />
            </div>
            <p>
              Weekly leaderboard resets every Sunday at 11:59 PM. The top 3 winners earn exclusive free meals & Hall of Fame entries!
            </p>
          </div>
        </div>
      </main>
    </SiteLayout>
  );
}
