import React from 'react';
import { Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { useHolyGrill } from '@/lib/HolyGrillContext';

/**
 * CombinedStreakCard — login streak card on the Home page.
 *
 * The daily-button check-in streak has been removed per spec. This card now
 * shows ONLY the login streak, which is auto/system-read — the user does not
 * click anything. It keeps the flame template that the daily check-in used:
 * big day-count + 7-day progression strip. Purely display.
 *
 * Backend: login streak auto-increments on login; week-completion HP
 * (Week 1 = 25, 2 = 40, 3 = 60, 4+ = 80) goes to pending. Up to 2 missed
 * days/week reclaimable via an order or wallet top-up. This card just
 * reflects the streak the context already loads.
 */
export default function CombinedStreakCard() {
  const { streak, getSetting } = useHolyGrill();

  const currentStreak = streak?.current_streak ?? streak?.days ?? streak?.count ?? 0;
  const streakCycle = getSetting('streak_cycle_days', 7);
  const cycleDay = currentStreak === 0 ? 0 : ((currentStreak - 1) % streakCycle) + 1;
  const daysToNext = streakCycle - cycleDay;
  const daysThisWeek = streak?.days_this_week ?? cycleDay;

  return (
    <div className="rounded-2xl flame-gradient p-4 text-white relative overflow-hidden shadow-selected-soft">
      <div className="absolute -right-4 -top-4 text-6xl opacity-15">🔥</div>
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Flame className="w-4 h-4 text-white animate-flame-flicker" />
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wide text-white/80">Login Streak</div>
          </div>
          <div className="text-[10px] text-white/60">
            {daysThisWeek >= streakCycle
              ? 'Reward unlocked!'
              : `${daysToNext}d to week reward`}
          </div>
        </div>

        <motion.div
          key={currentStreak}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="font-heading font-extrabold text-3xl text-white"
        >
          {currentStreak} <span className="text-sm font-normal text-white/80">day streak</span>
        </motion.div>

        {/* 7-day progression strip — auto/visual, no button */}
        <div className="flex justify-between gap-1 mt-3">
          {Array.from({ length: streakCycle }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-0.5 flex-1">
              <div className={`h-1.5 w-full rounded-full ${i < daysThisWeek ? 'bg-white' : 'bg-white/25'}`} />
              <span className="text-[8px] text-white/50">{['M','T','W','T','F','S','S'][i]}</span>
            </div>
          ))}
        </div>

        <div className="mt-3 text-center text-[10px] text-white/70 leading-relaxed">
          {daysThisWeek >= streakCycle
            ? '🔥 Week complete — HP on the way to your pending balance.'
            : `Log back in ${daysToNext} more day${daysToNext === 1 ? '' : 's'} to complete the week and earn HP.`}
        </div>
      </div>
    </div>
  );
}