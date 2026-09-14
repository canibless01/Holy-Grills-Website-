'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Bell, RefreshCw } from 'lucide-react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { KitchenHeader } from '@/components/kitchen/KitchenHeader';
import { KitchenSettingsModal } from '@/components/kitchen/KitchenSettingsModal';
import { BatchSummaryCard } from '@/components/kitchen/BatchSummaryCard';
import { KitchenMetricsBanner } from '@/components/kitchen/KitchenMetricsBanner';
import { KitchenOrderCard } from '@/components/kitchen/KitchenOrderCard';
import {
  getKitchenQueue,
  getScheduledOrders,
  getKitchenWindows,
  getBatchSummary,
  getKitchenMetrics,
  getKitchenSettings,
  updateKitchenSettings,
  batchAdvance,
  updateKitchenOrderStatus,
  type KitchenDeliveryWindow,
  type KitchenBatchSummary,
  type KitchenMetrics,
} from '@/services/api/kitchen.service';
import { playAlertChime } from '@/utils/sound';
import type { Order, OrderStatus } from '@/types';

export default function KitchenPage() {
  const queryClient = useQueryClient();
  const [selectedWindowId, setSelectedWindowId] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const previousOrderIdsRef = useRef<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'live' | 'scheduled'>('live');

  // Fetch kitchen settings
  const { data: settings = {}, refetch: refetchSettings } = useQuery<Record<string, string>>({
    queryKey: ['kitchen-settings'],
    queryFn: getKitchenSettings,
  });

  const isKitchenOpen = settings.kitchen_open !== 'false';

  // Toggle kitchen open/closed
  const toggleOpenMutation = useMutation({
    mutationFn: async (nextOpen: boolean) => {
      const updated = await updateKitchenSettings({
        ...settings,
        kitchen_open: nextOpen ? 'true' : 'false',
      });
      return updated;
    },
    onSuccess: (_, nextOpen) => {
      queryClient.invalidateQueries({ queryKey: ['kitchen-settings'] });
      if (nextOpen) {
        toast.success('Kitchen is now OPEN for orders.');
      } else {
        toast.success('Kitchen is now CLOSED. Users cannot place new orders.');
      }
    },
    onError: () => {
      toast.error('Could not update kitchen open state.');
    },
  });

  // Save settings
  const saveSettingsMutation = useMutation({
    mutationFn: (newSettings: Record<string, string>) => updateKitchenSettings(newSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchen-settings'] });
      toast.success('Kitchen settings updated successfully.');
    },
    onError: () => {
      toast.error('Failed to update kitchen settings.');
    },
  });

  // Fetch windows
  const { data: windows = [] } = useQuery<KitchenDeliveryWindow[]>({
    queryKey: ['kitchen-windows'],
    queryFn: getKitchenWindows,
  });

  useEffect(() => {
    if (windows.length > 0 && !selectedWindowId) {
      setSelectedWindowId(windows[0].id);
    }
  }, [windows, selectedWindowId]);

  // Fetch batch summary
  const { data: batchSummary = null } = useQuery<KitchenBatchSummary | null>({
    queryKey: ['kitchen-batch-summary', selectedWindowId],
    queryFn: () => (selectedWindowId ? getBatchSummary(selectedWindowId) : Promise.resolve(null)),
    enabled: Boolean(selectedWindowId),
  });

  // Fetch metrics
  const { data: metrics = null } = useQuery<KitchenMetrics | null>({
    queryKey: ['kitchen-metrics', selectedWindowId],
    queryFn: () => getKitchenMetrics(selectedWindowId),
  });

  // Fetch live queue with auto polling
  const { data: liveQueue = [], refetch: refetchQueue, isFetching } = useQuery<Order[]>({
    queryKey: ['kitchen-queue', selectedWindowId],
    queryFn: () => getKitchenQueue(selectedWindowId),
    refetchInterval: 10000,
  });

  // Fetch scheduled orders
  const { data: scheduledOrders = [] } = useQuery<Order[]>({
    queryKey: ['kitchen-scheduled', selectedWindowId],
    queryFn: () => getScheduledOrders(selectedWindowId),
    refetchInterval: 15000,
  });

  // Check for new incoming orders and trigger audio chime
  useEffect(() => {
    if (liveQueue.length > 0) {
      const currentIds = new Set(liveQueue.map((o) => o.id));
      const previousIds = previousOrderIdsRef.current;

      if (previousIds.size > 0) {
        const hasNewOrder = liveQueue.some((o) => !previousIds.has(o.id));
        if (hasNewOrder) {
          playAlertChime();
          toast.info('New incoming order received in kitchen queue!');
        }
      }
      previousOrderIdsRef.current = currentIds;
    }
  }, [liveQueue]);

  // Update order status
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      updateKitchenOrderStatus(orderId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['kitchen-queue'] });
      queryClient.invalidateQueries({ queryKey: ['kitchen-metrics'] });
      if (variables.status === 'preparing') {
        toast.success('Order marked as Preparing');
      } else if (variables.status === 'ready') {
        toast.success('Order marked as Ready for Delivery!');
      } else {
        toast.success(`Order status updated to ${variables.status}`);
      }
    },
    onError: () => {
      toast.error('Failed to update order status.');
    },
  });

  // Advance batch
  const advanceBatchMutation = useMutation({
    mutationFn: ({ batchId, fromStatus }: { batchId: string; fromStatus?: string }) =>
      batchAdvance(batchId, fromStatus),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['kitchen-queue'] });
      queryClient.invalidateQueries({ queryKey: ['kitchen-batch-summary'] });
      toast.success(data.message || 'Batch advanced successfully!');
    },
    onError: () => {
      toast.error('Failed to advance batch orders.');
    },
  });

  const pendingOrders = liveQueue.filter((o) => ['placed', 'confirmed', 'received'].includes(o.status));
  const preparingOrders = liveQueue.filter((o) => o.status === 'preparing');
  const readyOrders = liveQueue.filter((o) => ['ready', 'out_for_delivery'].includes(o.status));

  return (
    <AdminGuard allowKitchen>
      <main className="min-h-screen bg-background px-4 py-6 md:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <KitchenHeader
            isOpen={isKitchenOpen}
            onToggleOpen={async (nextState) => {
              await toggleOpenMutation.mutateAsync(nextState);
            }}
            onOpenSettings={() => setIsSettingsOpen(true)}
            isLoading={toggleOpenMutation.isPending}
          />

          {/* Settings Modal */}
          <KitchenSettingsModal
            open={isSettingsOpen}
            onOpenChange={setIsSettingsOpen}
            settings={settings}
            onSaveSettings={async (newSettings) => {
              await saveSettingsMutation.mutateAsync(newSettings);
            }}
          />

          {/* Metrics Banner */}
          <KitchenMetricsBanner metrics={metrics} />

          {/* Batch Summary & Window Selector */}
          <BatchSummaryCard
            windows={windows}
            selectedWindowId={selectedWindowId}
            onSelectWindow={setSelectedWindowId}
            summary={batchSummary}
            onAdvanceBatch={async (batchId, fromStatus) => {
              await advanceBatchMutation.mutateAsync({ batchId, fromStatus });
            }}
            isLoading={advanceBatchMutation.isPending}
          />

          {/* Queue Tab & Sync Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('live')}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
                  activeTab === 'live'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                Live Kitchen Queue ({liveQueue.length})
              </button>
              <button
                onClick={() => setActiveTab('scheduled')}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
                  activeTab === 'scheduled'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                Scheduled Queue ({scheduledOrders.length})
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Bell size={14} className="text-primary animate-pulse" />
                <span>Auto-sync active (10s)</span>
              </div>
              <button
                onClick={() => {
                  refetchQueue();
                  refetchSettings();
                }}
                disabled={isFetching}
                className="flex items-center gap-1 hover:text-foreground font-medium"
              >
                <RefreshCw size={13} className={isFetching ? 'animate-spin text-primary' : ''} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Kanban Board Columns */}
          {activeTab === 'live' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Pending / New Column */}
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-amber-700 dark:text-amber-400">
                  <span className="font-display font-bold text-sm">New / Pending</span>
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-bold">
                    {pendingOrders.length}
                  </span>
                </div>

                {pendingOrders.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
                    No new orders pending
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingOrders.map((order) => (
                      <KitchenOrderCard
                        key={order.id}
                        order={order}
                        onUpdateStatus={async (id, status) => {
                          await updateStatusMutation.mutateAsync({ orderId: id, status });
                        }}
                        isNew={true}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* In Preparation Column */}
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-2.5 text-blue-700 dark:text-blue-400">
                  <span className="font-display font-bold text-sm">In Preparation</span>
                  <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-bold">
                    {preparingOrders.length}
                  </span>
                </div>

                {preparingOrders.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
                    No orders currently cooking
                  </div>
                ) : (
                  <div className="space-y-4">
                    {preparingOrders.map((order) => (
                      <KitchenOrderCard
                        key={order.id}
                        order={order}
                        onUpdateStatus={async (id, status) => {
                          await updateStatusMutation.mutateAsync({ orderId: id, status });
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Ready for Pickup / Delivery Column */}
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-emerald-700 dark:text-emerald-400">
                  <span className="font-display font-bold text-sm">Ready for Pickup</span>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-bold">
                    {readyOrders.length}
                  </span>
                </div>

                {readyOrders.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
                    No orders ready for pickup
                  </div>
                ) : (
                  <div className="space-y-4">
                    {readyOrders.map((order) => (
                      <KitchenOrderCard
                        key={order.id}
                        order={order}
                        onUpdateStatus={async (id, status) => {
                          await updateStatusMutation.mutateAsync({ orderId: id, status });
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Scheduled Queue View */
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="font-display font-bold text-lg text-foreground">Scheduled Future Window Orders</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  These orders will automatically promote to the live prep queue when their target delivery window starts.
                </p>

                {scheduledOrders.length === 0 ? (
                  <div className="mt-6 rounded-2xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
                    No scheduled orders pending promotion.
                  </div>
                ) : (
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {scheduledOrders.map((order) => (
                      <KitchenOrderCard
                        key={order.id}
                        order={order}
                        onUpdateStatus={async (id, status) => {
                          await updateStatusMutation.mutateAsync({ orderId: id, status });
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </AdminGuard>
  );
}
