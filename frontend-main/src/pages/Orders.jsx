import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Package, Flame, Search } from 'lucide-react';
import { mockApi } from '@/lib/mockApi';
import { useHolyGrill } from '@/lib/HolyGrillContext';
import { formatNaira, timeAgo, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/hgUtils';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Orders() {
  const navigate = useNavigate();
  const { isAuthenticated } = useHolyGrill();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [dateFilter, setDateFilter] = useState('all');
  const [trackId, setTrackId] = useState('');
  const [tracking, setTracking] = useState(false);
  const [guestOrders, setGuestOrders] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);

  useEffect(() => {
    const load = async () => {
      if (isAuthenticated) {
        try {
          const [all, active] = await Promise.all([
            mockApi.orders.list({ limit: 20 }),
            mockApi.orders.getActive().catch(() => []),
          ]);
          setOrders(all);
          setActiveOrders(active);
        } catch (e) { console.error(e); }
      } else {
        try { setGuestOrders(JSON.parse(localStorage.getItem('hg_guest_orders') || '[]')); } catch { /* ignore */ }
      }
      setLoading(false);
    };
    load();
  }, [isAuthenticated]);

  const handleTrack = () => {
    if (!trackId.trim()) return;
    setTracking(true);
    const id = trackId.trim().toUpperCase();
    const guestOrder = guestOrders.find(g => g.id?.toUpperCase() === id);
    navigate(guestOrder?.claim_token ? `/orders/${guestOrder.id}?claim_token=${guestOrder.claim_token}` : `/orders/${id}`);
    setTracking(false);
  };

  if (loading) return <LoadingSpinner label="Loading orders..." />;

  // Guest view: track-order form + recent guest orders from this device
  if (!isAuthenticated) {
    return (
      <div className="space-y-5 animate-fade-in">
        <h1 className="font-heading font-extrabold text-2xl text-foreground">Track Order</h1>

        {/* Track by order ID */}
        <div className="rounded-menu bg-card border border-border p-4 shadow-cart-card">
          <div className="flex items-center gap-2 mb-2">
            <Search className="w-4 h-4 text-primary" />
            <h2 className="hg-section-title">Track Your Order</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-3">Enter your order ID to track its status in real-time.</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={trackId}
              onChange={(e) => setTrackId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
              placeholder="e.g., ORD-ABC123"
              className="flex-1 p-3 rounded-xl border border-border text-sm focus:outline-none focus:border-primary bg-card"
            />
            <button
              onClick={handleTrack}
              disabled={!trackId.trim() || tracking}
              className="px-5 rounded-button flame-gradient text-white text-sm font-bold disabled:opacity-40"
            >
              {tracking ? '...' : 'Track'}
            </button>
          </div>
        </div>

        {/* Recent guest orders from this device */}
        {guestOrders.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">Recent Orders</h2>
            <div className="space-y-2">
              {guestOrders.map((g, i) => (
                <button
                  key={i}
                  onClick={() => navigate(g.claim_token ? `/orders/${g.id}?claim_token=${g.claim_token}` : `/orders/${g.id}`)}
                  className="w-full text-left rounded-menu bg-card border border-border p-3 shadow-cart-card hover:shadow-selected-soft transition-shadow"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-muted-foreground">#{(g.id || '').toUpperCase()}</span>
                    <span className="text-xs text-muted-foreground">{timeAgo(g.created_at)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold text-foreground">{formatNaira(g.total || 0)}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sign-in prompt */}
        <div className="rounded-menu bg-primary/5 border border-primary/20 p-4 text-center">
          <p className="text-sm text-foreground mb-1">Want to see all your order history?</p>
          <button onClick={() => navigate('/login')} className="text-sm font-bold text-primary">Sign in →</button>
        </div>
      </div>
    );
  }

  // Authenticated view: existing order list
  const now = Date.now();
  const dateCutoff = (range) => {
    if (range === '7d') return now - 7 * 86400000;
    if (range === '30d') return now - 30 * 86400000;
    if (range === '90d') return now - 90 * 86400000;
    return 0;
  };
  const inDateRange = (o) => new Date(o.created_at).getTime() >= dateCutoff(dateFilter);
  const liveActive = activeOrders.length > 0
    ? activeOrders
    : orders.filter(o => !['delivered', 'cancelled', 'refunded'].includes(o.status));
  const pastOrders = orders.filter(o => ['delivered', 'cancelled', 'refunded'].includes(o.status) && inDateRange(o));

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-heading font-extrabold text-2xl text-foreground">My Orders</h1>
        <button
          onClick={() => navigate('/track-orders')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full flame-gradient text-white text-xs font-bold shadow-selected-soft active:scale-95 transition-transform"
        >
          <Package className="w-3.5 h-3.5" /> Track Orders
        </button>
      </div>

      {/* Date Filter Pills */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
        {[
          { id: 'all', label: 'All Time' },
          { id: '7d', label: 'Last 7 Days' },
          { id: '30d', label: 'Last Month' },
          { id: '90d', label: 'Last 3 Months' },
        ].map(d => (
          <button
            key={d.id}
            onClick={() => setDateFilter(d.id)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-pill text-xs font-bold transition-all ${
              dateFilter === d.id ? 'bg-cocoa-800 text-white' : 'bg-card text-muted-foreground border border-border'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Active Orders */}
      {liveActive.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">Active Orders</h2>
          <div className="space-y-2">
            {liveActive.map(order => (
              <OrderCard key={order.id} order={order} onClick={() => navigate(`/orders/${order.id}`)} active />
            ))}
          </div>
        </div>
      )}

      {/* Past Orders */}
      <div>
        {pastOrders.length > 0 && (
          <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">Past Orders</h2>
        )}
        {pastOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No past orders found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pastOrders.map(order => (
              <OrderCard key={order.id} order={order} onClick={() => navigate(`/orders/${order.id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderCard({ order, onClick, active = false }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-menu border p-3 transition-all hover:shadow-cart-card ${
        active ? 'bg-primary/5 border-primary/30' : 'bg-card border-border'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-pill ${ORDER_STATUS_COLORS[order.status]}`}>
          {ORDER_STATUS_LABELS[order.status]}
        </span>
        <span className="text-xs text-muted-foreground">{timeAgo(order.created_at)}</span>
      </div>
      <div className="flex items-center gap-2 mb-2">
        {(order.order_items || []).slice(0, 3).map((item, i) => (
          <span key={i} className="text-xs text-muted-foreground">
            {item.quantity}× {item.name_snapshot || item.name}{i < Math.min((order.order_items || []).length, 3) - 1 ? ',' : ''}
          </span>
        ))}
        {(order.order_items || []).length > 3 && <span className="text-xs text-muted-foreground">+{(order.order_items || []).length - 3}</span>}
      </div>
      <div className="flex items-center justify-between">
        <span className="font-heading font-bold text-foreground">{formatNaira(order.total_amount)}</span>
        {order.hp_earned > 0 && (
          <span className="flex items-center gap-1 text-xs font-bold text-primary">
            <Flame className="w-3 h-3" />+{order.hp_earned} HP
          </span>
        )}
      </div>
    </button>
  );
}