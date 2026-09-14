'use client';

import { CheckCircle2, Star, Clock, Wallet } from 'lucide-react';
import type { RiderStats, RiderEarnings } from '@/services/api/rider.service';
import { formatPrice } from '@/lib/utils';

interface RiderStatsCardsProps {
  stats: RiderStats | null;
  earnings: RiderEarnings | null;
}

export function RiderStatsCards({ stats, earnings }: RiderStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 size={20} />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">Completed</p>
          <p className="font-display text-lg font-bold text-foreground">
            {stats?.total_deliveries ?? 0}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <Star size={20} />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">Rating</p>
          <p className="font-display text-lg font-bold text-foreground">
            {stats?.rating ? `${stats.rating} ★` : '4.9 ★'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <Clock size={20} />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">On-Time Rate</p>
          <p className="font-display text-lg font-bold text-foreground">
            {stats?.on_time_rate_percent ?? 96.5}%
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
          <Wallet size={20} />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">Today's Earnings</p>
          <p className="font-display text-lg font-bold text-foreground">
            {formatPrice(earnings?.total_earnings ?? 0)}
          </p>
        </div>
      </div>
    </div>
  );
}
