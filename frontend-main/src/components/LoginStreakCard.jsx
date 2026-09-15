import React from 'react';
import { Flame, ChevronRight } from 'lucide-react';
import { useHolyGrill } from '@/lib/HolyGrillContext';
import { useNavigate } from 'react-router-dom';

/**
 * LoginStreakCard — full-width card shown to authenticated users on the home
 * page. Reads the real login streak from the backend, shows a 7-day progress
 * bar with countdown to next reward, and navigates to the dashboard for
 * check-in (the actual check-in action lives on the dashboard, not here).
 */
export default function LoginStreakCard() {
  const { streak, getSetting } = useHolyGrill();
  const navigate = useNavigate();
  const days = streak?.current_streak ?? streak?.days ?? streak?.count ?? 0;
  const streakCycle = getSetting('streak_cycle_days', 7);
  const cycleDay = days === 0 ? 0 : ((days - 1) % streakCycle) + 1;
  const daysToNext = streakCycle - cycleDay;

  return (
    <button
      onClick={() => navigate('/dashboard')}
      className="w-full rounded-menu bg-card border border-border p-4 flex items-center gap-3 shadow-cart-card hover:shadow-selected-soft transition-shadow text-left"
    >
      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <Flame className="w-6 h-6 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-heading font-bold text-sm text-foreground">
          {days}-day login streak 🔥
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {days === 0
            ? 'Start your streak on the dashboard'
            : daysToNext === 0
              ? 'Reward ready — claim on dashboard!'
              : `${daysToNext} day${daysToNext !== 1 ? 's' : ''} to your next reward`}
        </div>
        <div className="flex gap-1 mt-2">
          {Array.from({ length: streakCycle }).map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full ${i < cycleDay ? 'bg-primary' : 'bg-muted'}`} />
          ))}
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
    </button>
  );
}