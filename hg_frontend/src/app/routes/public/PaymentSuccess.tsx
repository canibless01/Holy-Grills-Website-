import { useEffect } from 'react';
import { useLocation, useNavigate } from '@/lib/router';
import { CheckCircle2, ArrowRight, Flame } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { playUiTone } from '@/utils/sound';

type PaymentState = {
  total?: number;
  method?: 'delivery' | 'pickup';
  hp?: number;
  order?: {
    id: string;
    order_number: string;
    is_scheduled?: boolean;
    scheduled_for?: string;
    delivery_window_start?: string;
    delivery_window_end?: string;
  };
};

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as PaymentState | null;
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    clearCart();
    playUiTone('checkout');
  }, [clearCart]);

  const order = state?.order;
  const isScheduled = Boolean(order?.is_scheduled);

  return (
    <main className="flex-1 md:pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-card border border-border rounded-2xl shadow-card p-8 md:p-10 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-success/15 text-success mx-auto flex items-center justify-center">
            <CheckCircle2 size={32} />
          </div>
          <div className="space-y-1">
            <h1 className="font-display font-bold text-foreground text-3xl">
              {isScheduled ? 'Order scheduled!' : 'Order placed successfully!'}
            </h1>
            {isScheduled ? (
              <p className="text-sm text-amber-700 font-body">
                Today's orders are full — you're scheduled for {order?.scheduled_for ? new Date(order.scheduled_for).toLocaleDateString() : 'the next available date'}, delivery between {order?.delivery_window_start || '18:00'}–{order?.delivery_window_end || '19:00'}.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground font-body">We’ve received your order and started preparing.</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            <div className="rounded-lg border border-border bg-secondary/50 p-4">
              <p className="text-xs text-muted-foreground font-body mb-1">Amount paid</p>
              <p className="text-lg font-display font-bold text-foreground">₦{state.total.toLocaleString()}</p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/50 p-4">
              <p className="text-xs text-muted-foreground font-body mb-1">Method</p>
              <p className="text-lg font-display font-bold text-foreground capitalize">{state.method}</p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/50 p-4 flex items-center gap-2">
              <Flame size={16} className="text-accent" />
              <div>
                <p className="text-xs text-muted-foreground font-body">HP earned</p>
                <p className="text-lg font-display font-bold text-foreground">+{state.hp} HP</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/orders')}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm hover:bg-primary-hover transition-colors"
            >
              Track Order
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => {
                playUiTone('navigate');
                navigate('/menu');
              }}
              className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-secondary text-foreground font-display font-bold text-sm hover:bg-border transition-colors"
            >
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PaymentSuccessPage;
