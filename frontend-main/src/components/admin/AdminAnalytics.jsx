import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { DollarSign, ShoppingBag, Users, Flame, Download, Calendar } from 'lucide-react';
import { liveApi as mockApi } from '@/lib/liveApi';
import { formatNaira } from '@/lib/hgUtils';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Field } from './AdminShared';

const COLORS = ['#FF4E2D', '#22c55e', '#3b82f6', '#a855f7', '#f59e0b', '#06b6d4'];

const todayStr = () => new Date().toISOString().slice(0, 10);
const daysAgoStr = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); };

export default function AdminAnalytics() {
  const [fromDate, setFromDate] = useState(daysAgoStr(30));
  const [toDate, setToDate] = useState(todayStr());
  const [sales, setSales] = useState(null);
  const [users, setUsers] = useState(null);
  const [hp, setHp] = useState(null);
  const [orders, setOrders] = useState(null);
  const [items, setItems] = useState([]);
  const [retention, setRetention] = useState([]);
  const [exporting, setExporting] = useState(null);
  const [loading, setLoading] = useState(true);

  const range = { from_date: fromDate, to_date: toDate };

  const load = async () => {
    setLoading(true);
    const [s, u, h, o, it, rt] = await Promise.allSettled([
      mockApi.analytics.sales(range),
      mockApi.analytics.users(range),
      mockApi.admin.getAnalyticsHp(),
      mockApi.analytics.orders(range),
      mockApi.analytics.items(range),
      mockApi.analytics.retention({ weeks: 12 }),
    ]);
    setSales(s.status === 'fulfilled' ? s.value : null);
    setUsers(u.status === 'fulfilled' ? u.value : null);
    setHp(h.status === 'fulfilled' ? h.value : null);
    setOrders(o.status === 'fulfilled' ? o.value : null);
    setItems(it.status === 'fulfilled' ? (Array.isArray(it.value) ? it.value : (it.value?.items || [])) : []);
    // /analytics/retention → { cohorts: [{ cohort_week, retained_users, retention_pct, total_users }], weeks }
    setRetention(rt.status === 'fulfilled' ? (Array.isArray(rt.value) ? rt.value : (rt.value?.cohorts || [])) : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [fromDate, toDate]);

  if (loading) return <LoadingSpinner label="Crunching numbers..." />;

  const doExport = async (type) => {
    setExporting(type);
    try {
      const res = await mockApi.admin.exportAnalytics(type, range);
      const rows = res?.rows || (Array.isArray(res) ? res : (res?.items || []));
      if (rows.length) {
        const headers = Object.keys(rows[0]);
        const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `${type}_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
        URL.revokeObjectURL(url);
      }
    } catch (e) { /* ignore */ }
    setExporting(null);
  };

  const EXPORTS = ['orders', 'hp_transactions', 'wallet_transactions', 'users'];
  const funnelRaw = orders?.status_funnel;
  const funnel = Array.isArray(funnelRaw) ? funnelRaw : Object.entries(funnelRaw || {}).map(([name, value]) => ({ name, value }));

  const kpis = [
    { label: 'Revenue (Delivered)', value: formatNaira(sales?.total_revenue ?? 0), sub: `${sales?.order_count ?? 0} delivered orders`, icon: DollarSign, color: 'text-green-600' },
    { label: 'Total Orders', value: orders?.total_orders ?? orders?.total ?? orders?.order_count ?? sales?.order_count ?? 0, sub: `${fromDate} → ${toDate}`, icon: ShoppingBag, color: 'text-flame-600' },
    { label: 'Active Users', value: users?.dau ?? 0, sub: `DAU · MAU ${users?.mau ?? 0}`, icon: Users, color: 'text-blue-600' },
    { label: 'HP in Circulation', value: (hp?.hp_in_circulation ?? 0).toLocaleString(), sub: `Earned ${(hp?.hp_earned_active ?? 0).toLocaleString()} · Spent ${(hp?.hp_spent ?? 0).toLocaleString()}`, icon: Flame, color: 'text-purple-600' },
  ];

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-white border border-cocoa-100 p-4 flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="flex items-center gap-2 text-sm font-bold text-cocoa-700"><Calendar className="w-4 h-4 text-flame-600" /> Date Range</div>
        <div className="flex-1 grid grid-cols-2 gap-3 max-w-md">
          <Field label="From"><input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full mt-1 p-2.5 rounded-xl border border-cocoa-200 text-sm" /></Field>
          <Field label="To"><input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full mt-1 p-2.5 rounded-xl border border-cocoa-200 text-sm" /></Field>
        </div>
        <div className="text-xs text-cocoa-400">AOV {formatNaira(sales?.average_order_value ?? sales?.avg_order_value ?? 0)}</div>
      </div>

      <div className="rounded-2xl bg-white border border-cocoa-100 p-4">
        <h3 className="font-bold text-sm text-cocoa-800 mb-2 flex items-center gap-1.5"><Download className="w-4 h-4 text-flame-600" /> Export (CSV) — {fromDate} to {toDate}</h3>
        <div className="flex flex-wrap gap-2">
          {EXPORTS.map((t) => (
            <button key={t} onClick={() => doExport(t)} disabled={exporting === t} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cocoa-50 text-cocoa-700 text-xs font-bold border border-cocoa-200 disabled:opacity-50">
              <Download className="w-3 h-3" /> {exporting === t ? 'Exporting...' : t.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl bg-white border border-cocoa-100 p-4">
            <k.icon className={`w-5 h-5 ${k.color} mb-2`} />
            <div className="font-heading font-extrabold text-lg text-cocoa-800">{k.value}</div>
            <div className="text-xs text-cocoa-500">{k.label}</div>
            <div className="text-[10px] text-cocoa-400 mt-0.5">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white border border-cocoa-100 p-5">
        <h3 className="font-bold text-cocoa-800 mb-3">Orders by Status (Funnel)</h3>
        {funnel.length === 0 ? <p className="text-xs text-cocoa-400 py-4 text-center">No orders in this range.</p> : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnel.map((f) => ({ name: (f.name || f.status || '').replace(/_/g, ' '), value: f.value ?? f.count ?? 0 }))} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f0ed" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b4a2e' }} angle={-15} textAnchor="end" height={60} interval={0} />
              <YAxis tick={{ fontSize: 11, fill: '#6b4a2e' }} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {funnel.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        )}
      </div>

      <div className="rounded-2xl bg-white border border-cocoa-100 p-5">
        <h3 className="font-bold text-cocoa-800 mb-3">Item Performance (Delivered, 30d)</h3>
        {items.length === 0 ? <p className="text-xs text-cocoa-400 py-4 text-center">No item sales in this range.</p> : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={items.slice(0, 8).map((it) => ({ name: (it.name_snapshot || it.item_name || it.name || '').replace(/🔥/g, '').trim(), revenue: it.total_revenue ?? it.revenue ?? 0 }))} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f0ed" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b4a2e' }} interval={0} angle={-15} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11, fill: '#6b4a2e' }} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} formatter={(v) => formatNaira(v)} />
              <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                {items.slice(0, 8).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        )}
      </div>

      <div className="rounded-2xl bg-white border border-cocoa-100 p-5">
        <h3 className="font-bold text-cocoa-800 mb-3">Cohort Retention (%)</h3>
        {retention.length === 0 ? <p className="text-xs text-cocoa-400 py-4 text-center">No retention data for this range.</p> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-cocoa-400 text-xs border-b border-cocoa-100">
                <th className="text-left py-2 font-semibold">Cohort</th>
                <th className="py-2 font-semibold">Total</th>
                <th className="py-2 font-semibold">Retained</th>
                <th className="py-2 font-semibold">Rate</th>
              </tr>
            </thead>
            <tbody>
              {retention.map((r, i) => (
                <tr key={i} className="border-b border-cocoa-50 last:border-0">
                  <td className="py-2.5 text-cocoa-600 font-semibold">{r.cohort_week || r.cohort || '—'}</td>
                  <td className="text-center py-2.5 text-cocoa-600 font-bold">{r.total_users ?? '—'}</td>
                  <td className="text-center py-2.5 text-amber-600 font-bold">{r.retained_users ?? '—'}</td>
                  <td className="text-center py-2.5 text-green-600 font-bold">{r.retention_pct != null ? `${r.retention_pct}%` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
}