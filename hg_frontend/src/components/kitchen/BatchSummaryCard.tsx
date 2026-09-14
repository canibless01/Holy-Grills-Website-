'use client';

import { useState } from 'react';
import { Layers, ArrowRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { KitchenDeliveryWindow, KitchenBatchSummary } from '@/services/api/kitchen.service';

interface BatchSummaryCardProps {
  windows: KitchenDeliveryWindow[];
  selectedWindowId: string;
  onSelectWindow: (id: string) => void;
  summary: KitchenBatchSummary | null;
  onAdvanceBatch: (batchId: string, fromStatus?: string) => Promise<void>;
  isLoading?: boolean;
}

export function BatchSummaryCard({
  windows,
  selectedWindowId,
  onSelectWindow,
  summary,
  onAdvanceBatch,
  isLoading = false,
}: BatchSummaryCardProps) {
  const [isAdvancing, setIsAdvancing] = useState(false);

  const handleAdvance = async () => {
    const batchId = summary?.batch_id || selectedWindowId;
    if (!batchId) return;
    setIsAdvancing(true);
    try {
      await onAdvanceBatch(batchId, 'preparing');
    } finally {
      setIsAdvancing(false);
    }
  };

  return (
    <div className="rounded-[2rem] border border-border bg-card p-5 shadow-sm space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <Layers size={18} className="text-primary" />
          <span>Batch & Delivery Window Queue</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {windows.map((win) => (
            <button
              key={win.id}
              onClick={() => onSelectWindow(win.id)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                selectedWindowId === win.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Clock size={12} />
              <span>{win.name || win.label}</span>
            </button>
          ))}
        </div>
      </div>

      {summary && summary.items.length > 0 ? (
        <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Aggregated Items ({summary.total_orders} Orders in Window)
            </span>
            <Button
              size="sm"
              onClick={handleAdvance}
              disabled={isAdvancing || isLoading}
              className="rounded-full text-xs h-8 px-3 gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <span>Advance Entire Batch</span>
              <ArrowRight size={14} />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {summary.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-border/80 bg-background px-3 py-2 text-xs"
              >
                <span className="font-medium text-foreground truncate">{item.name}</span>
                <span className="ml-2 rounded-md bg-primary/10 px-1.5 py-0.5 font-bold text-primary">
                  ×{item.quantity}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-xs text-muted-foreground py-2 text-center">
          Select a delivery window to view aggregated prep batch quantities.
        </div>
      )}
    </div>
  );
}
