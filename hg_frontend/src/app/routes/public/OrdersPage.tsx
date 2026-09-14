import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { Link, useNavigate } from '@/lib/router';
import { useAuthStore } from '@/stores/authStore';
import { getOrders } from '@/services/api/order.service';
import { OrderCard } from '@/components/orders/OrderCard';
import { EmptyState } from '@/components/shared/EmptyState';

const GuestOrderLookup = () => {
  const [orderId, setOrderId] = useState('');
  const navigate = useNavigate();

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = orderId.trim();
    if (!trimmed) return;
    navigate(`/orders/${trimmed}`);
  };

  return (
    <main className="flex-1 md:pt-16 pb-12 flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-sm">
        <div className="bg-card border border-border rounded-2xl shadow-card p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Search size={28} className="text-primary" />
          </div>
          <div className="space-y-1">
            <h1 className="font-display font-bold text-foreground text-xl">Track Your Order</h1>
            <p className="text-sm text-muted-foreground font-body">Enter your Order ID to view status.</p>
          </div>
          <form onSubmit={handleLookup} className="space-y-3 text-left">
            <label className="text-xs text-muted-foreground font-body">Order ID</label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g. ORD-002"
              required
              className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-gradient-fire text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity"
            >
              Track Order
            </button>
          </form>
          <p className="text-xs text-muted-foreground font-body">
            Have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>{' '}
            for full order history.
          </p>
        </div>
      </div>
    </main>
  );
};

const OrdersPage = () => {
  const { isAuthenticated, user } = useAuthStore();
  const { data: allOrders = [], isLoading, isError } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return <GuestOrderLookup />;
  }

  const userOrders = allOrders.filter((order) => !user?.id || order.userId === user.id);

  return (
    <main className="flex-1 md:pt-16 pb-12">
      <div className="container mx-auto px-4 max-w-4xl space-y-6">
        <header>
          <h1 className="font-display font-bold text-foreground text-2xl md:text-3xl">My Orders</h1>
          <p className="text-sm text-muted-foreground font-body">Track your live and past orders.</p>
        </header>

        {isLoading ? <p className="text-sm text-muted-foreground">Loading orders…</p> : null}
        {isError ? <p className="text-sm text-destructive">Could not refresh orders right now.</p> : null}

        <section className="space-y-3">
          {userOrders.length ? (
            userOrders.map((order) => <OrderCard key={order.id} order={order} />)
          ) : (
            <EmptyState
              icon={Search}
              title="No orders yet"
              description="Once you place an order it will appear here with live status updates."
              ctaLabel="Browse menu"
              ctaTo="/menu"
            />
          )}
        </section>
      </div>
    </main>
  );
};

export default OrdersPage;
