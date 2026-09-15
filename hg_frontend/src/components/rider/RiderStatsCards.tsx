'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Star, Clock, Wallet, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import type { RiderStats, RiderEarnings } from '@/services/api/rider.service';
import { formatPrice } from '@/lib/utils';

interface RiderStatsCardsProps {
  stats: RiderStats | null;
  earnings: RiderEarnings | null;
}

const mockEarningsTrend = [
  { day: 'Mon', earnings: 3500 },
  { day: 'Tue', earnings: 4200 },
  { day: 'Wed', earnings: 3800 },
  { day: 'Thu', earnings: 5100 },
  { day: 'Fri', earnings: 6800 },
  { day: 'Sat', earnings: 7400 },
  { day: 'Sun', earnings: 5900 },
];

export function RiderStatsCards({ stats, earnings }: RiderStatsCardsProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="space-y-4">
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

      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-500" />
            <span className="font-display text-xs font-bold text-foreground">Weekly Rider Earnings Trend</span>
          </div>
          <span className="text-[11px] text-muted-foreground">Total: ₦36,700</span>
        </div>
        <div className="h-28 w-full">
          {isMounted && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockEarningsTrend} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="riderEarningsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="#888888" />
                <YAxis tick={{ fontSize: 10 }} stroke="#888888" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderRadius: '8px', border: 'none', fontSize: '11px' }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Area type="monotone" dataKey="earnings" stroke="#10b981" fillOpacity={1} fill="url(#riderEarningsGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
