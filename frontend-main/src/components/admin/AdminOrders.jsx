import React, { useState, useEffect } from 'react';
import { Search, Package, ChevronDown, ChevronUp, RotateCcw, Clock, AlertTriangle, ShoppingCart, Bell } from 'lucide-react';
import { liveApi as mockApi } from '@/lib/liveApi';
import { formatNaira, timeAgo, formatDateTime, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, getOrderCustomer } from '@/lib/hgUtils';
import { toast } from '@/components/ui/use-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Modal, Field, TextInput, Card, Pill, Toggle } from './AdminShared';

const OVERRIDE_STATUSES = ['received', 'preparing', 'ready', 'assigned', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'];
// Valid walk targets — terminal states (cancelled/refunded) can't be advanced.
const WALK_TARGETS = ['preparing', 'ready', 'assigned', 'out_for_delivery', 'delivered'];

export default function AdminOrders() {
  const [tab, setTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [history, setHistory] = useState({});
  const [refundOrder, setRefundOrder] = useState(null);
  const [overrideOrder, setOverrideOrder] = useState(null);
  const [walkOrder, setWalkOrder] = useState(null);
  const [busy, setBusy] = useState(null);
  const [users, setUsers] = useState({});

  // Frontend profile join — the admin orders endpoint returns user_id without a
  // profiles join, so we load the user list once and resolve user_id → name/phone
  // locally. Guest orders already carry guest_name/guest_phone on the order.
  useEffect(() => {
    (async () => { try { const u = await mockApi.admin.getUsers(); const map = {}; (u || []).forEach((x) => { if (x.id) map[x.id] = x; }); setUsers(map); } catch { /* ignore */ } })();
  }, []);

  useEffect(() => { if (tab === 'orders') load(); }, [search, statusFilter, fromDate, tab]);

  const load = async () => {
    setLoading(true);
    const o = await mockApi.admin.getAdminOrders({ status: statusFilter, from_date: fromDate || undefined });
    let result = o;
    if (search) result = o.filter(ord => ord.id.toLowerCase().includes(search.toLowerCase()));
    setOrders(result);
    setLoading(false);
  };

  const toggleExpand = async (id) => {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    if (!history[id]) {
      const h = await mockApi.orders.getHistory(id);
      setHistory((s) => ({ ...s, [id]: h }));
    }
  };

  const doRefund = async () => {
    if (!refundOrder) return;
    setBusy(refundOrder.id);
    await mockApi.orders.refund(refundOrder.id, { reason: refundOrder.reason, refund_amount: Number(refundOrder.refund_amount) || refundOrder.total_amount, refund_to_wallet: !!refundOrder.refund_to_wallet });
    setBusy(null);
    const rid = refundOrder.id;
    setRefundOrder(null);
    await load();
    if (expanded === rid) {
      const h = await mockApi.orders.getHistory(rid);
      setHistory((s) => ({ ...s, [rid]: h }));
    }
  };

  const doOverride = async () => {
    if (!overrideOrder) return;
    setBusy(overrideOrder.id);
    await mockApi.admin.overrideOrderStatus(overrideOrder.id, { status: overrideOrder.new_status, notes: overrideOrder.reason });
    setBusy(null);
    const oid = overrideOrder.id;
    setOverrideOrder(null);
    await load();
    const h = await mockApi.orders.getHistory(oid);
    setHistory((s) => ({ ...s, [oid]: h }));
  };

  const doWalk = async () => {
    if (!walkOrder) return;
    setBusy(walkOrder.id);
    try {
      await mockApi.orders.walk(walkOrder.id, { target_status: walkOrder.target_status, notes: walkOrder.reason || '' });
      toast({ title: '✅ Order advanced', description: `Order moved to ${walkOrder.target_status.replace(/_/g, ' ')} via the shortest valid path.` });
      const wid = walkOrder.id;
      setWalkOrder(null);
      await load();
      const h = await mockApi.orders.getHistory(wid);
      setHistory((s) => ({ ...s, [wid]: h }));
    } catch (e) {
      toast({ title: 'Walk failed', description: e.message, variant: 'destructive' });
    }
    setBusy(null);
  };

  return (
    <div className="space-y-4">
      {/* Tab switcher */}
      <div className="flex gap-1 p-1 rounded-full bg-cocoa-100 max-w-xs">
        <button onClick={() => setTab('orders')} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-bold transition-all ${tab === 'orders' ? 'bg-white text-flame-600 shadow-sm' : 'text-cocoa-500'}`}>
          <Package className="w-3.5 h-3.5" /> Orders
        </button>
        <button onClick={() => setTab('abandoned')} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-bold transition-all ${tab === 'abandoned' ? 'bg-white text-flame-600 shadow-sm' : 'text-cocoa-500'}`}>
          <ShoppingCart className="w-3.5 h-3.5" /> Abandoned
        </button>
      </div>

      {tab === 'abandoned' ? (
        <AbandonedCarts />
      ) : (
      <>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cocoa-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search order ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cocoa-200 text-sm focus:outline-none focus:border-flame-400" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-cocoa-200 text-sm font-semibold text-cocoa-700 focus:outline-none focus:border-flame-400">
          <option value="">All Statuses</option>
          {Object.keys(ORDER_STATUS_LABELS).map((s) => <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>)}
        </select>
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-cocoa-200 text-sm font-semibold text-cocoa-700 focus:outline-none focus:border-flame-400" />
      </div>

      {loading ? <LoadingSpinner label="Loading orders..." /> : orders.length === 0 ? (
        <div className="text-center py-12 text-cocoa-400">
          <Package className="w-8 h-8 mx-auto mb-2 text-cocoa-200" /> No orders found
        </div>
      ) : (
        <div className="space-y-2">
          {orders.map((o) => {
            const isTerminal = ['delivered', 'cancelled', 'refunded'].includes(o.status);
            const isOpen = expanded === o.id;
            const cust = getOrderCustomer(o);
            const custName = cust.display !== 'Walk-in' ? cust.display : (users[o.user_id]?.full_name || (o.guest_name ? o.guest_name : 'Walk-in'));
            const custPhone = cust.phone || users[o.user_id]?.phone || '';
            return (
              <div key={o.id} className="rounded-2xl bg-white border border-cocoa-100 p-4">
                <button onClick={() => toggleExpand(o.id)} className="w-full text-left">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ORDER_STATUS_COLORS[o.status]}`}>{ORDER_STATUS_LABELS[o.status]}</span>
                      <span className="text-xs text-cocoa-400 font-mono">#{o.id.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-cocoa-400">{timeAgo(o.created_at)}</span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-cocoa-400" /> : <ChevronDown className="w-4 h-4 text-cocoa-400" />}
                    </div>
                  </div>
                  <div className="text-sm text-cocoa-600 mb-1">
                    {o.order_items.map((it, i) => <span key={i}>{it.quantity}× {it.name_snapshot}{i < o.order_items.length - 1 ? ', ' : ''}</span>)}
                  </div>
                  <div className="flex items-center gap-2 text-xs mb-1">
                    <span className="font-semibold text-cocoa-700">{custName}</span>
                    {custPhone && <a href={`tel:${custPhone}`} className="text-flame-600 font-semibold hover:underline">{custPhone}</a>}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-cocoa-400 capitalize">{o.payment_status} · {o.delivery_type?.replace(/_/g, ' ')}{o.is_squad_order && ' · 👥 squad'}{o.delivery_window?.label ? ` · ${o.delivery_window.label}` : ''}</span>
                    <span className="font-bold text-cocoa-800">{formatNaira(o.total_amount)}</span>
                  </div>
                </button>

                {isOpen && (
                  <div className="mt-3 pt-3 border-t border-cocoa-100 space-y-3">
                    <div>
                      <div className="text-[11px] font-bold text-cocoa-500 uppercase mb-1.5 flex items-center gap-1"><Clock className="w-3 h-3" /> Status Timeline</div>
                      {(history[o.id] || []).map((h, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs py-0.5">
                          <span className={`w-2 h-2 rounded-full ${ORDER_STATUS_COLORS[h.status] || 'bg-cocoa-200'}`} />
                          <span className="font-semibold text-cocoa-700 capitalize">{ORDER_STATUS_LABELS[h.status] || h.status}</span>
                          <span className="text-cocoa-400">{formatDateTime(h.changed_at)}</span>
                          <span className="text-cocoa-300 ml-auto">by {h.actor}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {!isTerminal && (
                        <button onClick={() => setWalkOrder({ id: o.id, current_status: o.status, target_status: WALK_TARGETS[WALK_TARGETS.indexOf(o.status) + 1] || 'delivered', reason: '' })}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 text-green-600 border border-green-200 text-xs font-bold">
                          <ChevronDown className="w-3.5 h-3.5" /> Walk Status
                        </button>
                      )}
                      <button onClick={() => setOverrideOrder({ id: o.id, new_status: o.status, reason: '', current_status: o.status })}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 text-xs font-bold">
                        <AlertTriangle className="w-3.5 h-3.5" /> Override Status
                      </button>
                      {!isTerminal && (
                        <button onClick={() => setRefundOrder({ id: o.id, total_amount: o.total_amount, reason: '', refund_amount: o.total_amount, refund_to_wallet: true })}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-red-600 border border-red-200 text-xs font-bold">
                          <RotateCcw className="w-3.5 h-3.5" /> Refund
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {refundOrder && (
        <Modal open onClose={() => setRefundOrder(null)} title={`Refund #${refundOrder.id.toUpperCase()}`}>
          <div className="space-y-3">
            <p className="text-xs text-cocoa-500">Order total: <span className="font-bold text-cocoa-800">{formatNaira(refundOrder.total_amount)}</span>. Refunding moves the order to <span className="font-bold text-red-500">refunded</span> and credits the wallet portion back.</p>
            <Field label="Refund amount (₦)"><TextInput type="number" value={refundOrder.refund_amount} onChange={(e) => setRefundOrder({ ...refundOrder, refund_amount: e.target.value })} /></Field>
            <Field label="Reason"><TextInput value={refundOrder.reason} onChange={(e) => setRefundOrder({ ...refundOrder, reason: e.target.value })} placeholder="Customer complaint / duplicate / …" /></Field>
            <div className="flex items-center gap-2"><Toggle checked={!!refundOrder.refund_to_wallet} onChange={(v) => setRefundOrder({ ...refundOrder, refund_to_wallet: v })} /><span className="text-sm text-cocoa-600 font-semibold">Credit refund to user wallet</span></div>
            <button onClick={doRefund} disabled={busy === refundOrder.id} className="w-full py-3 rounded-full bg-red-600 text-white font-bold disabled:opacity-50">
              {busy === refundOrder.id ? 'Processing...' : 'Confirm Refund'}
            </button>
          </div>
        </Modal>
      )}

      {overrideOrder && (
        <Modal open onClose={() => setOverrideOrder(null)} title={`Override Status — #${overrideOrder.id.toUpperCase()}`}>
          <div className="space-y-3">
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>This forces the order status directly. Kitchen and Rider panels will see this change immediately. Use only when the normal flow is stuck.</span>
            </div>
            <div className="text-xs text-cocoa-500">Current: <span className="font-bold text-cocoa-800">{ORDER_STATUS_LABELS[overrideOrder.current_status]}</span></div>
            <Field label="Force status to">
              <select value={overrideOrder.new_status} onChange={(e) => setOverrideOrder({ ...overrideOrder, new_status: e.target.value })}
                className="w-full mt-1 p-2.5 rounded-xl border border-cocoa-200 text-sm">
                {OVERRIDE_STATUSES.map((s) => <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>)}
              </select>
            </Field>
            <Field label="Reason (audit log)"><TextInput value={overrideOrder.reason} onChange={(e) => setOverrideOrder({ ...overrideOrder, reason: e.target.value })} placeholder="Why is this being overridden?" /></Field>
            <button onClick={doOverride} disabled={busy === overrideOrder.id || overrideOrder.new_status === overrideOrder.current_status} className="w-full py-3 rounded-full bg-amber-600 text-white font-bold disabled:opacity-50">
              {busy === overrideOrder.id ? 'Overriding...' : 'Force Status Change'}
            </button>
          </div>
        </Modal>
      )}

      {walkOrder && (
        <Modal open onClose={() => setWalkOrder(null)} title={`Walk Status — #${walkOrder.id.toUpperCase()}`}>
          <div className="space-y-3">
            <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-xs text-green-700 flex items-start gap-2">
              <ChevronDown className="w-4 h-4 shrink-0 mt-0.5" />
              <span>The server finds the shortest valid path through the order state machine and applies each transition in sequence. HP is awarded only on reaching <b>delivered</b>. Terminal states (cancelled/refunded) can't be advanced.</span>
            </div>
            <div className="text-xs text-cocoa-500">Current: <span className="font-bold text-cocoa-800">{ORDER_STATUS_LABELS[walkOrder.current_status]}</span></div>
            <Field label="Advance to">
              <select value={walkOrder.target_status} onChange={(e) => setWalkOrder({ ...walkOrder, target_status: e.target.value })}
                className="w-full mt-1 p-2.5 rounded-xl border border-cocoa-200 text-sm">
                {WALK_TARGETS.filter((s) => WALK_TARGETS.indexOf(s) > WALK_TARGETS.indexOf(walkOrder.current_status)).map((s) => <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>)}
              </select>
            </Field>
            <Field label="Notes (optional)"><TextInput value={walkOrder.reason} onChange={(e) => setWalkOrder({ ...walkOrder, reason: e.target.value })} placeholder="Reason for manual advancement" /></Field>
            <button onClick={doWalk} disabled={busy === walkOrder.id || !walkOrder.target_status} className="w-full py-3 rounded-full bg-green-600 text-white font-bold disabled:opacity-50">
              {busy === walkOrder.id ? 'Advancing...' : 'Walk to Target Status'}
            </button>
          </div>
        </Modal>
      )}
      </>
      )}
    </div>
  );
}

function AbandonedCarts() {
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nudging, setNudging] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try { setCarts(await mockApi.admin.getAbandonedCarts()); } catch (e) { console.error(e); }
    setLoading(false);
  };

  const nudge = async (id) => {
    setNudging(id);
    try {
      await mockApi.admin.nudgeAbandonedCart(id);
      toast({ title: '🔔 Nudge sent', description: 'Reminder pushed to the customer.' });
      await load();
    } catch (e) {
      toast({ title: 'Nudge failed', description: e.message, variant: 'destructive' });
    }
    setNudging(null);
  };

  if (loading) return <LoadingSpinner label="Loading abandoned carts..." />;

  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700 flex items-center gap-2">
        <Bell className="w-3.5 h-3.5 shrink-0" />
        Carts left without checkout. Send a nudge to remind the customer to complete their order.
      </div>
      {carts.length === 0 ? (
        <div className="text-center py-12 text-cocoa-400">
          <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-cocoa-200" /> No abandoned carts right now
        </div>
      ) : carts.map((c) => (
        <Card key={c.id} className="flex items-center gap-3 !p-3">
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm text-cocoa-800">{c.user_name || c.user_email || 'Guest'}</div>
            <div className="text-xs text-cocoa-400">
              {c.item_count || 0} item{(c.item_count || 0) !== 1 ? 's' : ''} · {formatNaira(c.total || c.subtotal || 0)} · abandoned {timeAgo(c.abandoned_at || c.updated_at)}
            </div>
            {c.items && c.items.length > 0 && (
              <div className="text-[11px] text-cocoa-500 mt-0.5 truncate">
                {(c.items || []).slice(0, 3).map((it, i) => <span key={i}>{it.name || it.name_snapshot}{i < Math.min(c.items.length, 3) - 1 ? ', ' : ''}</span>)}
                {c.items.length > 3 && ` +${c.items.length - 3} more`}
              </div>
            )}
          </div>
          {c.nudged ? (
            <Pill tone="green">Nudged</Pill>
          ) : (
            <button onClick={() => nudge(c.id)} disabled={nudging === c.id}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-flame-600 text-white text-xs font-bold disabled:opacity-50">
              {nudging === c.id ? <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Bell className="w-3.5 h-3.5" />}
              Nudge
            </button>
          )}
        </Card>
      ))}
    </div>
  );
}