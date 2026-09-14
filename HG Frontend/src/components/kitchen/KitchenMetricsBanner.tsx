'use client';

import { Clock, TrendingUp, CheckCircle2 } from 'lucide-react';
import type { KitchenMetrics } from '@/services/api/kitchen.service';

interface KitchenMetricsBannerProps {
  metrics: KitchenMetrics | null;
}

export function KitchenMetricsBanner({ metrics }: KitchenMetricsBannerProps) {
  if (!metrics) return null;

  return (
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
  );
}
