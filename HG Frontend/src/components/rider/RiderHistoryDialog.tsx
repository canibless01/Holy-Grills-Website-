'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import type { RiderBatchOrder } from '@/services/api/rider.service';
import { formatPrice } from '@/lib/utils';
import { CheckCircle2, MapPin } from 'lucide-react';

interface RiderHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  history: RiderBatchOrder[];
}

export function RiderHistoryDialog({
  open,
  onOpenChange,
  history,
}: RiderHistoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl rounded-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Completed Delivery History</DialogTitle>
          <DialogDescription>
            Recent completed dispatch deliveries and collected earnings.
          </DialogDescription>
        </DialogHeader>

        {history.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No completed delivery history records found.
          </div>
        ) : (
          <div className="space-y-3 py-2">
            {history.map((order) => (
              <div
                key={order.id}
                className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3.5 text-xs shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-emerald-500" />
                    <span className="font-bold text-foreground">{order.order_number}</span>
                    <span className="text-muted-foreground">• {order.customer_name}</span>
                  </div>
                  <span className="font-bold text-primary">{formatPrice(order.total_amount)}</span>
                </div>

                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin size={13} className="shrink-0 text-primary" />
                  <span className="truncate">{order.delivery_location}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
