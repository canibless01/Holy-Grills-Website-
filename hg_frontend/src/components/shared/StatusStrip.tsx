'use client';

import { Clock3, Truck } from 'lucide-react';
import { useDeliveryWindow } from '@/hooks/useDeliveryWindow';
import { formatCountdown } from '@/utils/deliveryWindow';

interface StatusStripProps {
  compact?: boolean;
}

export function StatusStrip({ compact = false }: StatusStripProps) {
  const info = useDeliveryWindow();
  const tone = info.status === 'closed'
    ? 'border-destructive/20 bg-destructive/10 text-destructive'
    : info.status === 'closing_soon'
      ? 'border-accent/20 bg-accent/10 text-accent'
      : 'border-primary/20 bg-primary/10 text-primary';

  return (
    <div className={`rounded-2xl border px-4 py-3 ${tone}`} aria-live="polite">
      <div className={`flex ${compact ? 'flex-col gap-1 sm:flex-row sm:items-center sm:justify-between' : 'flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'}`}>
        <div className="flex items-center gap-2">
          <Truck size={16} />
          <div>
            <p className="text-sm font-semibold">{info.message}</p>
            <p className="text-xs opacity-80">{info.detail}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold">
          <Clock3 size={14} />
          <span>{info.status === 'closed' ? formatCountdown(info.countdownSeconds) : info.nextChangeLabel}</span>
        </div>
      </div>
    </div>
  );
}
