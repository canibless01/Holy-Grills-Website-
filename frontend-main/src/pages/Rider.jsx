import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bike, Check, Clock } from 'lucide-react';
import { liveApi as mockApi } from '@/lib/liveApi';
import { isAuthenticated, clearTokens } from '@/lib/apiClient';
import { formatNaira, formatDateTime, timeAgo, ORDER_STATUS_LABELS } from '@/lib/hgUtils';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toast } from '@/components/ui/use-toast';
import RiderHeader from '@/components/rider/RiderHeader';
import RiderOrderCard from '@/components/rider/RiderOrderCard';

const STATUS_STYLES = {
  received: 'bg-orange-500 text-white',
  preparing: 'bg-blue-500 text-white',
  ready: 'bg-emerald-500 text-white',
  assigned: 'bg-violet-500 text-white',
  out_for_delivery: 'bg-cyan-500 text-white',
  delivered: 'bg-green-700 text-white',
  delivery_attempted: 'bg-red-500 text-white',
  unclaimed: 'bg-gray-400 text-white',
  cancelled: 'bg-red-500 text-white',
  refunded: 'bg-gray-500 text-white',
};

const PERIODS = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
  { id: 'all', label: 'All Time' },
];

const TABS = [
  { id: 'batch', label: 'Delivery Batch' },
  { id: 'earnings', label: 'Earnings' },
  { id: 'history', label: 'History' },
];

export default function Rider() {
  const [batch, setBatch] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [online, setOnline] = useState(true);
  const [period, setPeriod] = useState('week');
  const [tab, setTab] = useState('batch');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [calling, setCalling] = useState(null);
  const [authed, setAuthed] = useState(isAuthenticated());
  const navigate = useNavigate();

  const loadBatch = async () => {
    try {
      const b = await mockApi.riders.getMyBatch();
      setBatch(b);
    } catch (e) { /* ignore poll errors */ }
  };

  useEffect(() => {
    if (!authed) { setLoading(false); return; }
    const init = async () => {
      try {
        const [b, e, s, h] = await Promise.all([
          mockApi.riders.getMyBatch(),
          mockApi.riders.getEarnings({ period: 'week' }),
          mockApi.riders.getStats(),
          mockApi.riders.getHistory(),
        ]);
        setBatch(b); setEarnings(e); setStats(s); setHistory(h); setOnline(Boolean(s?.is_available));
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    init();
    const interval = setInterval(loadBatch, 15000);
    return () => clearInterval(interval);
  }, [authed]);

  const changePeriod = async (p) => {
    setPeriod(p);
    try {
      const e = await mockApi.riders.getEarnings({ period: p });
      setEarnings(e);
    } catch (e2) { /* ignore */ }
  };

  const handleAction = async (orderId, action) => {
    setActionLoading(orderId);
    try {
      if (action === 'pickup') await mockApi.riders.pickup(orderId);
      else if (action === 'deliver') await mockApi.riders.deliver(orderId);
      else if (action === 'attempt') await mockApi.riders.attempt(orderId, { notes: 'Customer not answering' });
      toast({ title: action === 'pickup' ? 'Pickup confirmed' : action === 'deliver' ? 'Delivery confirmed' : 'Delivery attempted' });
      await loadBatch();
    } catch (e) { toast({ title: 'Action failed', description: e.message, variant: 'destructive' }); }
    setActionLoading(null);
  };

  const handleCall = async (orderId) => {
    setCalling(orderId);
    try {
      // Spec §6.9: endpoint returns { call_link: 'tel:...' }. Phone is never
      // exposed in raw form — only the tel: URI.
      const link = await mockApi.riders.getCallLink(orderId);
      window.location.href = (link && (link.call_link || link.call_url)) || '';
    } catch (e) { toast({ title: 'Call failed', description: e?.message || 'No phone number available', variant: 'destructive' }); }
    setCalling(null);
  };

  const navigateTo = (address) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address + ', FUTA, Akure')}`, '_blank');
  };

  const toggleOnline = async () => {
    const newStatus = !online;
    if (newStatus) {
      // Going online — capture real GPS from the browser for dispatch
      // optimization (Spec §6.4). No hardcoded coordinates.
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            setOnline(true);
            try {
              await mockApi.riders.setAvailability({ is_available: true, location_lat: pos.coords.latitude, location_lng: pos.coords.longitude });
              toast({ title: 'You are online', description: 'GPS shared with dispatch.' });
            } catch (e) { setOnline(false); toast({ title: 'Could not go online', description: e.message, variant: 'destructive' }); }
          },
          () => toast({ title: 'Location required', description: 'Enable location access to go online.', variant: 'destructive' }),
          { enableHighAccuracy: true, timeout: 8000 }
        );
      } else {
        toast({ title: 'Location unsupported', description: 'This device cannot share GPS.', variant: 'destructive' });
      }
    } else {
      setOnline(false);
      try { await mockApi.riders.setAvailability({ is_available: false }); toast({ title: 'You are offline' }); }
      catch (e) { setOnline(true); toast({ title: 'Could not go offline', description: e.message, variant: 'destructive' }); }
    }
  };

  const handleSignOut = () => {
    clearTokens();
    navigate('/');
  };

  if (!authed) return <Navigate to="/login" state={{ from: '/rider' }} replace />;
  if (loading) return <LoadingSpinner label="Loading rider dashboard..." />;

  const orderCount = batch?.orders?.length || 0;
  const periodLabel = period === 'all' ? 'All-Time' : period === 'today' ? "Today's" : `This ${period === 'week' ? 'Week' : 'Month'}'s`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <RiderHeader online={online} onToggleOnline={toggleOnline} onSignOut={handleSignOut} />

      <div className="max-w-3xl w-full mx-auto px-4 sm:px-6 py-5 space-y-5 flex-1 animate-fade-in">
        {/* Earnings Summary */}
        {earnings && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl flame-gradient p-5 text-white relative overflow-hidden"
          >
            <div className="absolute -right-4 -top-4 opacity-15">
              <Bike className="w-24 h-24" />
            </div>
            <div className="relative">
              <div className="text-[10px] text-white/80 uppercase font-bold tracking-wider">
                {periodLabel} Earnings
              </div>
              <div className="font-heading font-extrabold text-3xl mt-1">{formatNaira(earnings?.total_earnings ?? 0)}</div>
              <div className="text-xs text-white/80 mt-1">{earnings?.total_deliveries ?? 0} deliveries completed</div>
            </div>
          </motion.div>
        )}

        {/* Stats Bar */}
        {stats && (
          <div className="grid grid-cols-4 gap-2.5">
            <StatCard value={stats?.total_batches ?? 0} label="Batches" color="text-cocoa-800" />
            <StatCard value={`${Math.round(stats?.completion_rate ?? 0)}%`} label="Completion" color="text-gold-500" />
            <StatCard value={stats?.total_orders_delivered ?? 0} label="Delivered" color="text-flame-600" />
            <StatCard value={stats?.zones_served?.length ?? 0} label="Zones" color="text-gold-500" />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-2xl bg-cocoa-100 sticky top-16 z-20">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${tab === t.id ? 'bg-white text-flame-600 shadow-selected-soft' : 'text-cocoa-500'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Batch */}
        {tab === 'batch' && batch && (
          <div className="space-y-3">
            <div className="rounded-2xl bg-white border border-cocoa-100 p-4 shadow-selected-soft">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-cocoa-400 font-semibold uppercase tracking-wider">Batch #{batch.batch.id?.toUpperCase() || '—'}</div>
                  <div className="font-heading font-bold text-sm text-cocoa-800 mt-0.5">Zone: {batch.batch.zone || '—'}</div>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-flame-50 text-flame-600 capitalize">{batch.batch.status || 'active'}</span>
              </div>
              {batch.batch.delivery_window?.label && (
                <div className="text-xs text-cocoa-400 mt-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {batch.batch.delivery_window.label}
                </div>
              )}
            </div>

            <div className="text-[10px] font-bold uppercase tracking-wider text-cocoa-400 px-1">Delivery Route (sorted by distance)</div>
            {(batch?.orders || []).map((order) => (
              <RiderOrderCard
                key={order.id}
                order={order}
                onAction={handleAction}
                onCall={handleCall}
                onNavigate={navigateTo}
                actionLoading={actionLoading}
                calling={calling}
              />
            ))}
            {orderCount === 0 && (
              <div className="text-center py-12">
                <Bike className="w-10 h-10 text-cocoa-200 mx-auto mb-2" />
                <p className="text-sm text-cocoa-400">No active deliveries in your batch.</p>
                <p className="text-xs text-cocoa-300 mt-1">New orders will appear here automatically.</p>
              </div>
            )}
          </div>
        )}

        {/* Earnings */}
        {tab === 'earnings' && earnings && (
          <div className="space-y-3">
            <div className="flex gap-1 p-1 rounded-2xl bg-cocoa-100">
              {PERIODS.map(p => (
                <button key={p.id} onClick={() => changePeriod(p.id)} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${period === p.id ? 'bg-white text-flame-600 shadow-selected-soft' : 'text-cocoa-500'}`}>
                  {p.label}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              {(earnings?.deliveries || []).map((d, i) => (
                <div key={i} className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-cocoa-100 shadow-selected-soft">
                  <div className="w-10 h-10 rounded-xl bg-gold-100 flex items-center justify-center">
                    <Check className="w-5 h-5 text-gold-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-cocoa-700">Delivery {d.order_id?.toUpperCase()}</div>
                    <div className="text-xs text-cocoa-400">{timeAgo(d.delivered_at)}</div>
                  </div>
                  <div className="font-heading font-bold text-sm text-gold-500">+{formatNaira(d.amount)}</div>
                </div>
              ))}
              {(earnings?.deliveries || []).length === 0 && (
                <div className="text-center py-12">
                  <p className="text-sm text-cocoa-400">No earnings recorded for this period.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* History — Spec §6.6: batch-level rows { id, zone, status, created_at, order_count } */}
        {tab === 'history' && (
          <div className="space-y-2">
            {(history || []).map((d) => {
              const done = d.status === 'completed' || d.status === 'delivered';
              return (
              <div key={d.id} className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-cocoa-100 shadow-selected-soft">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${done ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                  {done ? <Check className="w-5 h-5 text-emerald-600" /> : <Clock className="w-5 h-5 text-amber-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-cocoa-700 truncate">{d.zone || `Batch #${(d.id || '').slice(0,8)}`}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md capitalize ${STATUS_STYLES[d.status] || 'bg-cocoa-300 text-white'}`}>
                      {ORDER_STATUS_LABELS[d.status] || d.status}
                    </span>
                  </div>
                  <div className="text-xs text-cocoa-400 truncate">{d.order_count ?? (d.orders || []).length ?? 0} order(s) in batch</div>
                  <div className="text-[11px] text-cocoa-400">{formatDateTime(d.created_at)}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-heading font-bold text-sm text-gold-500">{d.order_count ?? (d.orders || []).length ?? 0}</div>
                </div>
              </div>
              );
            })}
            {history.length === 0 && (
              <div className="text-center py-12">
                <Clock className="w-10 h-10 text-cocoa-200 mx-auto mb-2" />
                <p className="text-sm text-cocoa-400">No completed batches yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ value, label, color }) {
  return (
    <div className="rounded-2xl bg-white border border-cocoa-100 p-2.5 text-center shadow-selected-soft">
      <div className={`font-heading font-extrabold text-base ${color}`}>{value}</div>
      <div className="text-[9px] text-cocoa-400 font-semibold uppercase tracking-wide mt-0.5">{label}</div>
    </div>
  );
}