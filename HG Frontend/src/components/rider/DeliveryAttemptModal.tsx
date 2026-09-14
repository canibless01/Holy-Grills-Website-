'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface DeliveryAttemptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  orderNumber: string;
  onSubmitAttempt: (orderId: string, notes: string) => Promise<void>;
}

export function DeliveryAttemptModal({
  open,
  onOpenChange,
  orderId,
  orderNumber,
  onSubmitAttempt,
}: DeliveryAttemptModalProps) {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmitAttempt(orderId, notes);
      setNotes('');
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>Mark Delivery Attempted</DialogTitle>
          <DialogDescription>
            Record why delivery could not be completed for order {orderNumber}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <label className="text-xs font-semibold text-foreground">
            Attempt Notes / Reason
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Customer unreachable after 3 calls, hostel gate locked"
            className="rounded-xl min-h-[90px] text-xs"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-xl bg-amber-600 text-white hover:bg-amber-700"
          >
            {isSubmitting ? 'Recording...' : 'Submit Attempt'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
