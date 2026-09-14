'use client';

import { Truck, Power, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

interface RiderHeaderProps {
  isAvailable: boolean;
  onToggleAvailability: (nextState: boolean) => Promise<void>;
  onOpenHistory: () => void;
  isLoading?: boolean;
}

export function RiderHeader({
  isAvailable,
  onToggleAvailability,
  onOpenHistory,
  isLoading = false,
}: RiderHeaderProps) {
  return (
    <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Truck size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Logistics & Dispatch
              </span>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  isAvailable
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                {isAvailable ? '● Duty Active (Online)' : '○ Duty Inactive (Offline)'}
              </span>
            </div>
            <h1 className="mt-1 font-display text-2xl font-bold text-foreground sm:text-3xl">
              Rider Operations
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2">
            <Power size={16} className={isAvailable ? 'text-emerald-500' : 'text-muted-foreground'} />
            <span className="text-xs font-medium text-foreground">
              {isAvailable ? 'Online' : 'Offline'}
            </span>
            <Switch
              checked={isAvailable}
              onCheckedChange={(checked) => onToggleAvailability(checked)}
              disabled={isLoading}
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onOpenHistory}
            className="rounded-full gap-1.5 text-xs font-semibold"
          >
            <History size={15} />
            <span>Delivery History</span>
          </Button>
        </div>
      </div>
    </section>
  );
}
