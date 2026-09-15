import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Check, X, RotateCcw, ChevronRight } from 'lucide-react';
import { getStreakRewardHp } from '@/lib/featureConfig';
import { useHolyGrill } from '@/lib/HolyGrillContext';
import LoadingSpinner from '@/components/LoadingSpinner';

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Streak screen — the daily button check-in has been removed per spec. This
// page now represents the LOGIN streak: check-ins happen automatically when
// the user logs in, and the calendar shows that auto state. The reclaim CTA
// is retained because missed days are still reclaimable by placing an order
// or topping up the wallet by ₦1,000+ on the missed day (login-streak rule).
export default function Streak() {
  const { streak, refreshStreak } = useHolyGrill();
  const loading = !streak;

  useEffect(() => {
    if (!streak) { (async () => { await refreshStreak(); })(); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const currentStreak = streak?.current_streak ?? streak?.streak_count ?? streak?.days ?? streak?.count ?? 0;
  const cycleDays = streak?.cycle_days ?? 7;
  const allowedMisses = streak?.allowed_misses ?? 2;
  const completedThisWeek = streak?.weekly_completed ?? streak?.weekly_progress ?? 0;
  const missedThisWeek = streak?.weekly_missed ?? 0;

  // Build the current week strip from the backend's week_progress.days (spec
  // /auth/streak response). Fall back to checkin_history for older shapes.
  const daysMap = streak?.week_progress?.days || {};
  const history = streak?.checkin_history ?? streak?.history ?? [];
  // "Today" is determined by the frontend comparing last_login_date with
  // today's date (spec) — the week always runs Mon–Sun regardless of streak start.
  const todayStr = new Date().toISOString().split('T')[0];
  const lastLoginDate = streak?.last_login_date;
  const loggedInToday = lastLoginDate === todayStr;
  const todayIdx = (new Date().getDay() + 6) % 7; // Monday = 0
  const week = WEEK_DAYS.map((day, i) => {
    const dayStatus = daysMap[day];
    let status;
    if (dayStatus) {
      status = dayStatus === 'checked' || dayStatus === 'today' ? 'checked_in' : dayStatus === 'reclaimed' ? 'reclaimed' : dayStatus === 'missed' ? 'missed' : 'pending';
    } else {
      // Fallback: checkin_history array (older API shape)
      const entry = history.find((h) => {
        const d = new Date(h.date || h.checked_at || h.day);
        return d.getDay() === ((i + 1) % 7);
      });
      status = !entry ? 'pending' : entry.reclaimed ? 'reclaimed' : entry.checked_in || entry.status === 'checked_in' ? 'checked_in' : entry.status === 'missed' ? 'missed' : 'pending';
    }
    // If the user logged in today, ensure today's weekday reflects that check-in.
    if (i === todayIdx && loggedInToday && status === 'pending') status = 'checked_in';
    return { day, status, isToday: i === todayIdx };
  });

  if (loading) return <LoadingSpinner label="Loading your streak…" />;

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="font-heading font-bold text-xl text-cocoa-800">Your Streak 🔥</h1>
        <p className="text-sm text-cocoa-400">Log in daily to keep your streak alive. Miss a day? Order or top up ₦1,000+ to reclaim it.</p>
      </div>

      {/* Streak hero — auto (system-read), no check-in button */}
      <div className="rounded-2xl flame-gradient p-5 text-white relative overflow-hidden">
        <div className="absolute -right-4 -top-4 text-6xl opacity-15">🔥</div>
        <div className="relative">
          <div className="text-[10px] font-bold uppercase tracking-wide text-white/80">Login streak</div>
          <div className="font-heading font-extrabold text-4xl mt-1">{currentStreak} <span className="text-sm font-normal text-white/80">day{currentStreak !== 1 ? 's' : ''}</span></div>
          <div className="text-xs text-white/80 mt-1">This week's reward: <span className="font-bold text-gold-300">{getStreakRewardHp(currentStreak)} HP</span></div>
          <div className="text-xs text-white/70 mt-0.5">Last login: {loggedInToday ? 'Today' : lastLoginDate ? new Date(lastLoginDate).toLocaleDateString() : '—'}</div>
          <div className="mt-4 text-center text-[11px] text-white/80 leading-relaxed">
            {completedThisWeek >= cycleDays
              ? '🔥 Week complete — HP on the way to your pending balance.'
              : `Log back in ${cycleDays - completedThisWeek} more day${(cycleDays - completedThisWeek) === 1 ? '' : 's'} to complete the week and earn HP.`}
          </div>
        </div>
      </div>

      {/* Weekly progress */}
      <div className="rounded-2xl bg-white border border-cocoa-100 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wide text-cocoa-500">This week</span>
          <span className="text-xs font-semibold text-cocoa-600">{completedThisWeek}/{cycleDays} completed · {missedThisWeek}/{allowedMisses} missed</span>
        </div>
        <div className="h-2 rounded-full bg-cocoa-100 mb-3">
          <div className="h-full rounded-full flame-gradient" style={{ width: `${Math.min(100, (completedThisWeek / cycleDays) * 100)}%` }} />
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {week.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${
                d.status === 'checked_in' ? 'bg-green-100 text-green-600' :
                d.status === 'reclaimed' ? 'bg-amber-100 text-amber-600' :
                d.status === 'missed' ? 'bg-red-50 text-red-400' : 'bg-cocoa-50 text-cocoa-300'
              } ${d.isToday ? 'ring-2 ring-flame-400 ring-offset-1' : ''}`}>
                {d.status === 'checked_in' ? <Check className="w-4 h-4" /> : d.status === 'reclaimed' ? <RotateCcw className="w-4 h-4" /> : d.status === 'missed' ? <X className="w-4 h-4" /> : '·'}
              </div>
              <span className="text-[9px] text-cocoa-400 font-medium">{d.day}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 mt-3 text-[10px] text-cocoa-400">
          <span className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500" /> Checked in</span>
          <span className="flex items-center gap-1"><RotateCcw className="w-3 h-3 text-amber-500" /> Reclaimed</span>
          <span className="flex items-center gap-1"><X className="w-3 h-3 text-red-400" /> Missed</span>
        </div>
      </div>

      {/* Reclaim CTA */}
      <div className="rounded-2xl bg-amber-50 border border-flame-200 p-4">
        <div className="flex items-start gap-3">
          <RotateCcw className="w-5 h-5 text-flame-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold text-sm text-cocoa-800">Missed a day? Reclaim it.</div>
            <p className="text-xs text-cocoa-500 mt-0.5">Place an order or top up your wallet by ₦1,000+ on the missed day and we'll restore that day automatically — your streak won't skip a beat.</p>
            <div className="flex gap-2 mt-3">
              <Link to="/menu" className="px-4 py-2 rounded-full flame-gradient text-white text-xs font-bold">Order now</Link>
              <Link to="/wallet" className="px-4 py-2 rounded-full bg-white border border-flame-200 text-flame-600 text-xs font-bold">Top up wallet</Link>
            </div>
          </div>
        </div>
      </div>

      <Link to="/dashboard" className="flex items-center justify-center gap-1 text-sm text-cocoa-500 pt-2">
        Back to dashboard <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}