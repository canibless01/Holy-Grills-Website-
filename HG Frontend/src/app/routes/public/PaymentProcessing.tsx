import { useEffect } from 'react';
import { useLocation, useNavigate } from '@/lib/router';
import { Loader2 } from 'lucide-react';
import { processPayment } from '@/lib/api/payments';

type PaymentState = {
  total: number;
  method: 'delivery' | 'pickup';
  hp: number;
};

const PaymentProcessingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as PaymentState | null;

  useEffect(() => {
    if (!state) {
      navigate('/checkout', { replace: true });
      return;
    }
    let active = true;
    const run = async () => {
      try {
        const result = await processPayment(state);
        if (!active) return;
        navigate('/payment/success', { replace: true, state: result });
      } catch {
        navigate('/checkout', { replace: true });
      }
    };
    run();
    return () => { active = false; };
  }, [state, navigate]);

  if (!state) return null;

  return (
    <main className="flex-1 md:pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-xl">
        <div className="bg-card border border-border rounded-2xl shadow-card p-8 md:p-10 flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <Loader2 size={28} className="animate-spin" />
          </div>
          <h1 className="font-display font-bold text-foreground text-2xl">Processing payment</h1>
          <p className="text-sm text-muted-foreground font-body max-w-md">
            Hang tight while we confirm your {state.method === 'delivery' ? 'delivery' : 'pickup'} payment.
            Please don’t close this window.
          </p>
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-lg border border-border bg-secondary/50 p-4 text-left">
              <p className="text-xs text-muted-foreground font-body mb-1">Amount</p>
              <p className="text-lg font-display font-bold text-foreground">₦{state.total.toLocaleString()}</p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/50 p-4 text-left">
              <p className="text-xs text-muted-foreground font-body mb-1">Method</p>
              <p className="text-lg font-display font-bold text-foreground capitalize">{state.method}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground font-body">You’ll earn +{state.hp} HP after confirmation.</p>
        </div>
      </div>
    </main>
  );
};

export default PaymentProcessingPage;
