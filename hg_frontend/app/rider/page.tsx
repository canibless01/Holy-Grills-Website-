'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { RefreshCw, Truck } from 'lucide-react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { RiderHeader } from '@/components/rider/RiderHeader';
import { RiderStatsCards } from '@/components/rider/RiderStatsCards';
import { RiderOrderCard } from '@/components/rider/RiderOrderCard';
import { DeliveryAttemptModal } from '@/components/rider/DeliveryAttemptModal';
import { RiderHistoryDialog } from '@/components/rider/RiderHistoryDialog';
import {
  toggleRiderAvailability,
  getMyBatch,
  markOrderPickedUp,
  markOrderDelivered,
  markOrderAttempted,
  getRiderStats,
  getRiderEarnings,
  getRiderHistory,
  type RiderBatch,
  type RiderStats,
  type RiderEarnings,
  type RiderBatchOrder,
} from '@/services/api/rider.service';
import { playUiTone } from '@/utils/sound';

export default function RiderPage() {
  const queryClient = useQueryClient();
  const [isOnline, setIsOnline] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [attemptModalState, setAttemptModalState] = useState<{ open: boolean; orderId: string; orderNumber: string }>({
    open: false,
    orderId: '',
    orderNumber: '',
  });

  const previousBatchIdRef = useRef<string>('');

  // Fetch rider stats
  const { data: stats = null } = useQuery<RiderStats>({
    queryKey: ['rider-stats'],
    queryFn: getRiderStats,
  });

  // Fetch rider earnings
  const { data: earnings = null } = useQuery<RiderEarnings>({
    queryKey: ['rider-earnings'],
    queryFn: () => getRiderEarnings('today'),
  });

  // Fetch current batch
  const { data: batch = null, refetch: refetchBatch, isFetching } = useQuery<RiderBatch | null>({
    queryKey: ['rider-batch'],
    queryFn: () => getMyBatch(),
    refetchInterval: 10000,
  });

  // Fetch history
  const { data: history = [] } = useQuery<RiderBatchOrder[]>({
    queryKey: ['rider-history'],
    queryFn: () => getRiderHistory(20, 0),
    enabled: isHistoryOpen,
  });

  // Toggle availability
  const toggleAvailabilityMutation = useMutation({
    mutationFn: (nextAvailable: boolean) => toggleRiderAvailability(nextAvailable),
    onSuccess: (data) => {
      setIsOnline(data.is_available);
      toast.success(`Duty status updated: ${data.is_available ? 'Online' : 'Offline'}`);
    },
    onError: () => {
      toast.error('Failed to update duty status.');
    },
  });

  // Pickup order
  const pickupMutation = useMutation({
    mutationFn: (orderId: string) => markOrderPickedUp(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rider-batch'] });
    },
  });

  // Deliver order
  const deliverMutation = useMutation({
    mutationFn: (orderId: string) => markOrderDelivered(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rider-batch'] });
      queryClient.invalidateQueries({ queryKey: ['rider-stats'] });
      queryClient.invalidateQueries({ queryKey: ['rider-earnings'] });
    },
  });

  // Attempt order
  const attemptMutation = useMutation({
    mutationFn: ({ orderId, notes }: { orderId: string; notes: string }) =>
      markOrderAttempted(orderId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rider-batch'] });
      toast.info('Delivery attempt recorded.');
    },
    onError: () => {
      toast.error('Failed to record delivery attempt.');
    },
  });

  // Alert on new batch assignment
  useEffect(() => {
    if (batch && batch.id) {
      if (previousBatchIdRef.current && previousBatchIdRef.current !== batch.id) {
        playUiTone('dispatch');
        toast.info(`New dispatch batch #${batch.id} assigned!`);
      }
      previousBatchIdRef.current = batch.id;
    }
  }, [batch]);

  return (
    <AdminGuard allowKitchen>
      <main className="min-h-screen bg-background px-4 py-6 md:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <RiderHeader
            isAvailable={isOnline}
            onToggleAvailability={async (nextState) => {
              await toggleAvailabilityMutation.mutateAsync(nextState);
            }}
            onOpenHistory={() => setIsHistoryOpen(true)}
            isLoading={toggleAvailabilityMutation.isPending}
          />

          {/* Stats & Earnings */}
          <RiderStatsCards stats={stats} earnings={earnings} />

          {/* Batch Header & Sync Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2">
              <Truck size={18} className="text-primary" />
              <span className="font-display font-bold text-sm text-foreground">
                Active Batch Stops ({batch?.orders.length || 0})
              </span>
              {batch?.zone && (
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  Zone: {batch.zone}
                </span>
              )}
            </div>

            <button
              onClick={() => refetchBatch()}
              disabled={isFetching}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium self-start sm:self-auto"
            >
              <RefreshCw size={13} className={isFetching ? 'animate-spin text-primary' : ''} />
              <span>Refresh Batch</span>
            </button>
          </div>

          {/* Active Batch Orders Grid */}
          {!batch || batch.orders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground bg-card">
              No active delivery batch currently assigned. Toggling online status will trigger dispatch assignment.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {batch.orders.map((order) => (
                <RiderOrderCard
                  key={order.id}
                  order={order}
                  onPickup={async (id) => {
                    await pickupMutation.mutateAsync(id);
                  }}
                  onDeliver={async (id) => {
                    await deliverMutation.mutateAsync(id);
                  }}
                  onOpenAttemptModal={(id, num) => {
                    setAttemptModalState({ open: true, orderId: id, orderNumber: num });
                  }}
                />
              ))}
            </div>
          )}

          {/* Delivery Attempt Modal */}
          <DeliveryAttemptModal
            open={attemptModalState.open}
            onOpenChange={(open) => setAttemptModalState((prev) => ({ ...prev, open }))}
            orderId={attemptModalState.orderId}
            orderNumber={attemptModalState.orderNumber}
            onSubmitAttempt={async (id, notes) => {
              await attemptMutation.mutateAsync({ orderId: id, notes });
            }}
          />

          {/* History Dialog */}
          <RiderHistoryDialog
            open={isHistoryOpen}
            onOpenChange={setIsHistoryOpen}
            history={history}
          />
        </div>
      </main>
    </AdminGuard>
  );
}
