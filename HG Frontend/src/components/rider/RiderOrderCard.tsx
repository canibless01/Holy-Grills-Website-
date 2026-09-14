'use client';

import { useState } from 'react';
import { Phone, MapPin, Navigation, Banknote, CheckCircle, AlertTriangle, PackageCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { RiderBatchOrder } from '@/services/api/rider.service';
import { getCallLink } from '@/services/api/rider.service';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

interface RiderOrderCardProps {
  order: RiderBatchOrder;
  onPickup: (orderId: string) => Promise<void>;
  onDeliver: (orderId: string) => Promise<void>;
  onOpenAttemptModal: (orderId: string, orderNumber: string) => void;
}

export function RiderOrderCard({
  order,
  onPickup,
  onDeliver,
  onOpenAttemptModal,
}: RiderOrderCardProps) {
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const isCashOnDelivery = order.payment_method === 'cash' || order.payment_status === 'pending';

  const handleCallCustomer = async () => {
    try {
      const link = await getCallLink(order.id);
      window.location.href = link.call_url || `tel:${link.phone}`;
    } catch {
      window.location.href = `tel:${order.customer_phone}`;
    }
  };

  const handleOpenGoogleMaps = () => {
    const destination = encodeURIComponent(
      `${order.delivery_location}, ${order.gate_name || ''}, ${order.hostel_name || ''}`,
    );
    window.open(`https://www.google.com/maps/search/?api=1&query=${destination}`, '_blank');
  };

  const handleConfirmPickup = async () => {
    setIsProcessing(true);
    try {
      await onPickup(order.id);
      toast.success(`Order ${order.order_number} picked up from kitchen!`);
    } catch {
      toast.error('Failed to update delivery status.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmDeliver = async () => {
    setShowCompleteConfirm(false);
    setIsProcessing(true);
    try {
      await onDeliver(order.id);
      toast.success('Delivery completed successfully! HP awarded to customer.');
    } catch {
      toast.error('Failed to complete delivery.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="relative flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
        {/* Header: Sequence Badge, Order # & Payment Banner */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs">
                #{order.sequence || 1}
              </span>
              <span className="font-display font-bold text-base text-foreground">
                {order.order_number}
              </span>
            </div>

            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${
                order.status === 'out_for_delivery'
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  : order.status === 'delivered'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
              }`}
            >
              {order.status.replaceAll('_', ' ')}
            </span>
          </div>

          {/* COD Highlight Banner */}
          {isCashOnDelivery && (
            <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-800 dark:text-amber-300">
              <Banknote size={16} className="shrink-0 text-amber-600" />
              <span>
                CASH TO COLLECT ON DELIVERY: <strong className="font-bold">{formatPrice(order.total_amount)}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Customer Info & Address */}
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center justify-between font-medium text-foreground">
            <span className="font-bold text-sm text-foreground">{order.customer_name}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCallCustomer}
              className="h-7 px-2.5 rounded-full text-xs gap-1 border-primary/30 text-primary hover:bg-primary/10"
            >
              <Phone size={13} />
              <span>Call Customer</span>
            </Button>
          </div>

          <div className="flex items-start gap-1.5 rounded-xl bg-muted/40 p-2.5">
            <MapPin size={15} className="shrink-0 text-primary mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold text-foreground">{order.delivery_location}</p>
              {order.hostel_name && (
                <p>Hostel: {order.hostel_name} {order.room_number ? `(Room ${order.room_number})` : ''}</p>
              )}
              {order.gate_name && <p className="text-[11px] text-muted-foreground">Nearest Gate: {order.gate_name}</p>}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenGoogleMaps}
            className="w-full rounded-xl h-8 text-xs gap-1.5 text-foreground hover:bg-muted"
          >
            <Navigation size={13} className="text-blue-500" />
            <span>Open in Google Maps Navigation</span>
          </Button>
        </div>

        {/* Order Items Summary */}
        <div className="rounded-xl border border-border/80 bg-background/60 p-3 text-xs space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Items ({order.items.length})
          </p>
          <div className="space-y-0.5">
            {order.items.map((it) => (
              <p key={it.id} className="text-foreground">
                <span className="font-bold text-primary">{it.quantity}×</span> {it.name}
              </p>
            ))}
          </div>
        </div>

        {/* Delivery Actions */}
        <div className="pt-2 border-t border-border/60 flex flex-col gap-2">
          {order.status !== 'out_for_delivery' && order.status !== 'delivered' ? (
            <Button
              onClick={handleConfirmPickup}
              disabled={isProcessing}
              className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-xs h-9 gap-1.5"
            >
              <PackageCheck size={15} />
              <span>Confirm Pickup from Kitchen</span>
            </Button>
          ) : order.status === 'out_for_delivery' ? (
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenAttemptModal(order.id, order.order_number)}
                disabled={isProcessing}
                className="rounded-xl text-xs h-9 gap-1 text-amber-600 border-amber-300 hover:bg-amber-500/10"
              >
                <AlertTriangle size={14} />
                <span>Attempted</span>
              </Button>

              <Button
                onClick={() => setShowCompleteConfirm(true)}
                disabled={isProcessing}
                className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-semibold text-xs h-9 gap-1"
              >
                <CheckCircle size={14} />
                <span>Complete Delivery</span>
              </Button>
            </div>
          ) : (
            <div className="text-center text-xs text-emerald-600 dark:text-emerald-400 font-bold py-1">
              ✓ Delivery Completed
            </div>
          )}
        </div>
      </div>

      {/* Complete Delivery Confirmation Dialog */}
      <AlertDialog open={showCompleteConfirm} onOpenChange={setShowCompleteConfirm}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delivery Completion</AlertDialogTitle>
            <AlertDialogDescription>
              Confirm customer received order and paid {formatPrice(order.total_amount)}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeliver}
              className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Confirm & Award HP
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
