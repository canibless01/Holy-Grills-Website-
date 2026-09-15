import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import { Package, DollarSign, Activity, CheckCircle2, Flame, TrendingUp, Truck, Clock } from 'lucide-react';
import { liveApi as mockApi } from '@/lib/liveApi';
import { formatNaira } from '@/lib/hgUtils';
import LoadingSpinner from '@/components/LoadingSpinner';

const FLAME = ['#FF4E2D', '#FF6B1A', '#FF9500', '#FFA578', '#D63D20', '#A8301A'];
const STATUS_COLORS = ['#94a3b8', '#f59e0b', '#a855f7', '#3b82f6', '#06b6d4', '#22c55e'];

const todayStr = () => new Date().toISOString().slice(0, 10);
const daysAgoStr = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); };

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [sales, setSales] = useState(null);
  const [users, setUsers] = useState(null);
  const [hp, setHp] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const range = { from_date: daysAgoStr(30), to_date: todayStr() };
    const load = async () => {
      const [d, s, u, h, it] = await Promise.allSettled([
        mockApi.analytics.dashboard(),
        mockApi.analytics.sales(range),
        mockApi.analytics.users(range),
        mockApi.admin.getAnalyticsHp(),
        mockApi.analytics.items(range),
      ]);
      if (!active) return;
      setData(d.status === 'fulfilled' ? d.value : null);
      setSales(s.status === 'fulfilled' ? s.value : null);
      setUsers(u.status === 'fulfilled' ? u.value : null);
      setHp(h.status === 'fulfilled' ? h.value : null);
      setItems(it.status === 'fulfilled' ? (Array.isArray(it.value) ? it.value : (it.value?.items || [])) : []);
      setLoading(false);
    };
    load();
    const interval = setInterval(load, 30000);
    return () => { active = false; clearInterval(interval); };
  }, []);

  if (loading) return <LoadingSpinner label="Building dashboard..." />;
  if (!data) return <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 text-sm text-amber-700">Analytics isn't available right now. The dashboard endpoint requires an admin token.</div>;

  const stats = [
    { label: 'Orders Today', value: data.total_orders ?? data.today?.total_orders ?? 0, icon: Package, color: 'text-flame-600', bg: 'bg-flame-50' },
    { label: 'Revenue Delivered (Today)', value: formatNaira(data.revenue_delivered ?? data.today?.revenue_delivered ?? 0), icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Active Orders', value: data.active_orders ?? data.today?.active_orders ?? 0, icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Delivered Today', value: data.delivered_orders ?? data.today?.delivered_orders ?? 0, icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  const statusData = Object.entries(data.orders_by_status ?? data.today?.orders_by_status ?? {}).map(([name, value], i) => ({ name: name.replace(/_/g, ' '), value, fill: STATUS_COLORS[i % STATUS_COLORS.length] }));
  const paymentData = Object.entries(data.orders_by_payment_method ?? data.today?.orders_by_payment_method ?? {}).map(([name, value]) => ({ name, value }));
  const itemsData = items.slice(0, 6).map((it) => ({ name: (it.name_snapshot || it.item_name || '').replace(/🔥/g, '').trim(), quantity: it.qty_sold ?? it.total_quantity ?? it.quantity ?? 0 }));
  const tierSource = users?.tier_breakdown ?? hp?.tier_distribution ?? {};
  const tierData = Object.entries(tierSource).map(([name, value], i) => ({ name, value, fill: FLAME[i % FLAME.length] }));
  const dps = data.delivery_pipeline ?? {};
  const opsOpenWindows = (dps.open_windows ?? data.open_windows ?? []).length;
  const opsActiveBatches = (dps.active_batches ?? data.active_batches ?? []).length;
  const opsUnassigned = dps.unassigned_orders ?? data.unassigned_orders ?? 0;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-2xl ${s.bg} border border-cocoa-100 p-4`}>
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <div className="font-heading font-extrabold text-xl lg:text-2xl text-cocoa-800">{s.value}</div>
            <div className="text-xs text-cocoa-500 font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* 30d sales aggregate (the spec's /analytics/sales returns a summary, not a daily series) */}
      <div className="rounded-2xl bg-white border border-cocoa-100 p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-cocoa-800 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-flame-600" /> Sales (Last 30 days, delivered)</h3>
          <div className="text-right">
            <div className="font-heading font-extrabold text-lg text-cocoa-800">{formatNaira(sales?.total_revenue ?? 0)}</div>
            <div className="text-xs text-cocoa-400">{sales?.order_count ?? 0} orders · AOV {formatNaira(sales?.average_order_value ?? sales?.avg_order_value ?? 0)}</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="rounded-2xl bg-white border border-cocoa-100 p-5">
          <h3 className="font-bold text-cocoa-800 mb-3">Orders by Status (Today)</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                  {statusData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            {statusData.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.fill }} />
                <span className="capitalize text-cocoa-500">{s.name}</span>
                <span className="font-bold text-cocoa-800 ml-auto">{s.value}</span>
              </div>
            ))}
            {statusData.length === 0 && <span className="text-xs text-cocoa-400">No orders today.</span>}
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-cocoa-100 p-5">
          <h3 className="font-bold text-cocoa-800 mb-3">Payment Methods (Today)</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f0ed" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b4a2e' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6b4a2e' }} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {paymentData.map((_, i) => <Cell key={i} fill={FLAME[i % FLAME.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {paymentData.length === 0 && <p className="text-xs text-cocoa-400 text-center -mt-2">No payments today.</p>}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="rounded-2xl bg-white border border-cocoa-100 p-5">
          <h3 className="font-bold text-cocoa-800 mb-3">Top Items (30d delivered)</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={itemsData} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f0ed" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#6b4a2e' }} />
                <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10, fill: '#6b4a2e' }} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="quantity" radius={[0, 6, 6, 0]} fill="#FF6B1A" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {itemsData.length === 0 && <p className="text-xs text-cocoa-400 text-center -mt-2">No item sales yet.</p>}
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl bg-white border border-cocoa-100 p-5">
            <h3 className="font-bold text-cocoa-800 mb-3">Users by Tier</h3>
            <div className="flex items-center gap-4">
              <div className="h-40 w-40 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={tierData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40} paddingAngle={2}>
                      {tierData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-1.5">
                {tierData.map((t) => (
                  <div key={t.name} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: t.fill }} />
                    <span className="capitalize text-cocoa-500">{t.name}</span>
                    <span className="font-bold text-cocoa-800 ml-auto">{t.value}</span>
                  </div>
                ))}
                {tierData.length === 0 && <span className="text-xs text-cocoa-400">No tier data.</span>}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-cocoa-800 to-cocoa-900 p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-4 h-4 text-flame-500" />
              <h3 className="font-bold text-sm">HP Economy</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><div className="text-cocoa-300 text-xs">Earned (active)</div><div className="font-bold">{(hp?.hp_earned_active ?? 0).toLocaleString()}</div></div>
              <div><div className="text-cocoa-300 text-xs">Spent</div><div className="font-bold">{(hp?.hp_spent ?? 0).toLocaleString()}</div></div>
              <div><div className="text-cocoa-300 text-xs">Expired</div><div className="font-bold text-red-400">{(hp?.hp_expired ?? 0).toLocaleString()}</div></div>
              <div><div className="text-cocoa-300 text-xs">In Circulation</div><div className="font-bold text-flame-400">{(hp?.hp_in_circulation ?? 0).toLocaleString()}</div></div>
            </div>
          </div>
        </div>
      </div>

      {/* Operations snapshot — all from /analytics/dashboard */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white border border-cocoa-100 p-4 flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-600" />
          <div><div className="font-bold text-lg text-cocoa-800">{opsOpenWindows}</div><div className="text-xs text-cocoa-500">Open delivery windows</div></div>
        </div>
        <div className="rounded-2xl bg-white border border-cocoa-100 p-4 flex items-center gap-3">
          <Truck className="w-5 h-5 text-blue-600" />
          <div><div className="font-bold text-lg text-cocoa-800">{opsActiveBatches}</div><div className="text-xs text-cocoa-500">Active batches</div></div>
        </div>
        <div className="rounded-2xl bg-white border border-cocoa-100 p-4 flex items-center gap-3">
          <Package className="w-5 h-5 text-flame-600" />
          <div><div className="font-bold text-lg text-cocoa-800">{opsUnassigned}</div><div className="text-xs text-cocoa-500">Unassigned orders</div></div>
        </div>
      </div>
    </div>
  );
}