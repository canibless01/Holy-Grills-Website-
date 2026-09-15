'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { KitchenHeader } from '@/components/kitchen/KitchenHeader';
import { KitchenOrderCard } from '@/components/kitchen/KitchenOrderCard';
import { KitchenMetricsBanner } from '@/components/kitchen/KitchenMetricsBanner';
import { KitchenSettingsModal } from '@/components/kitchen/KitchenSettingsModal';
import { BatchSummaryCard } from '@/components/kitchen/BatchSummaryCard';
import {
  getKitchenQueue,
  getScheduledOrders,
  getKitchenMetrics,
  getKitchenSettings,
  updateKitchenSettings,
  batchAdvance,
  getKitchenWindows,
  getBatchSummary,
  updateKitchenOrderStatus,
} from '@/services/api/kitchen.service';
import type { OrderStatus } from '@/types';

const TABS = [
  { id: 'queue', label: 'Live Queue' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'batch', label: 'Prep List' },
];

export default function KitchenPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('queue');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedWindowId, setSelectedWindowId] = useState<string>('win-1');

  // Queries
  const { data: queue = [] } = useQuery({
    queryKey: ['kitchen-queue'],
    queryFn: () => getKitchenQueue(),
    refetchInterval: 10000,
  });

  const { data: scheduled = [] } = useQuery({
    queryKey: ['kitchen-scheduled'],
    queryFn: () => getScheduledOrders(),
  });

  const { data: metrics } = useQuery({
    queryKey: ['kitchen-metrics'],
    queryFn: () => getKitchenMetrics(),
  });

  const { data: settings } = useQuery({
    queryKey: ['kitchen-settings'],
    queryFn: () => getKitchenSettings(),
  });

  const { data: windows = [] } = useQuery({
    queryKey: ['kitchen-windows'],
    queryFn: () => getKitchenWindows(),
  });

  const { data: batchSummary = null } = useQuery({
    queryKey: ['batch-summary', selectedWindowId],
    queryFn: () => getBatchSummary(selectedWindowId),
  });

  // Mutations
  const updateSettingsMutation = useMutation({
    mutationFn: (newSettings: Record<string, string>) => updateKitchenSettings(newSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchen-settings'] });
      toast.success('Kitchen settings updated');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      updateKitchenOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchen-queue'] });
      queryClient.invalidateQueries({ queryKey: ['kitchen-metrics'] });
      toast.success('Order status updated');
    },
  });

  const isOpen = settings?.is_accepting_orders !== 'false' && settings?.is_closed_for_day !== 'true';

  return (
    <main className="flex-1 pb-12 pt-4 md:pt-24 container mx-auto max-w-5xl px-4 space-y-6">
      <KitchenHeader
        isOpen={isOpen}
        onToggleOpen={async (nextState) => {
          await updateSettingsMutation.mutateAsync({
            is_accepting_orders: nextState ? 'true' : 'false',
            is_closed_for_day: nextState ? 'false' : 'true',
          });
        }}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {metrics && (
        <KitchenMetricsBanner
          metrics={metrics}
        />
      )}

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

      {/* Live Queue Tab */}
      {tab === 'queue' && (
        <div className="space-y-4">
          {queue.length === 0 ? (
            <div className="text-center py-16 rounded-3xl border border-dashed border-border bg-card">
              <Package size={36} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-semibold text-foreground">Queue is empty — no active orders right now.</p>
            </div>
          ) : (
            queue.map((order) => (
              <KitchenOrderCard
                key={order.id}
                order={order}
                onUpdateStatus={async (status) => {
                  await updateStatusMutation.mutateAsync({ orderId: order.id, status: status as OrderStatus });
                }}
              />
            ))
          )}
        </div>
      )}

      {/* Scheduled Tab */}
      {tab === 'scheduled' && (
        <div className="space-y-4">
          {scheduled.length === 0 ? (
            <div className="text-center py-16 rounded-3xl border border-dashed border-border bg-card">
              <Calendar size={36} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-semibold text-foreground">No scheduled orders pending promotion.</p>
            </div>
          ) : (
            scheduled.map((order) => (
              <div key={order.id} className="rounded-2xl bg-card border border-border p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs font-mono font-bold text-primary">#{order.id.substring(0, 8).toUpperCase()}</div>
                  <div className="text-sm font-bold text-foreground mt-1">{order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}</div>
                </div>
                <button
                  onClick={() => updateStatusMutation.mutate({ orderId: order.id, status: 'preparing' as OrderStatus })}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs"
                >
                  Promote to Queue
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Prep List Tab */}
      {tab === 'batch' && (
        <div className="space-y-4">
          <BatchSummaryCard
            windows={windows}
            selectedWindowId={selectedWindowId}
            onSelectWindow={setSelectedWindowId}
            summary={batchSummary}
            onAdvanceBatch={async (batchId, fromStatus) => {
              await batchAdvance(batchId, fromStatus);
              queryClient.invalidateQueries({ queryKey: ['kitchen-queue'] });
              toast.success('Batch status advanced');
            }}
          />
        </div>
      )}

      {settings && (
        <KitchenSettingsModal
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          settings={settings}
          onSaveSettings={async (updated) => {
            await updateSettingsMutation.mutateAsync(updated);
            setSettingsOpen(false);
          }}
        />
      )}
    </main>
  );
}
