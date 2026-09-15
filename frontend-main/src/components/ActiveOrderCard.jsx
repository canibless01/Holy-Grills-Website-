import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import { mockApi } from '@/lib/mockApi';
import { useHolyGrill } from '@/lib/HolyGrillContext';
import { ORDER_STATUS_LABELS } from '@/lib/hgUtils';

/**
 * ActiveOrderCard — compact horizontal stat card for the Home quick-stats grid.
 * Shows the status of the user's most recent active order, or a "Start one" CTA.
 * Auth only — guests don't see it.
 */
export default function ActiveOrderCard() {
  const { isAuthenticated } = useHolyGrill();
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    let cancelled = false;
    const load = async () => {
      try {
        const orders = await mockApi.orders.getActive();
        if (cancelled) return;
        setActive(Array.isArray(orders) && orders.length ? orders[0] : null);
      } catch { /* ignore */ }
      if (!cancelled) setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  const value = loading
    ? '—'
    : active
      ? (ORDER_STATUS_LABELS[active.status] || 'Active')
      : 'No order';
  const label = active ? 'Track Order' : 'Start one →';
  const to = active ? '/track-orders' : '/menu';

  return (
    <Link to={to} className="flex items-center gap-2.5 rounded-xl bg-white border border-cocoa-100 px-3 py-2.5 hover:border-flame-200 transition-colors">
      <Package className="w-4 h-4 text-flame-600 shrink-0" />
      <div className="min-w-0">
        <div className="font-heading font-bold text-base text-cocoa-800 leading-tight truncate">{value}</div>
        <div className="text-[10px] text-cocoa-400 font-medium leading-tight">{label}</div>
      </div>
    </Link>
  );
}