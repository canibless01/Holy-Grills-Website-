'use client';

import { useState, useEffect } from 'react';
import { Clock, TrendingUp, CheckCircle2, BarChart2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import type { KitchenMetrics } from '@/services/api/kitchen.service';

interface KitchenMetricsBannerProps {
  metrics: KitchenMetrics | null;
}

const mockHourlyThroughput = [
  { hour: '11:00', orders: 12 },
  { hour: '12:00', orders: 28 },
  { hour: '13:00', orders: 35 },
  { hour: '14:00', orders: 22 },
  { hour: '15:00', orders: 15 },
  { hour: '16:00', orders: 18 },
  { hour: '17:00', orders: 30 },
  { hour: '18:00', orders: 42 },
];

export function KitchenMetricsBanner({ metrics }: KitchenMetricsBannerProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!metrics) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Avg Prep Time</p>
            <p className="font-display text-lg font-bold text-foreground">
              {metrics.avg_prep_time_minutes} mins
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Window Throughput</p>
            <p className="font-display text-lg font-bold text-foreground">
              {metrics.throughput_per_window} orders/hr
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Completion Rate</p>
            <p className="font-display text-lg font-bold text-foreground">
              {metrics.completion_rate_percent}%
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart2 size={16} className="text-primary" />
            <span className="font-display text-xs font-bold text-foreground">Hourly Kitchen Prep Volume</span>
          </div>
          <span className="text-[11px] text-muted-foreground">Peak: 18:00 (42 orders)</span>
        </div>
        <div className="h-28 w-full">
          {isMounted && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockHourlyThroughput} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} stroke="#888888" />
                <YAxis tick={{ fontSize: 10 }} stroke="#888888" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderRadius: '8px', border: 'none', fontSize: '11px' }}
                  itemStyle={{ color: '#ff8a4c' }}
                />
                <Bar dataKey="orders" fill="#ff8a4c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
