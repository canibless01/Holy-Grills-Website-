import { Link } from '@/lib/router';
import { HPBadge } from '@/components/hp/HPBadge';
import { formatPrice } from '@/data/menu';
import type { MenuItem } from '@/types';

interface MenuBrowseCardProps {
  item: MenuItem;
}

export function MenuBrowseCard({ item }: MenuBrowseCardProps) {
  return (
    <Link
      to={`/menu/${item.id}`}
      aria-label={`Customize ${item.name}`}
      className={`flex gap-4 rounded-3xl border border-border bg-card p-4 transition-colors hover:border-primary/40 ${!item.isAvailable ? 'opacity-55' : ''}`}
    >
      <img src={item.imageUrl} alt={item.name} className="h-24 w-28 shrink-0 rounded-2xl object-cover sm:h-28 sm:w-36" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{item.category}</p>
            <h3 className="mt-1 font-display text-lg font-bold text-foreground">{item.name}</h3>
          </div>
          <HPBadge value={item.hpValue} variant="available" />
        </div>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm font-bold text-primary">{formatPrice(item.price)}</span>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Customize</span>
        </div>
      </div>
    </Link>
  );
}
