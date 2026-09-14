'use client';

import { useState } from 'react';
import { Clock3 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useDeliveryWindow } from '@/hooks/useDeliveryWindow';
import { formatCountdown } from '@/utils/deliveryWindow';

export function StoreClosedDialog() {
  const info = useDeliveryWindow();
  const [dismissed, setDismissed] = useState(false);
  const open = info.status === 'closed' && !dismissed;

  return (
    <Dialog open={open} onOpenChange={(next) => setDismissed(!next)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl">
            <Clock3 size={18} className="text-primary" /> Kitchen is currently closed
          </DialogTitle>
          <DialogDescription>
            {info.detail}. We&apos;ll be back in {formatCountdown(info.countdownSeconds)}.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-2xl bg-secondary/70 p-4 text-sm text-muted-foreground">
          Plan ahead with saved items or schedule your next order once the window reopens.
        </div>
      </DialogContent>
    </Dialog>
  );
}
