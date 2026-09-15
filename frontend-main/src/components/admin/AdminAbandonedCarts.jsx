import React, { useState, useEffect } from 'react';
import { ShoppingCart, RefreshCw, Search, Bell } from 'lucide-react';
import { liveApi } from '@/lib/liveApi';
import { formatNaira, formatDateTime } from '@/lib/hgUtils';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toast } from '@/components/ui/use-toast';

const STATUS_TONE = {
  pending: 'bg-amber-100 text-amber-700',
  pending_unrecovered: 'bg-amber-100 text-amber-700',
  recovered: 'bg-green-100 text-green-700',
  exhausted: 'bg-cocoa-100 text-cocoa-600',
  cleared: 'bg-cocoa-100 text-cocoa-400',
};

/**
 * AdminAbandonedCarts — retention panel for carts left at checkout. Lists
 * every cart the cron job flagged, lets admins search/filter by status, see
 * the snapshot of items, and manually fire a recovery nudge (push + in-app).
 * Rider/kitchen have no part in this flow — admin + system only.
 *
 * Backend: GET /admin/abandoned-carts, POST /admin/abandoned-carts/:id/nudge.
 */
export default function AdminAbandonedCarts() {
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(null);

  const load = async () => {
    setLoading(true);
    try { setCarts(await liveApi.admin.getAbandonedCarts()); } catch { setCarts([]); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  // Spec response shape: { id, user_id, full_name, cart_data: { items, subtotal,
  // item_count }, is_recovered, recovery_attempts, last_recovery_sent_at, ... }
  // Normalise into a flat shape so the rest of the component reads one structure.
  const normCart = (c) => {
    const cd = c.cart_data || {};
    const items = c.items || c.cart_items || c.snapshot || cd.items || [];
    return {
      ...c,
      _userName: c.full_name || c.user?.name || c.user_name || 'User',
      _userEmail: c.user?.email || c.user_email || '',
      _items: Array.isArray(items) ? items : [],
      _subtotal: c.subtotal ?? c.total ?? cd.subtotal ?? 0,
      _itemCount: c.item_count ?? cd.item_count ?? (Array.isArray(items) ? items.length : 0),
      _nudges: c.recovery_attempts ?? c.nudges_sent ?? c.nudge_count ?? 0,
      _isRecovered: c.is_recovered === true || c.status === 'recovered',
      _status: c.is_recovered === true ? 'recovered' : (c.status || 'pending'),
    };
  };
  const normalized = carts.map(normCart);

  const filtered = normalized.filter((c) => {
    const okStatus = statusFilter === 'all' || c._status === statusFilter;
    const name = (c._userName || c._userEmail || '').toLowerCase();
    const okQ = !q || name.includes(q.toLowerCase());
    return okStatus && okQ;
  });

  const nudge = async (id) => {
    setBusy(id);
    try { await liveApi.admin.nudgeAbandonedCart(id); toast({ title: '🔔 Recovery nudge sent' }); await load(); }
    catch (e) { toast({ title: 'Nudge failed', description: e.message, variant: 'destructive' }); }
    setBusy(null);
  };

  if (loading) return <LoadingSpinner label="Loading abandoned carts..." />;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-cocoa-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or email" className="w-full pl-9 pr-3 py-2 rounded-xl border border-cocoa-200 text-sm" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="p-2 rounded-xl border border-cocoa-200 text-sm">
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="pending_unrecovered">Pending</option>
          <option value="recovered">Recovered</option>
          <option value="exhausted">Exhausted</option>
          <option value="cleared">Cleared</option>
        </select>
        <button onClick={load} className="p-2 rounded-xl border border-cocoa-200"><RefreshCw className="w-4 h-4 text-cocoa-500" /></button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-10 text-cocoa-400">
          <ShoppingCart className="w-10 h-10 mx-auto mb-2 text-cocoa-200" />
          No abandoned carts found.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => {
            const items = c._items;
            const userName = c._userName;
            return (
              <div key={c.id} className="rounded-2xl bg-white border border-cocoa-100 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-cocoa-800 truncate">{userName}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${STATUS_TONE[c._status] || 'bg-cocoa-100 text-cocoa-500'}`}>{c._status}</span>
                    </div>
                    <div className="text-xs text-cocoa-400 truncate">{c._userEmail}</div>
                    <div className="text-[11px] text-cocoa-400">Last active {formatDateTime(c.last_active_at || c.last_recovery_sent_at || c.updated_at || c.created_at)}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-heading font-bold text-cocoa-800">{formatNaira(c._subtotal)}</div>
                    <div className="text-[10px] text-cocoa-400">{c._nudges} nudge{c._nudges === 1 ? '' : 's'}</div>
                  </div>
                </div>
                {items.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {items.map((it, i) => (
                      <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-cocoa-50 text-cocoa-600">
                        {it.quantity || 1}× {it.name_snapshot || it.name || it.menu_item_name || 'Item'}
                      </span>
                    ))}
                  </div>
                )}
                {c._status === 'pending' && (
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => nudge(c.id)} disabled={busy === c.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-flame-600 text-white text-xs font-bold disabled:opacity-50">
                      <Bell className="w-3.5 h-3.5" /> {busy === c.id ? 'Sending…' : 'Send nudge'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}