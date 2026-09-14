'use client';

import { Check, Flame, RotateCcw, X } from 'lucide-react';
import { useAuthStreak } from '@/hooks/useAuthStreak';

const WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const StreakPage = () => {
  const { data } = useAuthStreak();
  const streak = data?.streakCount ?? 3;

  return (
    <main className="flex-1 pb-12 pt-4 md:pt-24">
      <div className="container mx-auto max-w-3xl space-y-5 px-4">
        <section className="rounded-[2rem] bg-gradient-fire p-6 text-primary-foreground">
          <p className="text-xs uppercase tracking-[0.2em] opacity-80">Login streak</p>
          <h1 className="mt-2 font-display text-4xl font-bold">{streak} day{streak === 1 ? '' : 's'}</h1>
          <p className="mt-1 text-sm opacity-90">Log in daily to keep your streak alive and unlock bonus HP.</p>
        </section>

        <section className="rounded-[2rem] border border-border bg-card p-5">
          <div className="grid grid-cols-7 gap-2">
            {WEEK.map((day, index) => {
              const status = index < Math.min(streak, 7) ? 'checked' : index === Math.min(streak, 7) ? 'pending' : 'missed';
              return (
                <div key={day} className="text-center">
                  <div className={`mx-auto flex h-10 w-10 items-center justify-center rounded-xl ${status === 'checked' ? 'bg-green-100 text-green-700' : status === 'pending' ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                    {status === 'checked' ? <Check size={15} /> : status === 'pending' ? <Flame size={15} /> : <X size={14} />}
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">{day}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
          <p className="inline-flex items-center gap-2 font-semibold text-foreground"><RotateCcw size={14} className="text-primary" /> Missed a day?</p>
          Complete an order or top up your wallet to reclaim streak momentum.
        </section>
      </div>
    </main>
  );
};

export default StreakPage;
