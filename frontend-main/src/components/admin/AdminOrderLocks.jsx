import React, { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import { liveApi as mockApi } from '@/lib/liveApi';
import { formatDateTime } from '@/lib/hgUtils';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Pill } from './AdminShared';

const STATUS_TONES = { active: 'green', used: 'blue', expired: 'red', cancelled: 'cocoa', redeemed: 'blue' };

// GET /order-locks/admin/all — returns every order lock across all users joined
// with the profile (full_name, email, phone). Read-only admin view; locks are
// created/cancelled by students. Filters mirror the backend's status + date params.
export default function AdminOrderLocks() {
  const [locks, setLocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (status) params.status = status;
      if (date) params.date = date;
      setLocks(await mockApi.admin.getOrderLocks(params));
    } catch { setLocks([]); }
    setLoading(false);
  };
  useEffect(() => { load(); }, [status, date]);

  if (loading) return <LoadingSpinner label="Loading order locks..." />;

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-cocoa-50 border border-cocoa-100 p-3 text-xs text-cocoa-500 flex items-center gap-2">
        <Lock className="w-4 h-4 text-flame-600 shrink-0" /> Order locks let students hold a discount for a future order. Locks auto-expire; this view shows every lock across all users.
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-4 py-2.5 rounded-xl border border-cocoa-200 text-sm font-semibold text-cocoa-700 focus:outline-none focus:border-flame-400">
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="used">Used</option>
          <option value="expired">Expired</option>
          <option value="cancelled">Cancelled</option>
          <option value="redeemed">Redeemed</option>
        </select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="px-4 py-2.5 rounded-xl border border-cocoa-200 text-sm font-semibold text-cocoa-700 focus:outline-none focus:border-flame-400" />
      </div>
      {locks.length === 0 ? (
        <div className="text-center py-12 text-cocoa-400"><Lock className="w-8 h-8 mx-auto mb-2 text-cocoa-200" /> No order locks found</div>
      ) : (
        <div className="space-y-2">
          {locks.map((l) => {
            const name = l.full_name || l.user_name || (l.user && l.user.full_name) || '—';
            const email = l.user_email || l.email || (l.user && l.user.email) || '';
            const phone = l.user_phone || l.phone || (l.user && l.user.phone) || '';
            const contact = [email, phone].filter(Boolean).join(' · ') || '—';
            return (
              <div key={l.id} className="rounded-2xl bg-white border border-cocoa-100 p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-cocoa-800">{name}</span>
                    <Pill tone={STATUS_TONES[l.status] || 'cocoa'}>{l.status || 'active'}</Pill>
                    {l.reward_type === 'hp' && l.reward_hp_amount != null && <Pill tone="flame">+{l.reward_hp_amount} HP</Pill>}
                    {l.discount_pct != null && <Pill tone="flame">{l.discount_pct}% off</Pill>}
                  </div>
                  <div className="text-xs text-cocoa-400 truncate">{contact}</div>
                  <div className="text-[11px] text-cocoa-400">Locked for {l.locked_date || '—'} · Created {formatDateTime(l.created_at)}{l.reschedule_count > 0 ? ` · rescheduled ${l.reschedule_count}×` : ''}</div>
                </div>
                {l.order_id && <span className="text-[11px] font-mono text-cocoa-400 shrink-0">#{String(l.order_id).slice(0, 8).toUpperCase()}</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}