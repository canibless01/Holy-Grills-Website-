'use client';

import { Clock3, Flame, ShoppingBag } from 'lucide-react';
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
  showOrderHint = false,
  ctaLabel = 'Start your order',
}: KitchenCountdownCardProps) {
  const info = useDeliveryWindow();
  const { data: capacity } = useQuery({
    queryKey: ['kitchen-capacity'],
    queryFn: getKitchenCapacity,
  });

  const isClosed = info.status === 'closed';
  const countdownLabel = isClosed ? 'Next opening' : 'Kitchen window';
  const countdownValue = isClosed ? formatCountdown(info.countdownSeconds) : info.nextChangeLabel;

  return (
    <section className={`container mx-auto px-4 ${className}`.trim()} aria-live="polite">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-border bg-[linear-gradient(135deg,rgba(255,138,76,0.10),rgba(255,250,239,0.94)_48%,rgba(255,209,102,0.10))] p-4 shadow-[0_14px_32px_rgba(53,31,18,0.06)] md:p-5">
        <div className="pointer-events-none absolute -right-8 top-0 h-24 w-24 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary shadow-sm">
              <Flame size={13} /> Kitchen radar
            </div>
            <div className="mt-3 flex flex-col gap-2 lg:flex-row lg:items-end lg:gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold leading-tight text-foreground md:text-3xl">
                  {isClosed ? 'Kitchen opens in' : 'Kitchen is open now'}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {info.detail}
                </p>
              </div>
              {showOrderHint ? (
                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <ShoppingBag size={15} className="shrink-0 text-primary" />
                  <span>Place your order now and it will be processed as soon as the kitchen opens.</span>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-[1.4rem] border border-brand-brown/10 bg-brand-brown px-4 py-4 text-brand-brown-foreground lg:min-w-[260px] lg:items-end">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-brown-foreground/70">
              <Clock3 size={13} /> {countdownLabel}
            </div>
            <p className="font-display text-3xl font-black leading-none text-[#FFF6E7] md:text-4xl">
              {countdownValue}
            </p>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              <div className="inline-flex items-center rounded-full bg-white/10 px-3 py-2 text-xs font-medium text-brand-brown-foreground/80">
                {capacity?.daily_order_capacity !== undefined
                  ? `Capacity: ${capacity.current_orders ?? 0} / ${capacity.daily_order_capacity} orders`
                  : info.message}
              </div>
              <Link
                to="/menu"
                className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                {ctaLabel}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
