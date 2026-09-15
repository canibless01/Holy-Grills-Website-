'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bike } from 'lucide-react';
import { toast } from 'sonner';
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
  type RiderBatchOrder,
} from '@/services/api/rider.service';

const TABS = [
  { id: 'batch', label: 'Active Delivery Batch' },
  { id: 'earnings', label: 'Earnings Summary' },
];

export default function RiderPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('batch');
  const [attemptOrderInfo, setAttemptOrderInfo] = useState<{ id: string; number: string } | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [period] = useState('week');

  // Queries
  const { data: batch } = useQuery({
    queryKey: ['rider-batch'],
    queryFn: () => getMyBatch(),
    refetchInterval: 15000,
  });

  const { data: stats = null } = useQuery({
    queryKey: ['rider-stats'],
    queryFn: () => getRiderStats(),
  });

  const { data: earnings = null } = useQuery({
    queryKey: ['rider-earnings', period],
    queryFn: () => getRiderEarnings(period),
  });

  const { data: history = [] } = useQuery({
    queryKey: ['rider-history'],
    queryFn: () => getRiderHistory(),
  });

  // Availability Mutation
  const availabilityMutation = useMutation({
    mutationFn: ({ isAvailable, lat, lng }: { isAvailable: boolean; lat?: number; lng?: number }) =>
      toggleRiderAvailability(isAvailable, lat, lng),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['rider-stats'] });
      toast.success(res.is_available ? 'You are now online with active GPS' : 'You are now offline');
    },
    onError: () => {
      toast.error('Failed to change online status');
    },
  });

  // Pickup Mutation
  const pickupMutation = useMutation({
    mutationFn: markOrderPickedUp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rider-batch'] });
      toast.success('Order marked as Picked Up!');
    },
  });

  // Deliver Mutation
  const deliverMutation = useMutation({
    mutationFn: markOrderDelivered,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rider-batch'] });
      queryClient.invalidateQueries({ queryKey: ['rider-history'] });
      queryClient.invalidateQueries({ queryKey: ['rider-earnings'] });
      toast.success('Order delivered successfully!');
    },
  });

  // Attempt Mutation
  const attemptMutation = useMutation({
    mutationFn: ({ orderId, notes }: { orderId: string; notes: string }) =>
      markOrderAttempted(orderId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rider-batch'] });
      setAttemptOrderInfo(null);
      toast.success('Delivery attempt logged');
    },
  });

  const handleToggleOnline = async (nextState: boolean) => {
    if (nextState && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          availabilityMutation.mutate({
            isAvailable: true,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          availabilityMutation.mutate({ isAvailable: true });
        }
      );
    } else {
      availabilityMutation.mutate({ isAvailable: false });
    }
  };

  return (
    <main className="flex-1 pb-12 pt-4 md:pt-24 container mx-auto max-w-3xl px-4 space-y-6">
      <RiderHeader
        isAvailable={Boolean(stats?.active_hours_today)}
        onToggleAvailability={handleToggleOnline}
        onOpenHistory={() => setHistoryOpen(true)}
        isLoading={availabilityMutation.isPending}
      />

      <RiderStatsCards
        stats={stats}
        earnings={earnings}
      />

      {/* Navigation Tabs */}
      <div className="flex gap-1 p-1 rounded-full bg-secondary border border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2.5 rounded-full text-xs font-bold transition-all ${
              tab === t.id ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Active Batch Tab */}
      {tab === 'batch' && (
        <div className="space-y-4">
          {!batch || batch.orders.length === 0 ? (
            <div className="text-center py-16 rounded-3xl border border-dashed border-border bg-card space-y-2">
              <Bike size={40} className="text-muted-foreground mx-auto" />
              <p className="text-sm font-semibold text-foreground">No active delivery batch currently assigned.</p>
              <p className="text-xs text-muted-foreground">Stay online! New batches will be assigned to your route automatically.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-2xl bg-card border border-border p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">Batch #{batch.id.substring(0, 8).toUpperCase()}</span>
                  <h3 className="font-display font-bold text-base text-foreground mt-0.5">Zone: {batch.zone || 'Campus Core'}</h3>
                </div>
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-xs capitalize">
                  {batch.status}
                </span>
              </div>

              {batch.orders.map((order) => (
                <RiderOrderCard
                  key={order.id}
                  order={order}
                  onPickup={async (id) => { await pickupMutation.mutateAsync(id); }}
                  onDeliver={async (id) => { await deliverMutation.mutateAsync(id); }}
                  onOpenAttemptModal={(id, num) => setAttemptOrderInfo({ id, number: num })}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Earnings Summary Tab */}
      {tab === 'earnings' && earnings && (
        <div className="space-y-4">
          <div className="rounded-3xl bg-gradient-fire p-6 text-primary-foreground space-y-2 shadow-md">
            <span className="text-xs font-semibold uppercase tracking-wider opacity-80">Rider Total Earnings</span>
            <div className="font-display font-bold text-3xl">₦{earnings.total_earnings.toLocaleString()}</div>
            <div className="flex gap-4 text-xs opacity-90 pt-2 border-t border-white/20">
              <span>Base Pay: ₦{earnings.base_pay.toLocaleString()}</span>
              <span>Tips: ₦{earnings.tips.toLocaleString()}</span>
              <span>Deliveries: {earnings.deliveries_count}</span>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Attempt Modal */}
      {attemptOrderInfo && (
        <DeliveryAttemptModal
          orderId={attemptOrderInfo.id}
          orderNumber={attemptOrderInfo.number}
          open={Boolean(attemptOrderInfo)}
          onOpenChange={(open) => !open && setAttemptOrderInfo(null)}
          onSubmitAttempt={async (orderId, notes) => {
            await attemptMutation.mutateAsync({ orderId, notes });
          }}
        />
      )}

      {/* History Dialog */}
      <RiderHistoryDialog
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        history={history}
      />
    </main>
  );
}
