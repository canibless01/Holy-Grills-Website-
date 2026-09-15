import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Clock, Flame, X, Check, Calendar, RefreshCw, Gift, ChevronRight, AlertCircle } from 'lucide-react';
import { mockApi } from '@/lib/mockApi';
import { getSetting } from '@/lib/featureConfig';
import { orderLockMaxReschedules } from '@/lib/appConfig';
import { isAuthenticated } from '@/lib/apiClient';
import { toast } from '@/components/ui/use-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

/**
 * OrderLocks — confirmed Order Lock logic.
 * POST /order-locks with locked_date (future) + discount_pct (1–50%) OR
 * reward_type:"hp" + reward_hp_amount. The lock is consumed automatically when
 * an order is placed on that date (discount applies to subtotal, or HP awards
 * to active balance). One reschedule allowed. Auto-expires via cron if the date
 * passes unused. An active lock blocks creating another for the same date.
 */
const LOCK_STATUS_LABELS = {
  active: 'Active',
  consumed: 'Consumed',
  expired: 'Expired',
  cancelled: 'Cancelled',
};
const LOCK_STATUS_COLORS = {
  active: 'bg-green-50 text-green-600',
  consumed: 'bg-flame-50 text-flame-600',
  expired: 'bg-cocoa-100 text-cocoa-500',
  cancelled: 'bg-red-50 text-red-500',
};

export default function OrderLocks() {
  const navigate = useNavigate();
  const [locks, setLocks] = useState([]);
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [rescheduleLock, setRescheduleLock] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduling, setRescheduling] = useState(false);

  // Create form — read configurable bounds from settings (with confirmed defaults).
  const minDiscount = getSetting('order_lock_min_discount_pct', 1);
  const maxDiscount = getSetting('order_lock_max_discount_pct', 50);
  const defaultHpReward = getSetting('order_lock_default_hp_reward', 50);
  const [form, setForm] = useState({
    locked_date: '',
    reward_kind: 'discount', // 'discount' | 'hp'
    discount_pct: 10,
    reward_hp_amount: defaultHpReward,
  });

  useEffect(() => { load(); }, []);

  const load = async () => {
    if (!isAuthenticated()) { setSessionExpired(true); setLoading(false); return; }
    try {
      const [res, allOrders] = await Promise.all([
        mockApi.orderLocks.list(),
        mockApi.orders.list({ limit: 50 }).catch(() => []),
      ]);
      setLocks(Array.isArray(res) ? res : (res?.locks || res?.order_locks || []));
      setDeliveredOrders((Array.isArray(allOrders) ? allOrders : []).filter((o) => o.status === 'delivered'));
    } catch (e) {
      if (e?.status === 401) { setSessionExpired(true); }
      else { console.error(e); }
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!form.locked_date) { toast({ title: 'Pick a date', description: 'Choose a future date to lock.' }); return; }
    if (new Date(form.locked_date) <= new Date(new Date().toDateString())) {
      toast({ title: 'Must be a future date', description: 'The lock date has to be after today.' }); return;
    }
    setCreating(true);
    try {
      const body = { locked_date: form.locked_date };
      if (form.reward_kind === 'discount') {
        body.discount_pct = Number(form.discount_pct);
      } else {
        body.reward_type = 'hp';
        body.reward_hp_amount = Number(form.reward_hp_amount);
      }
      await mockApi.orderLocks.create(body);
      toast({ title: '🔒 Lock created', description: `Locked for ${new Date(form.locked_date).toLocaleDateString()}.` });
      setShowCreate(false);
      setForm({ ...form, locked_date: '' });
      load();
    } catch (e) {
      toast({ title: 'Lock failed', description: e.message, variant: 'destructive' });
    }
    setCreating(false);
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this order lock? You will lose the locked reward.')) return;
    try { await mockApi.orderLocks.cancel(id); load(); } catch (e) { toast({ title: 'Cancel failed', description: e.message, variant: 'destructive' }); }
  };

  const handleReschedule = async () => {
    if (!rescheduleLock || !rescheduleDate) return;
    if (new Date(rescheduleDate) <= new Date(new Date().toDateString())) { toast({ title: 'Must be a future date' }); return; }
    setRescheduling(true);
    try {
      await mockApi.orderLocks.reschedule(rescheduleLock.id, { locked_date: rescheduleDate });
      toast({ title: '🔒 Rescheduled', description: `Lock moved to ${new Date(rescheduleDate).toLocaleDateString()}.` });
      setRescheduleLock(null);
      load();
    } catch (e) { toast({ title: 'Reschedule failed', description: e.message, variant: 'destructive' }); }
    setRescheduling(false);
  };

  if (loading) return <LoadingSpinner label="Loading order locks..." />;

  if (sessionExpired) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="font-heading font-extrabold text-2xl text-cocoa-800">Order Locks 🔒</h1>
        </div>
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-6 text-center">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h3 className="font-heading font-bold text-base text-cocoa-800 mb-1">Session expired</h3>
          <p className="text-sm text-cocoa-500 mb-4">Your session has expired. Please log in again to view your order locks.</p>
          <button onClick={() => navigate('/login')} className="px-5 py-2.5 rounded-full flame-gradient text-white text-xs font-bold">Log in again</button>
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const dateOptions = (days) => Array.from({ length: days }).map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i + 1); return d.toISOString().split('T')[0];
  });
  // One lock per delivered order: a new lock requires NO active lock AND at
  // least one order delivered in the last 7 days (spec).
  const hasActiveLock = locks.some((l) => (l.status || 'active') === 'active');
  const sevenDaysAgo = Date.now() - 7 * 86400000;
  const recentDelivered = deliveredOrders.filter((o) => new Date(o.created_at || o.updated_at || 0).getTime() >= sevenDaysAgo);
  const canCreateLock = !hasActiveLock && recentDelivered.length > 0;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-heading font-extrabold text-2xl text-cocoa-800">Order Locks 🔒</h1>
        {canCreateLock && (
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-full flame-gradient text-white text-xs font-bold shadow-selected-soft">
            <Lock className="w-3.5 h-3.5" /> New Lock
          </button>
        )}
      </div>

      {/* Eligibility status — why the New Lock button is/isn't available */}
      {!canCreateLock && (
        <div className={`rounded-2xl border p-4 flex items-start gap-3 ${hasActiveLock ? 'bg-amber-50 border-amber-200' : 'bg-cocoa-50 border-cocoa-200'}`}>
          <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${hasActiveLock ? 'text-amber-500' : 'text-cocoa-400'}`} />
          <div className="text-xs text-cocoa-600 leading-relaxed">
            {hasActiveLock
              ? "You already have an active order lock. You can create a new one once it's used, expires, or is cancelled."
              : "Complete an order to unlock this feature."}
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-flame-50 border border-flame-200 p-4">
        <div className="flex items-center gap-2 mb-1">
          <Lock className="w-4 h-4 text-flame-600" />
          <span className="font-bold text-sm text-cocoa-800">How Order Locks work</span>
        </div>
        <p className="text-xs text-cocoa-500 leading-relaxed">
          Lock in a reward for a future date — your choice of a <span className="font-semibold">discount %</span> (applies to your order subtotal) or an <span className="font-semibold">HP reward</span> (added to your active balance). Place any order on that date and the lock is consumed automatically. One reschedule per lock; if the date passes unused, the lock auto-expires.
        </p>
      </div>

      {locks.length === 0 ? (
        <div className="text-center py-12">
          <Lock className="w-12 h-12 text-cocoa-200 mx-auto mb-2" />
          <p className="text-sm text-cocoa-400">No order locks yet</p>
          <p className="text-xs text-cocoa-400 mt-1">Lock a future date to guarantee a reward on your next order.</p>
          {canCreateLock ? (
            <button onClick={() => setShowCreate(true)} className="mt-4 px-5 py-2.5 rounded-full flame-gradient text-white text-xs font-bold">Create your first lock</button>
          ) : (
            <p className="mt-4 text-xs text-cocoa-500 bg-cocoa-50 rounded-xl p-3 max-w-xs mx-auto">Complete an order to unlock this feature.</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {locks.map(lock => {
            const lockedDate = lock.locked_date ? new Date(lock.locked_date) : null;
            const daysToLock = lockedDate ? Math.ceil((lockedDate - Date.now()) / (24 * 60 * 60 * 1000)) : null;
            const isHp = (lock.reward_type || lock.reward) === 'hp';
            const status = lock.status || (lock.consumed_at ? 'consumed' : 'active');
            const isActive = status === 'active';
            // One reschedule allowed — reschedule_count starts at 0, becomes 1
            // after the first (and only) reschedule. Disable the button once used.
            const maxReschedules = orderLockMaxReschedules();
            const reschedulesUsed = lock.reschedule_count || (lock.is_rescheduled ? 1 : 0);
            const canReschedule = isActive && reschedulesUsed < maxReschedules;
            return (
              <div key={lock.id} className={`rounded-2xl bg-white border-2 p-4 ${isActive ? 'border-flame-200' : 'border-cocoa-100 opacity-70'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${LOCK_STATUS_COLORS[status] || 'bg-cocoa-100 text-cocoa-500'}`}>{LOCK_STATUS_LABELS[status] || status}</span>
                    <div className="text-[10px] text-cocoa-400 mt-1">
                      {lockedDate ? `Locked for ${lockedDate.toLocaleDateString()}` : ''}
                      {lock.consumed_at && ` · claimed ${new Date(lock.consumed_at).toLocaleDateString()}`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-xs font-bold text-flame-600">
                      {isHp ? <><Gift className="w-3.5 h-3.5" />{lock.reward_hp_amount || 0} HP</> : <><Flame className="w-3 h-3" />{lock.discount_pct || 0}% off</>}
                    </div>
                  </div>
                </div>

                {isActive && (
                  <>
                    <div className="flex items-center gap-2 text-xs mb-3">
                      <Clock className={`w-3.5 h-3.5 ${daysToLock <= 1 ? 'text-flame-600' : 'text-cocoa-400'}`} />
                      <span className={daysToLock <= 1 ? 'text-flame-600 font-bold' : 'text-cocoa-500'}>
                        {daysToLock > 0 ? `${daysToLock} day${daysToLock !== 1 ? 's' : ''} until your lock date` : 'Lock date is today — order to claim!'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => navigate('/menu')} className="flex-1 py-2 rounded-full flame-gradient text-white text-xs font-bold">Order to claim</button>
                      <button
                        onClick={() => { setRescheduleLock(lock); setRescheduleDate(dateOptions(7)[0]); }}
                        disabled={!canReschedule}
                        className={`px-3 py-2 rounded-full text-xs font-bold flex items-center gap-1 ${canReschedule ? 'bg-amber-50 border border-amber-200 text-amber-600' : 'bg-cocoa-50 border border-cocoa-100 text-cocoa-300 cursor-not-allowed'}`}
                      >
                        <RefreshCw className="w-3 h-3" /> {reschedulesUsed >= maxReschedules ? 'Rescheduled' : 'Reschedule'}
                      </button>
                      <button onClick={() => handleCancel(lock.id)} className="px-4 py-2 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold">Cancel</button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4" onClick={() => !creating && setShowCreate(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-heading font-bold text-base text-cocoa-800 flex items-center gap-2"><Lock className="w-5 h-5 text-flame-600" /> New Order Lock</h3>
              <button onClick={() => setShowCreate(false)}><X className="w-5 h-5 text-cocoa-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-cocoa-500 uppercase">Lock date (future)</label>
                <input type="date" min={today} value={form.locked_date} onChange={(e) => setForm({ ...form, locked_date: e.target.value })} className="w-full mt-1 p-3 rounded-xl border border-cocoa-200 text-sm focus:outline-none focus:border-flame-400" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setForm({ ...form, reward_kind: 'discount' })} className={`p-3 rounded-xl border-2 text-center ${form.reward_kind === 'discount' ? 'border-flame-400 bg-flame-50' : 'border-cocoa-200'}`}>
                  <Flame className="w-5 h-5 mx-auto mb-1 text-flame-600" />
                  <span className="text-xs font-bold">Discount %</span>
                </button>
                <button onClick={() => setForm({ ...form, reward_kind: 'hp' })} className={`p-3 rounded-xl border-2 text-center ${form.reward_kind === 'hp' ? 'border-flame-400 bg-flame-50' : 'border-cocoa-200'}`}>
                  <Gift className="w-5 h-5 mx-auto mb-1 text-gold-500" />
                  <span className="text-xs font-bold">HP Reward</span>
                </button>
              </div>
              {form.reward_kind === 'discount' ? (
                <div>
                  <label className="text-[10px] font-bold text-cocoa-500 uppercase">Discount ({minDiscount}–{maxDiscount}%)</label>
                  <select value={form.discount_pct} onChange={(e) => setForm({ ...form, discount_pct: Number(e.target.value) })} className="w-full mt-1 p-3 rounded-xl border border-cocoa-200 text-sm bg-white focus:outline-none focus:border-flame-400">
                    {Array.from({ length: maxDiscount - minDiscount + 1 }).map((_, i) => {
                      const v = minDiscount + i; return <option key={v} value={v}>{v}% off</option>;
                    })}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="text-[10px] font-bold text-cocoa-500 uppercase">HP amount</label>
                  <input type="number" min={1} value={form.reward_hp_amount} onChange={(e) => setForm({ ...form, reward_hp_amount: Number(e.target.value) })} className="w-full mt-1 p-3 rounded-xl border border-cocoa-200 text-sm focus:outline-none focus:border-flame-400" />
                </div>
              )}
              <button onClick={handleCreate} disabled={creating} className="w-full py-3 rounded-full flame-gradient text-white font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                {creating ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Creating...</> : <>Create lock</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule modal */}
      {rescheduleLock && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4" onClick={() => !rescheduling && setRescheduleLock(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-heading font-bold text-base text-cocoa-800 flex items-center gap-2"><Calendar className="w-5 h-5 text-flame-600" /> Reschedule Lock</h3>
              <button onClick={() => setRescheduleLock(null)}><X className="w-5 h-5 text-cocoa-400" /></button>
            </div>
            <p className="text-xs text-cocoa-500 mb-3">Move this lock to a new future date. You can only reschedule once.</p>
            <input type="date" min={today} value={rescheduleDate} onChange={(e) => setRescheduleDate(e.target.value)} className="w-full p-3 rounded-xl border border-cocoa-200 text-sm mb-3 focus:outline-none focus:border-flame-400" />
            <button onClick={handleReschedule} disabled={rescheduling} className="w-full py-3 rounded-full flame-gradient text-white font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
              {rescheduling ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Rescheduling...</> : <>Move to {rescheduleDate ? new Date(rescheduleDate).toLocaleDateString() : '—'}</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}