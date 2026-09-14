import { Link } from '@/lib/router';
import { ArrowRight, Package } from 'lucide-react';
import { HPBadge } from '@/components/hp/HPBadge';
import { formatPrice } from '@/data/menu';
import type { Order } from '@/types';

const statusConfig: Record<string, { label: string; color: string }> = {
  placed: { label: 'Placed', color: 'bg-muted text-muted-foreground' },
  confirmed: { label: 'Confirmed', color: 'bg-primary/10 text-primary' },
  preparing: { label: 'Preparing', color: 'bg-accent/10 text-accent' },
  out_for_delivery: { label: 'On the way', color: 'bg-primary/10 text-primary' },
  delivered: { label: 'Delivered', color: 'bg-success/10 text-success' },
};

interface OrderCardProps {
  order: Order;
  showCustomer?: boolean;
}

export function OrderCard({ order, showCustomer }: OrderCardProps) {
  const config = statusConfig[order.status] || statusConfig.placed;
  const itemNames = order.items.map((i) => `${i.quantity}× ${i.name}`).join(', ');

  return (
    <Link
      to={`/orders/${order.id}`}
      className="group block bg-card rounded-lg border border-border p-4 hover:border-primary/30 transition-all hover:shadow-glow/5"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
          <Package size={18} className="text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-body font-semibold text-foreground text-sm">#{order.id}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-body font-medium ${config.color}`}>
              {config.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground font-body truncate">{itemNames}</p>
          {showCustomer && (
            <p className="text-[10px] text-muted-foreground/70 font-body mt-0.5">
              {order.address.phone} · {order.address.streetAddress}
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <span className="font-body font-bold text-foreground text-sm">{formatPrice(order.total)}</span>
          <p className="text-[10px] text-muted-foreground font-body mt-0.5">
            {new Date(order.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <ArrowRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors mt-1 shrink-0" />
      </div>
      {order.status === 'delivered' && order.hpEarned > 0 && (
        <div className="mt-2 pt-2 border-t border-border">
          <HPBadge value={order.hpEarned} size="sm" variant="earned" />
        </div>
      )}
    </Link>
  );
}
