'use client';

import { useState, useEffect } from 'react';
import { Clock, MapPin, Phone, CheckCircle2, Flame, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Order, OrderStatus } from '@/types';
import { formatPrice } from '@/lib/utils';

interface KitchenOrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  isNew?: boolean;
}

export function KitchenOrderCard({
  order,
  onUpdateStatus,
  isNew = false,
}: KitchenOrderCardProps) {
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const calculateElapsed = () => {
      const created = new Date(order.createdAt).getTime();
      const now = Date.now();
      const diffMins = Math.max(0, Math.floor((now - created) / (1000 * 60)));
      setElapsedMinutes(diffMins);
    };

    calculateElapsed();
    const interval = setInterval(calculateElapsed, 10000);
    return () => clearInterval(interval);
  }, [order.createdAt]);

  const handleAction = async (nextStatus: OrderStatus) => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(order.id, nextStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const isDelayed = elapsedMinutes >= 20;

  return (
    <div
      className={`relative flex flex-col justify-between rounded-2xl border bg-card p-5 transition-all shadow-sm ${
        isNew
          ? 'animate-pulse border-rose-500 ring-2 ring-rose-500/40 shadow-rose-500/20'
          : isDelayed
            ? 'border-rose-300 dark:border-rose-900 bg-rose-500/5'
            : 'border-border'
      }`}
    >
      <div className="space-y-3">
        {/* Header: Order ID & Timer */}
        <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
          <div>
            <span className="font-display text-base font-bold text-foreground">
              {order.id.startsWith('order-') ? order.id : `#${order.id.slice(0, 8).toUpperCase()}`}
            </span>
            <span className="ml-2 rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
              {order.status.replaceAll('_', ' ')}
            </span>
          </div>

          <div
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
              isDelayed
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 animate-pulse'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <Clock size={12} />
            <span>{elapsedMinutes}m elapsed</span>
          </div>
        </div>

        {/* Customer & Location */}
        <div className="space-y-1.5 text-xs text-muted-foreground">
          {order.address.phone && (
            <div className="flex items-center gap-1.5 text-foreground font-medium">
              <Phone size={13} className="text-primary shrink-0" />
              <a href={`tel:${order.address.phone}`} className="hover:underline">
                {order.address.phone}
              </a>
            </div>
          )}

          <div className="flex items-start gap-1.5">
            <MapPin size={13} className="text-primary shrink-0 mt-0.5" />
            <span className="line-clamp-2">
              {order.address.streetAddress}
              {order.address.landmark ? ` (${order.address.landmark})` : ''}
            </span>
          </div>
        </div>

        {/* Order Items */}
        <div className="rounded-xl border border-border/80 bg-background/60 p-3 space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Items ({order.items.length})
          </p>
          <div className="space-y-1 text-xs divide-y divide-border/40">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between pt-1">
                <span className="font-medium text-foreground">
                  <span className="font-bold text-primary mr-1.5">{item.quantity}×</span>
                  {item.name}
                </span>
                <span className="text-muted-foreground">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-2 border-t border-border/60">
        {order.status === 'placed' || order.status === 'confirmed' ? (
          <Button
            onClick={() => handleAction('preparing')}
            disabled={isUpdating}
            className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-xs h-9 gap-1.5"
          >
            <Flame size={14} />
            <span>Accept & Start Cooking</span>
          </Button>
        ) : order.status === 'preparing' ? (
          <Button
            onClick={() => handleAction('ready')}
            disabled={isUpdating}
            className="w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-semibold text-xs h-9 gap-1.5"
          >
            <CheckCircle2 size={14} />
            <span>Mark as Ready</span>
          </Button>
        ) : (
          <div className="text-center text-xs text-muted-foreground py-1 font-medium">
            Order in delivery status ({order.status.replaceAll('_', ' ')})
          </div>
        )}
      </div>
    </div>
  );
}
