import { Flame } from 'lucide-react';
import { formatPrice } from '@/data/menu';

interface CartSummaryProps {
  subtotal: number;
  deliveryFee: number;
  promoDiscount: number;
  hpRedemption: number;
  total: number;
  hpToEarn: number;
  onCheckout: () => void;
  isCheckoutDisabled?: boolean;
  checkoutLabel?: string;
}

export function CartSummary({
  subtotal,
  deliveryFee,
  promoDiscount,
  hpRedemption,
  total,
  hpToEarn,
  onCheckout,
  isCheckoutDisabled,
  checkoutLabel = 'Checkout',
}: CartSummaryProps) {
  return (
    <div className="sticky top-24 space-y-4 rounded-3xl border border-border bg-card p-5">
      <h3 className="font-display text-lg font-bold text-foreground">Checkout summary</h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span className="text-foreground">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Delivery fee</span>
          <span className="text-foreground">{formatPrice(deliveryFee)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Promo savings</span>
          <span className="text-success">-{formatPrice(promoDiscount)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>HP redemption</span>
          <span className="text-success">-{formatPrice(hpRedemption)}</span>
        </div>
        <div className="flex justify-between border-t border-border pt-3 text-base font-bold text-foreground">
          <span>Pay now</span>
          <span className="text-primary">{formatPrice(total)}</span>
        </div>
      </div>

      <div className="rounded-2xl bg-accent/10 px-3 py-2 text-xs font-medium text-accent">
        <div className="flex items-center gap-2">
          <Flame size={16} /> +{hpToEarn} HP projected on this order
        </div>
      </div>

      <button
        onClick={onCheckout}
        disabled={isCheckoutDisabled}
        className="w-full rounded-2xl bg-gradient-fire py-3 text-base font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {checkoutLabel} — {formatPrice(total)}
      </button>
    </div>
  );
}
