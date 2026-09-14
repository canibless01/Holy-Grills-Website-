'use client';

import { useMemo, useState } from 'react';
import { Plus, Search, Ticket } from 'lucide-react';
import { Link } from '@/lib/router';
import { MARKETPLACE_VENDORS } from '@/services/mocks/platform';

const PURCHASES_KEY = 'holygrill-marketplace-purchases';

function formatNaira(value: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value);
}

function readPurchases() {
  if (typeof window === 'undefined') return [] as Array<{ id: string; title: string; code: string; date: string }>;
  try {
    return JSON.parse(window.localStorage.getItem(PURCHASES_KEY) ?? '[]');
  } catch {
    return [];
  }
}

const MarketplacePage = () => {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'product' | 'digital'>('all');
  const [showPurchases, setShowPurchases] = useState(false);

  const purchases = readPurchases();

  const listings = useMemo(() => {
    return MARKETPLACE_VENDORS.filter((item) => {
      if (filter !== 'all' && (item.listingType ?? 'product') !== filter) return false;
      if (!query.trim()) return true;
      return item.name.toLowerCase().includes(query.toLowerCase());
    });
  }, [filter, query]);

  return (
    <main className="flex-1 pb-12 pt-4 md:pt-24">
      <div className="container mx-auto max-w-5xl space-y-6 px-4">
        <section className="rounded-[2rem] border border-border bg-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Marketplace</p>
              <h1 className="mt-2 font-display text-3xl font-bold text-foreground">Spend HP or cash on drops.</h1>
            </div>
            <button onClick={() => setShowPurchases((value) => !value)} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground">
              <Ticket size={14} /> My purchases ({purchases.length})
            </button>
          </div>

          {showPurchases ? (
            <div className="mt-4 space-y-2 rounded-2xl bg-secondary/50 p-4">
              {!purchases.length ? <p className="text-sm text-muted-foreground">No purchases yet.</p> : purchases.map((purchase) => (
                <div key={purchase.id} className="flex items-center justify-between rounded-xl bg-background p-3 text-sm">
                  <div>
                    <p className="font-semibold text-foreground">{purchase.title}</p>
                    <p className="text-xs text-muted-foreground">{new Date(purchase.date).toLocaleDateString()}</p>
                  </div>
                  <span className="font-mono font-semibold text-primary">{purchase.code}</span>
                </div>
              ))}
            </div>
          ) : null}
        </section>

        <section className="space-y-3">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search marketplace..." className="w-full rounded-full border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/35" />
          </div>
          <div className="flex flex-wrap gap-2">
            {(['all', 'product', 'digital'] as const).map((value) => (
              <button key={value} onClick={() => setFilter(value)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${filter === value ? 'bg-primary text-primary-foreground' : 'border border-border bg-card text-muted-foreground'}`}>
                {value === 'all' ? 'All' : value === 'product' ? 'Products' : 'Digital'}
              </button>
            ))}
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <Link key={listing.id} to={`/marketplace/${listing.id}`} className="overflow-hidden rounded-[2rem] border border-border bg-card transition-all hover:border-primary/30 hover:shadow-lg">
              <div className="aspect-[4/3] bg-secondary">
                {listing.imageUrl ? <img src={listing.imageUrl} alt={listing.name} className="h-full w-full object-cover" /> : null}
              </div>
              <div className="space-y-2 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{listing.category}</p>
                <h2 className="font-display text-xl font-bold text-foreground">{listing.name}</h2>
                <p className="text-sm text-muted-foreground">{listing.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-foreground">{formatNaira(listing.cashPrice ?? 0)}</span>
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">{listing.hpPrice} HP</span>
                </div>
                <div className="text-xs text-muted-foreground">{listing.stock ?? 0} left</div>
              </div>
            </Link>
          ))}
        </section>

        <section className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-semibold text-foreground"><Plus size={15} className="text-primary" /> Request flow</div>
          Tell us what you want from the marketplace and we&apos;ll queue it for future drops.
        </section>
      </div>
    </main>
  );
};

export default MarketplacePage;
