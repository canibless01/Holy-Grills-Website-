'use client';

import { Radio, Clock3, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@/lib/router';
import { useDeliveryWindow } from '@/hooks/useDeliveryWindow';
import { getKitchenCapacity } from '@/services/api/menu.service';
import { formatCountdown } from '@/utils/deliveryWindow';

interface KitchenCountdownCardProps {
  className?: string;
  showOrderHint?: boolean;
  ctaLabel?: string;
}

export function KitchenCountdownCard({
  className = '',
  ctaLabel = 'Order Now',
}: KitchenCountdownCardProps) {
  const info = useDeliveryWindow();
  const { data: capacity } = useQuery({
    queryKey: ['kitchen-capacity'],
    queryFn: getKitchenCapacity,
  });

  const isClosed = info.status === 'closed';
  const countdownValue = isClosed ? formatCountdown(info.countdownSeconds) : info.nextChangeLabel;

  return (
    <div className={`container mx-auto px-4 -mt-8 relative z-20 ${className}`.trim()}>
      <div className="rounded-3xl border border-border bg-card p-6 shadow-xl space-y-4 max-w-2xl mx-auto">
        {/* Top-left: Small pill-shaped tag */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary tracking-wide uppercase">
            <Radio size={12} className="animate-pulse text-primary" />
            Kitchen Radar
          </span>
          {capacity?.daily_order_capacity !== undefined && (
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
              {capacity.current_orders ?? 0}/{capacity.daily_order_capacity} Capacity
            </span>
          )}
        </div>

        {/* Below tag: Medium heading */}
        <h2 className="font-display text-2xl font-bold text-foreground">
          {isClosed ? 'Kitchen Opens Soon' : 'Kitchen Live Dispatch'}
        </h2>

        {/* Below heading: Small paragraph */}
        <p className="text-sm text-muted-foreground">
          {isClosed ? info.detail : 'Order now for instant kitchen prep and rapid campus delivery.'}
        </p>

        {/* Below paragraph: Wide, dark rectangular box containing large, bold countdown timer */}
        <div className="rounded-2xl bg-zinc-900 dark:bg-zinc-950 p-5 text-center text-white shadow-inner">
          <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-zinc-400 font-semibold mb-1">
            <Clock3 size={14} className="text-primary" />
            <span>{isClosed ? 'Time Until Next Window' : 'Current Window Closing In'}</span>
          </div>
          <p className="font-display text-4xl sm:text-5xl font-black tracking-tight text-white">
            {countdownValue}
          </p>
        </div>

        {/* Bottom of card: Horizontal footer row */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          {/* Left side: Small pill with text */}
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-foreground">
            {isClosed ? 'Pre-orders Open' : 'Kitchen Active'}
          </span>

          {/* Right side: Solid rectangular action button */}
          <Link
            to="/menu"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-transform active:scale-95"
          >
            <span>{ctaLabel}</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
