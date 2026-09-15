import React from 'react';
import { Flame } from 'lucide-react';
import { getTierProgress } from '@/lib/hgUtils';

export default function HpDisplay({ hpBalance, compact = false }) {
  if (!hpBalance) return null;
  const tierInfo = getTierProgress(hpBalance.hp_earned_120day);

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-50 to-flame-50 border border-flame-200">
        <Flame className="w-4 h-4 text-flame-600" />
        <div className="flex items-baseline gap-1">
          <span className="font-bold text-lg text-cocoa-800">{hpBalance.total_visible}</span>
          <span className="text-xs font-semibold text-flame-600 uppercase">HP</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-cocoa-700 to-cocoa-900 p-5 text-white overflow-hidden relative">
      {/* Flame decoration */}
      <div className="absolute -right-4 -top-4 text-6xl opacity-10">🔥</div>

      <div className="flex items-center justify-between mb-4 relative">
        <div>
          <div className="text-xs text-gold-300 font-bold uppercase tracking-wide">Holy Points</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-4xl font-heading font-extrabold">{hpBalance.total_visible}</span>
            <span className="text-sm text-flame-400 font-bold">HP</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl">{tierInfo.current.icon}</div>
          <div className="text-sm font-bold">{tierInfo.current.name}</div>
          <div className="text-[10px] text-flame-400">{tierInfo.current.earn_multiplier}x multiplier</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-xl bg-white/10 p-3">
          <div className="text-[10px] text-cocoa-300 uppercase tracking-wide">Active</div>
          <div className="text-xl font-bold">{hpBalance.active}</div>
        </div>
        <div className="rounded-xl bg-white/10 p-3">
          <div className="text-[10px] text-cocoa-300 uppercase tracking-wide">Pending</div>
          <div className="text-xl font-bold text-flame-400">{hpBalance.pending}</div>
        </div>
      </div>

      {/* Tier Progress */}
      {tierInfo.next && (
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-cocoa-300">Progress to {tierInfo.next.name} {tierInfo.next.icon}</span>
            <span className="font-bold text-flame-400">{tierInfo.remaining} HP to go</span>
          </div>
          <div className="h-2 rounded-full bg-cocoa-600 overflow-hidden">
            <div className="h-full flame-gradient rounded-full transition-all duration-500" style={{ width: `${tierInfo.progress}%` }} />
          </div>
        </div>
      )}

      {/* Pending unlock hint */}
      {hpBalance.pending > 0 && (
        <div className="mt-3 rounded-xl bg-flame-600/20 border border-flame-500/30 p-3 text-xs">
          <div className="flex items-center gap-1.5 text-flame-300 font-semibold mb-1">
            <Flame className="w-3 h-3" />
            {hpBalance.pending} HP pending — order food to unlock
          </div>
          <p className="text-cocoa-300">Every ₦1,000 food spend unlocks 30 HP from your pending pool.</p>
        </div>
      )}
    </div>
  );
}