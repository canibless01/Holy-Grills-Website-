import React from 'react';
import { Package, Clock, Zap, Lock, ShieldCheck } from 'lucide-react';

// Read-only, visual snapshot of kitchen limits. Kitchen staff can VIEW these
// via /kitchen/settings but cannot change them — capacity, window limits and
// auto-accept are admin-only. Shown as a compact stat grid (no long prose).
export default function KitchenSettings({ settings, capacity }) {
  const s = settings || {};
  const accepting = s.is_accepting_orders !== false && !s.is_closed_for_day;
  const cards = [
    { icon: Package, label: 'Daily Capacity', value: s.daily_order_capacity != null ? s.daily_order_capacity : '∞', tone: 'text-flame-600' },
    { icon: Package, label: 'Window Capacity', value: s.window_capacity != null ? s.window_capacity : '∞', tone: 'text-amber-600' },
    { icon: Zap, label: 'Auto-Accept', value: (s.auto_accept_orders != null ? s.auto_accept_orders : s.auto_assign_riders) ? 'On' : 'Off', tone: 'text-emerald-600' },
    { icon: Clock, label: 'Opens', value: s.ordering_window_open_time || '—', tone: 'text-cocoa-700' },
    { icon: Clock, label: 'Closes', value: s.ordering_window_close_time || '—', tone: 'text-cocoa-700' },
    { icon: Clock, label: 'Prep Target', value: s.avg_prep_target_minutes != null ? `${s.avg_prep_target_minutes}m` : '—', tone: 'text-blue-600' },
  ];
  const usagePct = s.daily_order_capacity ? Math.min(100, ((capacity?.orders_today ?? 0) / s.daily_order_capacity) * 100) : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-2xl bg-cream-100 border border-cocoa-200 px-3 py-2">
        <ShieldCheck className="w-4 h-4 text-cocoa-500 shrink-0" />
        <span className="text-xs font-semibold text-cocoa-600">Admin-managed · read-only</span>
        <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-md ${accepting ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
          {accepting ? 'Open' : 'Paused'}
        </span>
      </div>

      {capacity && (
        <div className="rounded-2xl bg-white border border-cocoa-100 p-4 shadow-selected-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-cocoa-600">Today's Usage</span>
            <span className="text-xs font-bold text-cocoa-800">{capacity.orders_today ?? 0} / {s.daily_order_capacity ?? '∞'}</span>
          </div>
          <div className="h-2 rounded-full bg-cocoa-100 overflow-hidden">
            <div className="h-full flame-gradient transition-all" style={{ width: `${usagePct}%` }} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl bg-white border border-cocoa-100 p-3 shadow-selected-soft relative">
            <Lock className="w-3 h-3 text-cocoa-300 absolute top-2.5 right-2.5" />
            <c.icon className={`w-4 h-4 ${c.tone} mb-1.5`} />
            <div className="font-heading font-extrabold text-base text-cocoa-800 leading-none">{c.value}</div>
            <div className="text-[10px] text-cocoa-400 font-semibold uppercase tracking-wide mt-1">{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}