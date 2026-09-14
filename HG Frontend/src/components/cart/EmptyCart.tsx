import { ShoppingBag } from 'lucide-react';
import { Link } from '@/lib/router';

export function EmptyCart() {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card/60 px-6 py-16 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
        <ShoppingBag size={28} className="text-muted-foreground" />
      </div>
      <h2 className="font-display text-xl font-bold text-foreground">Your cart is empty</h2>
      <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
        Browse the menu, save items for later, and come back when you&apos;re ready to check out.
      </p>
      <Link to="/menu" className="mt-6 inline-flex rounded-2xl bg-gradient-fire px-6 py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90">
        Browse menu
      </Link>
    </div>
  );
}
