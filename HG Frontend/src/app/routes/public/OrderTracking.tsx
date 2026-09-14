import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Flame, MapPin, Phone, RotateCcw, Search, Star } from 'lucide-react';
import { Link, useNavigate, useParams } from '@/lib/router';
import { CountdownTimer } from '@/components/orders/CountdownTimer';
import { StatusBar } from '@/components/orders/StatusBar';
import { HPBadge } from '@/components/hp/HPBadge';
import { StatusStrip } from '@/components/shared/StatusStrip';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatPrice } from '@/data/menu';
import type { OrderStatus } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import { getOrderById, submitOrderReview, claimGuestOrder } from '@/services/api/order.service';

const GuestOrderLookup = () => {
  const [orderId, setOrderId] = useState('');
  const navigate = useNavigate();

  const handleLookup = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = orderId.trim();
    if (!trimmed) return;
    navigate(`/orders/${trimmed}`);
  };

  return (
    <main className="flex flex-1 items-center justify-center pb-12 md:pt-24">
      <div className="container mx-auto max-w-sm px-4">
        <div className="space-y-6 rounded-2xl border border-border bg-card p-8 text-center shadow-card">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Search size={28} className="text-primary" />
          </div>
          <div className="space-y-1">
            <h1 className="font-display text-xl font-bold text-foreground">Track Your Order</h1>
            <p className="text-sm text-muted-foreground">Enter your Order ID to view the current status.</p>
          </div>
          <form onSubmit={handleLookup} className="space-y-3 text-left">
            <label className="text-xs text-muted-foreground">Order ID</label>
            <input
              type="text"
              value={orderId}
              onChange={(event) => setOrderId(event.target.value)}
              placeholder="e.g. ORD-002"
              required
              className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-gradient-fire py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Track Order
            </button>
          </form>
          <p className="text-xs text-muted-foreground">
            Have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>{' '}
            for full order history.
          </p>
        </div>
      </div>
    </main>
  );
};

import { toast } from 'sonner';

const OrderTrackingPage = () => {
  const { id } = useParams<{ id: string }>();
  const claimToken = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('claim_token') || undefined : undefined;
  const { isAuthenticated } = useAuthStore();
  const [isClaiming, setIsClaiming] = useState(false);

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id, claimToken],
    queryFn: () => getOrderById(id || '', claimToken),
    enabled: Boolean(id),
  });

  const handleClaim = async () => {
    if (!id || !claimToken) return;
    setIsClaiming(true);
    try {
      await claimGuestOrder(id, claimToken);
      toast.success('Order claimed successfully!');
    } catch {
      toast.error('Order is already owned or claimed');
    } finally {
      setIsClaiming(false);
    }
  };

  if (!isAuthenticated && !id) {
    return <GuestOrderLookup />;
  }

  if (isLoading) {
    return (
      <main className="flex-1 pb-12 md:pt-24">
        <div className="container mx-auto max-w-3xl px-4">
          <p className="text-sm text-muted-foreground">Loading order…</p>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="flex-1 pb-12 md:pt-24">
        <div className="container mx-auto max-w-3xl px-4">
          <EmptyState
            icon={MapPin}
            title="Order not found"
            description="We couldn't find that order tracking record. Try opening it again from your orders list."
            ctaLabel="Back to orders"
            ctaTo="/orders"
          />
        </div>
      </main>
    );
  }

  const [kitchenRating, setKitchenRating] = useState(5);
  const [riderRating, setRiderRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const handleReviewSubmit = async () => {
    if (!order?.id) return;
    setIsSubmittingReview(true);
    try {
      await submitOrderReview(order.id, {
        rating: Math.round((kitchenRating + riderRating) / 2),
        kitchen_rating: kitchenRating,
        rider_rating: riderRating,
        comment: reviewComment,
      });
      toast.success('Thank you for your feedback!');
    } catch {
      toast.error('Failed to submit review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const timestamps = order.statusHistory.reduce((accumulator, event) => {
    accumulator[event.status] = event.timestamp;
    return accumulator;
  }, {} as Partial<Record<OrderStatus, string>>);
  const showTimers = order.status === 'preparing' || order.status === 'out_for_delivery';
  const isDelivered = order.status === 'delivered';

  return (
    <main className="flex-1 pb-12 md:pt-24">
      <div className="container mx-auto max-w-4xl space-y-6 px-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link
              to={isAuthenticated ? '/dashboard' : '/orders'}
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
            >
              <ArrowLeft size={14} /> {isAuthenticated ? 'Back to dashboard' : 'Back to orders'}
            </Link>
            <h1 className="mt-2 font-display text-3xl font-bold text-foreground">Track order #{order.id}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Status-driven tracking, prep countdowns, rider details, and reorder actions all live here.
            </p>
          </div>
          {isDelivered ? <HPBadge value={order.hpEarned} size="lg" variant="earned" /> : null}
        </div>

        <StatusStrip compact />

        <div className="rounded-[2rem] border border-border bg-card p-6">
          <StatusBar currentStatus={order.status} timestamps={timestamps} />
        </div>

        {showTimers ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[2rem] border border-border bg-card p-6">
              <p className="mb-4 text-sm font-semibold text-foreground">Realtime delivery countdown</p>
              <CountdownTimer etaTimestamp={order.estimatedDelivery} />
            </div>
            {order.prepDeadline ? (
              <div className="rounded-[2rem] border border-border bg-card p-6">
                <p className="mb-4 text-sm font-semibold text-foreground">Preparation timer</p>
                <CountdownTimer etaTimestamp={order.prepDeadline} />
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-[1.05fr,0.95fr]">
          <div className="space-y-4">
            <div className="rounded-[2rem] border border-border bg-card p-5">
              <h2 className="font-display text-xl font-bold text-foreground">Order items</h2>
              <div className="mt-4 space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-secondary/50 p-3">
                    <img src={item.imageUrl} alt={item.name} className="h-14 w-14 rounded-2xl object-cover" />
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-border bg-card p-5">
              <h2 className="font-display text-xl font-bold text-foreground">Payment summary</h2>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="text-foreground">{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery</span>
                  <span className="text-foreground">{formatPrice(order.deliveryFee)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 font-bold text-foreground">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[2rem] border border-border bg-card p-5">
              <h2 className="font-display text-xl font-bold text-foreground">Rider info</h2>
              {order.rider ? (
                <div className="mt-4 space-y-3 text-sm">
                  <div className="rounded-2xl bg-secondary/50 p-4">
                    <p className="font-semibold text-foreground">{order.rider.name}</p>
                    <p className="mt-1 text-muted-foreground">{order.rider.vehicle}</p>
                    <p className="mt-1 text-muted-foreground">ETA: {order.rider.etaMinutes} mins</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`tel:${order.rider.phone}`}
                      className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
                    >
                      <Phone size={14} /> Call rider
                    </Link>
                    <Link
                      to="/support"
                      className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground"
                    >
                      <MapPin size={14} /> Contact support
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                  Rider assignment will appear here once dispatch confirms the order.
                </p>
              )}
            </div>

            <div className="rounded-[2rem] border border-border bg-card p-5">
              <h2 className="font-display text-xl font-bold text-foreground">Next actions</h2>
              <div className="mt-4 space-y-3">
                {claimToken && isAuthenticated ? (
                  <button
                    onClick={handleClaim}
                    disabled={isClaiming}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-fire px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {isClaiming ? 'Claiming...' : 'Claim this order to your account'}
                  </button>
                ) : null}

                <Link
                  to="/menu"
                  className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
                >
                  <RotateCcw size={16} /> Reorder this basket
                </Link>
                {isDelivered ? (
                  <div className="space-y-3 rounded-2xl border border-border p-4 bg-secondary/30">
                    <p className="text-sm font-semibold text-foreground flex items-center gap-1.5"><Star size={16} className="text-amber-500" /> Rate your meal & delivery</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Kitchen ({kitchenRating}★)</span>
                        <input type="range" min="1" max="5" value={kitchenRating} onChange={(e) => setKitchenRating(Number(e.target.value))} className="w-full accent-primary" />
                      </div>
                      <div>
                        <span className="text-muted-foreground">Rider ({riderRating}★)</span>
                        <input type="range" min="1" max="5" value={riderRating} onChange={(e) => setRiderRating(Number(e.target.value))} className="w-full accent-primary" />
                      </div>
                    </div>
                    <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="Write a comment..." className="w-full rounded-xl border border-border bg-background p-2 text-xs text-foreground" rows={2} />
                    <button onClick={handleReviewSubmit} disabled={isSubmittingReview} className="w-full rounded-xl bg-primary py-2 text-xs font-semibold text-primary-foreground">
                      {isSubmittingReview ? 'Submitting...' : 'Submit review for +30 HP'}
                    </button>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-secondary/60 p-4 text-sm text-muted-foreground">
                    Review prompt unlocks automatically after delivery confirmation.
                  </div>
                )}
                {isDelivered ? (
                  <div className="rounded-2xl bg-success/10 p-4 text-sm text-success">
                    <Flame size={16} className="mb-2" /> Nice. This order credited +{order.hpEarned} HP.
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default OrderTrackingPage;
