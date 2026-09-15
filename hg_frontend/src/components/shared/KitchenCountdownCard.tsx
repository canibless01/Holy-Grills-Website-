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
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-card p-3 shadow-sm md:px-5 md:py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Clock3 size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-sm text-foreground">
                {isClosed ? 'Kitchen Opens In' : 'Kitchen Open Live'}
              </span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                {countdownValue}
              </span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {isClosed ? info.detail : 'Order now for instant prep & rapid delivery!'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {capacity?.daily_order_capacity !== undefined && (
            <span className="hidden sm:inline-block rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              {capacity.current_orders ?? 0}/{capacity.daily_order_capacity} Orders
            </span>
          )}
          <Link
            to="/menu"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-transform active:scale-95"
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
