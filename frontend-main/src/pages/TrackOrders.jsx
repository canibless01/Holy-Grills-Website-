import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Check, Flame, Package, Clock, AlertCircle } from 'lucide-react';
import { mockApi } from '@/lib/mockApi';
import { isAuthenticated } from '@/lib/apiClient';
import { formatNaira, formatDateTime, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, ORDER_STATUS_FLOW } from '@/lib/hgUtils';
import LoadingSpinner from '@/components/LoadingSpinner';

// Normalise an active order so order_items is always a safe array with name_snapshot.
const normActiveOrder = (o) => {
  if (!o) return o;
  const items = (o.order_items || o.items || []).map((it) => ({
    ...it,
    name_snapshot: it.name_snapshot || it.name || 'Item',
    quantity: it.quantity || 1,
  }));
  return { ...o, order_items: items, total_amount: o.total_amount ?? o.total ?? 0, created_at: o.created_at || o.created_date };
};

/**
 * TrackOrders — shows every active order together, each with its own
 * individual progress timeline. Orders placed at different times may not
 * progress at the same rate, so each gets its own indicator rather than a
 * single merged summary.
 */
export default function TrackOrders() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [activeOrders, setActiveOrders] = useState([]);

  useEffect(() => {
    const load = async () => {
      if (!isAuthenticated()) { setSessionExpired(true); setLoading(false); return; }
      try {
        const active = await mockApi.orders.getActive().catch(() => []);
        const arr = Array.isArray(active) ? active : (active?.orders || []);
        setActiveOrders(arr.map(normActiveOrder));
      } catch (e) {
        if (e?.status === 401) setSessionExpired(true);
        else console.error(e);
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner label="Loading active orders..." />;

  if (sessionExpired) {
    return (
      <div className="space-y-4 animate-fade-in pb-4">
        <button onClick={() => navigate('/orders')} className="flex items-center gap-1 text-sm text-cocoa-500">
          <ChevronLeft className="w-4 h-4" /> Back to orders
        </button>
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-6 text-center">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h3 className="font-heading font-bold text-base text-cocoa-800 mb-1">Session expired</h3>
          <p className="text-sm text-cocoa-500 mb-4">Please log in again to track your orders.</p>
          <button onClick={() => navigate('/login')} className="px-5 py-2.5 rounded-full flame-gradient text-white text-xs font-bold">Log in again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-4">
      <button onClick={() => navigate('/orders')} className="flex items-center gap-1 text-sm text-cocoa-500">
        <ChevronLeft className="w-4 h-4" /> Back to orders
      </button>

      <div>
        <h1 className="font-heading font-extrabold text-2xl text-foreground">Track Orders</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{activeOrders.length} active order{activeOrders.length !== 1 ? 's' : ''} in progress</p>
      </div>

      {activeOrders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-12 h-12 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No active orders right now.</p>
          <button onClick={() => navigate('/menu')} className="mt-4 px-5 py-2.5 rounded-full flame-gradient text-white text-xs font-bold">Order now</button>
        </div>
      ) : (
        <div className="space-y-4">
          {activeOrders.map((order) => {
            const statusIndex = ORDER_STATUS_FLOW.indexOf(order.status);
            return (
              <div key={order.id} className="rounded-2xl bg-card border border-border overflow-hidden shadow-cart-card">
                {/* Order header */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-br from-cocoa-700 to-cocoa-900 text-white">
                  <div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${ORDER_STATUS_COLORS[order.status]}`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                    <div className="text-xs text-cocoa-300 mt-1">#{order.id.toUpperCase()}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-heading font-bold text-sm">{formatNaira(order.total_amount)}</div>
                    <div className="text-[10px] text-cocoa-300 flex items-center gap-1 justify-end mt-0.5">
                      <Clock className="w-3 h-3" /> {formatDateTime(order.created_at)}
                    </div>
                  </div>
                </div>

                {/* Individual progress timeline */}
                {order.status !== 'cancelled' && order.status !== 'refunded' && (
                  <div className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      {ORDER_STATUS_FLOW.map((step, i) => (
                        <React.Fragment key={step}>
                          <div className={`flex flex-col items-center ${i <= statusIndex ? 'text-flame-600' : 'text-cocoa-300'}`}>
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${i <= statusIndex ? 'flame-gradient text-white' : 'bg-cocoa-100 text-cocoa-400'}`}>
                              {i < statusIndex ? <Check className="w-3.5 h-3.5 text-white" /> : i + 1}
                            </div>
                            <span className="text-[8px] mt-1 font-semibold whitespace-nowrap">{ORDER_STATUS_LABELS[step].split(' ')[0]}</span>
                          </div>
                          {i < ORDER_STATUS_FLOW.length - 1 && (
                            <div className={`flex-1 h-0.5 ${i < statusIndex ? 'bg-flame-500' : 'bg-cocoa-200'}`} />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}

                {/* Items preview */}
                <div className="px-4 pb-3">
                  <div className="flex flex-wrap gap-1.5">
                    {order.order_items.slice(0, 3).map((item, i) => (
                      <span key={i} className="text-[11px] text-muted-foreground bg-cocoa-50 px-2 py-1 rounded-md">
                        {item.quantity}× {item.name_snapshot}
                      </span>
                    ))}
                    {order.order_items.length > 3 && (
                      <span className="text-[11px] text-muted-foreground bg-cocoa-50 px-2 py-1 rounded-md">+{order.order_items.length - 3}</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className="w-full py-2.5 text-xs font-bold text-flame-600 border-t border-border hover:bg-flame-50 transition-colors"
                >
                  View details →
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}