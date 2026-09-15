import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Calendar, Package, Zap, Check } from 'lucide-react';
import { liveApi as mockApi } from '@/lib/liveApi';
import { isAuthenticated } from '@/lib/apiClient';
import { formatDateTime, ORDER_STATUS_LABELS } from '@/lib/hgUtils';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toast } from '@/components/ui/use-toast';
import KitchenHeader from '@/components/kitchen/KitchenHeader';
import KitchenOrderCard from '@/components/kitchen/KitchenOrderCard';
import KitchenSettings from '@/components/kitchen/KitchenSettings';

const TABS = [
  { id: 'queue', label: 'Live Queue' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'batch', label: 'Prep List' },
  { id: 'settings', label: 'Settings' },
];

export default function Kitchen() {
  const [tab, setTab] = useState('queue');
  const [queue, setQueue] = useState([]);
  const [scheduled, setScheduled] = useState(null);
  const [windows, setWindows] = useState([]);
  const [selectedWindow, setSelectedWindow] = useState(null);
  const [batchSummary, setBatchSummary] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [settings, setSettings] = useState(null);
  const [capacity, setCapacity] = useState(null);
  const [windowStatus, setWindowStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [batchBusy, setBatchBusy] = useState(false);
  const [batchResult, setBatchResult] = useState(null);
  const [authed, setAuthed] = useState(isAuthenticated());

  const refreshQueue = async () => {
    try {
      const [q, m] = await Promise.all([mockApi.kitchen.getQueue(), mockApi.kitchen.getMetrics()]);
      setQueue(q); setMetrics(m);
    } catch (e) { /* ignore poll errors */ }
  };

  useEffect(() => {
    if (!authed) { setLoading(false); return; }
    let alive = true;
    const init = async () => {
      try {
        const [q, s, w, m, cap, stg, status] = await Promise.all([
          mockApi.kitchen.getQueue(),
          mockApi.kitchen.getScheduled(),
          mockApi.kitchen.getWindows(),
          mockApi.kitchen.getMetrics(),
          mockApi.menu.getKitchenCapacity(),
          mockApi.kitchen.getSettings(),
          mockApi.orders.getDeliveryWindowStatus(),
        ]);
        if (!alive) return;
        setQueue(q); setScheduled(s); setWindows(w); setMetrics(m); setCapacity(cap); setSettings(stg); setWindowStatus(status);
        const firstWin = w.find(x => x.status === 'open')?.id || w[0]?.id;
        setSelectedWindow(firstWin);
        if (firstWin) {
          const bs = await mockApi.kitchen.getBatchSummary(firstWin);
          if (alive) setBatchSummary(bs);
        }
      } catch (e) { console.error(e); }
      if (alive) setLoading(false);
    };
    init();
    return () => { alive = false; };
  }, [authed]);

  // Poll queue + metrics every 10s (spec §9) so new orders surface quickly.
  useEffect(() => {
    if (!authed) return;
    const interval = setInterval(refreshQueue, 10000);
    return () => clearInterval(interval);
  }, [authed]);

  const selectWindow = async (winId) => {
    setSelectedWindow(winId);
    try {
      const bs = await mockApi.kitchen.getBatchSummary(winId);
      setBatchSummary(bs);
    } catch (e) { console.error(e); }
  };

  const handleStatusUpdate = async (orderId, status) => {
    setActionLoading(orderId);
    try {
      await mockApi.orders.updateStatus(orderId, { status });
      toast({ title: `Marked ${ORDER_STATUS_LABELS[status]}` });
      await refreshQueue();
    } catch (e) { toast({ title: 'Update failed', description: e.message, variant: 'destructive' }); }
    setActionLoading(null);
  };

  // Batch advance walks each order to its NEXT valid status (Spec §2.5). The
  // backend takes /kitchen/batch/<batch_id>/advance with { from_status, notes }.
  // We map the selected window's batch_id (falling back to the window id) and
  // send from_status to scope the advance (e.g. preparing→ready); omit it to
  // advance every order one step.
  const batchIdFor = (winId) => (windows.find((w) => w.id === winId)?.batch_id) || winId;
  const handleBatchAdvance = async (winId, body, label) => {
    setBatchBusy(true);
    try {
      const res = await mockApi.kitchen.batchAdvanceStatus(batchIdFor(winId), body);
      const advanced = res?.advanced_count ?? res?.advanced?.length ?? 0;
      const skipped = res?.skipped_count ?? 0;
      const skippedReasons = {};
      (res?.skipped || []).forEach((o) => {
        const r = o.reason || (o.from_status ? `past ${o.from_status}` : 'skipped');
        skippedReasons[r] = (skippedReasons[r] || 0) + 1;
      });
      setBatchResult({ advanced, skipped, skippedReasons, label: label || 'Batch advanced' });
      toast({ title: `${label || 'Advanced'} — ${advanced} moved`, description: skipped ? `${skipped} skipped` : undefined });
      await refreshQueue();
    } catch (e) { toast({ title: 'Batch update failed', description: e.message, variant: 'destructive' }); }
    setBatchBusy(false);
  };

  if (!authed) return <Navigate to="/login" state={{ from: '/kitchen' }} replace />;
  if (loading) return <LoadingSpinner label="Loading kitchen..." />;

  const accepting = settings?.is_accepting_orders !== false && !settings?.is_closed_for_day;
  const open = !!windowStatus?.is_open;

  return (
    <div className="min-h-screen bg-background">
      <KitchenHeader open={open} accepting={accepting} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 space-y-5 animate-fade-in">
        {/* Capacity + metrics summary */}
        {capacity && (
          <div className="rounded-2xl bg-white border border-cocoa-100 p-3.5 shadow-selected-soft flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-flame-600" />
              <span className="text-sm font-bold text-cocoa-800">Today's Capacity</span>
            </div>
            <div className="text-xs text-cocoa-500">
              <span className="font-bold text-cocoa-800">{capacity.orders_today ?? 0}</span> / {capacity.daily_order_capacity ?? 0} orders
              <span className={`ml-2 px-2 py-0.5 rounded-md text-[10px] font-bold ${(capacity.is_at_capacity ?? (capacity.remaining != null && capacity.remaining <= 0)) ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                {(capacity.is_at_capacity ?? (capacity.remaining != null && capacity.remaining <= 0)) ? 'AT CAPACITY' : `${Math.max(0, (capacity.daily_order_capacity ?? 0) - (capacity.orders_today ?? 0))} LEFT`}
              </span>
            </div>
          </div>
        )}

        {metrics && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <MetricCard value={metrics?.total_orders ?? 0} label="Total Today" color="text-cocoa-800" />
            <MetricCard value={metrics?.orders_by_status?.preparing || 0} label="Preparing" color="text-blue-500" />
            <MetricCard value={metrics?.orders_by_status?.ready || 0} label="Ready" color="text-emerald-500" />
            <MetricCard value={`${metrics?.avg_prep_time_minutes ?? '—'}m`} label="Avg Prep" color="text-flame-600" />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-full bg-cocoa-100 sticky top-14 z-20">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 py-2 rounded-full text-xs font-bold transition-all ${tab === t.id ? 'bg-white text-flame-600 shadow-sm' : 'text-cocoa-500'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Live queue */}
        {tab === 'queue' && (
          <div className="space-y-3">
            {queue.map(order => (
              <KitchenOrderCard key={order.id} order={order} onStatusUpdate={handleStatusUpdate} actionLoading={actionLoading} />
            ))}
            {queue.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-9 h-9 text-cocoa-200 mx-auto mb-2" />
                <p className="text-sm text-cocoa-400">Queue is empty — no active orders.</p>
              </div>
            )}
          </div>
        )}

        {/* Scheduled */}
        {tab === 'scheduled' && scheduled && (
          <div className="space-y-3">
            <div className="rounded-2xl bg-cream-100 border border-cocoa-200 p-3 text-xs text-cocoa-700">
              <Calendar className="w-4 h-4 inline mr-1 text-flame-600" />
              {scheduled.count} scheduled order(s) awaiting promotion to the queue
            </div>
            {scheduled.scheduled_orders.map(order => (
              <div key={order.id} className="rounded-2xl bg-white border border-cocoa-100 p-3.5 shadow-selected-soft">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-cocoa-600 font-mono">#{order.id.toUpperCase()}</span>
                  <span className="text-xs text-flame-600 font-semibold">{formatDateTime(order.scheduled_for)}</span>
                </div>
                <div className="space-y-1 mb-2">
                  {(order.order_items || []).map((item, i) => (
                    <div key={i} className="text-sm text-cocoa-700"><span className="font-bold">{item.quantity}×</span> {item.name_snapshot}</div>
                  ))}
                </div>
                <div className="text-xs text-cocoa-400 mb-2.5">Window: {order.delivery_windows?.label || '—'}</div>
                <button
                  onClick={() => handleStatusUpdate(order.id, 'preparing')}
                  disabled={actionLoading === order.id}
                  className="w-full py-2.5 rounded-xl bg-flame-600 text-white text-xs font-bold disabled:opacity-50 active:scale-[0.98] transition-transform"
                >
                  {actionLoading === order.id ? 'Promoting...' : 'Promote to Preparing'}
                </button>
              </div>
            ))}
            {scheduled.scheduled_orders.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-9 h-9 text-cocoa-200 mx-auto mb-2" />
                <p className="text-sm text-cocoa-400">No scheduled orders.</p>
              </div>
            )}
          </div>
        )}

        {/* Prep list */}
        {tab === 'batch' && (
          <div className="space-y-3">
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
              {windows.map(w => (
                <button
                  key={w.id}
                  onClick={() => selectWindow(w.id)}
                  className={`shrink-0 px-3.5 py-2.5 rounded-2xl border text-left transition-all ${selectedWindow === w.id ? 'bg-flame-600 border-flame-600 text-white' : 'bg-white border-cocoa-100 text-cocoa-600'}`}
                >
                  <div className="text-xs font-bold">{w.label}</div>
                  <div className={`text-[10px] ${selectedWindow === w.id ? 'text-white/80' : 'text-cocoa-400'}`}>
                    {w.orders_count}/{w.capacity} · <span className="capitalize">{w.status}</span>
                  </div>
                </button>
              ))}
            </div>

            {batchResult && (
              <div className="rounded-2xl bg-white border border-cocoa-100 p-3.5 shadow-selected-soft">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-cocoa-700">{batchResult.label}</span>
                  <button onClick={() => setBatchResult(null)} className="text-cocoa-300 text-xs font-bold hover:text-cocoa-500">✕</button>
                </div>
                <div className="flex gap-2.5">
                  <div className="flex-1 rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-center">
                    <div className="text-lg font-heading font-extrabold text-emerald-600">{batchResult.advanced}</div>
                    <div className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wide">advanced</div>
                  </div>
                  <div className="flex-1 rounded-xl bg-amber-50 border border-amber-200 p-2.5 text-center">
                    <div className="text-lg font-heading font-extrabold text-amber-600">{batchResult.skipped}</div>
                    <div className="text-[10px] text-amber-600 font-semibold uppercase tracking-wide">skipped</div>
                  </div>
                </div>
                {batchResult.skipped > 0 && Object.keys(batchResult.skippedReasons).length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {Object.entries(batchResult.skippedReasons).map(([reason, count]) => (
                      <span key={reason} className="text-[10px] font-semibold px-2 py-1 rounded-md bg-amber-100 text-amber-700">{count}× {reason}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {batchSummary && batchSummary.total_orders > 0 && (
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => handleBatchAdvance(selectedWindow, { from_status: 'received', notes: 'Started preparing batch' }, 'Received → Preparing')}
                  disabled={batchBusy}
                  className="flex flex-col items-center gap-0.5 py-3 rounded-xl bg-flame-600 text-white text-xs font-bold disabled:opacity-50 active:scale-[0.98] transition-transform"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Start Preparing</span>
                  <span className="text-[9px] font-normal text-white/80">received → preparing</span>
                </button>
                <button
                  onClick={() => handleBatchAdvance(selectedWindow, { from_status: 'preparing', notes: 'Marked batch ready' }, 'Preparing → Ready')}
                  disabled={batchBusy}
                  className="flex flex-col items-center gap-0.5 py-3 rounded-xl bg-emerald-600 text-white text-xs font-bold disabled:opacity-50 active:scale-[0.98] transition-transform"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mark Ready</span>
                  <span className="text-[9px] font-normal text-white/80">preparing → ready</span>
                </button>
              </div>
            )}

            {batchSummary && (
              <div className="rounded-2xl bg-white border border-cocoa-100 p-4 shadow-selected-soft">
                <h3 className="font-bold text-sm text-cocoa-800 mb-1">Consolidated Prep List</h3>
                <p className="text-xs text-cocoa-400 mb-3">{batchSummary.total_orders} orders in this window</p>
                <div className="space-y-2">
                  {batchSummary.summary.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-cocoa-50">
                      <span className="text-sm font-medium text-cocoa-700">{item.item_name}</span>
                      <span className="font-bold text-cocoa-800">{item.total_quantity}×</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Settings */}
        {tab === 'settings' && settings && (
          <KitchenSettings settings={settings} capacity={capacity} />
        )}
      </div>
    </div>
  );
}

function MetricCard({ value, label, color }) {
  return (
    <div className="rounded-2xl bg-white border border-cocoa-100 p-3 text-center shadow-selected-soft">
      <div className={`font-heading font-extrabold text-xl ${color}`}>{value}</div>
      <div className="text-[10px] text-cocoa-400 font-semibold uppercase tracking-wide mt-0.5">{label}</div>
    </div>
  );
}