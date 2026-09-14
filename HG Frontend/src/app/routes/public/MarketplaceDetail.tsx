'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, Flame, Ticket, Wallet } from 'lucide-react';
import { Link, useParams } from '@/lib/router';
import { MARKETPLACE_VENDORS } from '@/services/mocks/platform';
import { useAuthStore } from '@/stores/authStore';

const PURCHASES_KEY = 'holygrill-marketplace-purchases';

type Method = 'hp' | 'wallet';

function formatNaira(value: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value);
}

function addPurchase(id: string, title: string) {
  if (typeof window === 'undefined') return 'HG-0000';
  const code = `HG-${Math.floor(1000 + Math.random() * 9000)}`;
  const next = [{ id, title, code, date: new Date().toISOString() }];
  try {
    const existing = JSON.parse(window.localStorage.getItem(PURCHASES_KEY) ?? '[]');
    window.localStorage.setItem(PURCHASES_KEY, JSON.stringify([...next, ...existing]));
  } catch {
    window.localStorage.setItem(PURCHASES_KEY, JSON.stringify(next));
  }
  return code;
}

const MarketplaceDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user, setUser } = useAuthStore();
  const [paymentMethod, setPaymentMethod] = useState<Method>('hp');
  const [code, setCode] = useState<string | null>(null);
  const listing = useMemo(() => MARKETPLACE_VENDORS.find((item) => item.id === id), [id]);

  if (!listing) {
    return (
      <main className="flex-1 pb-12 pt-4 md:pt-24">
        <div className="container mx-auto max-w-3xl px-4 text-sm text-muted-foreground">Listing not found.</div>
      </main>
    );
  }

  const walletBalance = user?.wallet_balance ?? 0;
  const hpBalance = user?.hp_balance ?? 0;
  const affordableByHp = hpBalance >= listing.hpPrice;
  const affordableByWallet = walletBalance >= (listing.cashPrice ?? 0);
  const canPurchase = listing.locked ? false : paymentMethod === 'hp' ? affordableByHp : affordableByWallet;

  const handlePurchase = () => {
    if (!user || !canPurchase) return;
    if (paymentMethod === 'hp') {
      setUser({ ...user, hp_balance: Math.max(user.hp_balance - listing.hpPrice, 0) });
    } else {
      setUser({ ...user, wallet_balance: Math.max(user.wallet_balance - (listing.cashPrice ?? 0), 0) });
    }
    setCode(addPurchase(listing.id, listing.name));
  };

  return (
    <main className="flex-1 pb-12 pt-4 md:pt-24">
      <div className="container mx-auto max-w-3xl space-y-6 px-4">
        <Link to="/marketplace" className="inline-flex items-center gap-1 text-sm text-muted-foreground"><ChevronLeft size={14} /> Back to marketplace</Link>
        <section className="overflow-hidden rounded-[2rem] border border-border bg-card">
          <div className="aspect-[16/10] bg-secondary">{listing.imageUrl ? <img src={listing.imageUrl} alt={listing.name} className="h-full w-full object-cover" /> : null}</div>
          <div className="space-y-3 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{listing.category}</p>
            <h1 className="font-display text-3xl font-bold text-foreground">{listing.name}</h1>
            <p className="text-sm text-muted-foreground">{listing.description}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-secondary/50 p-4"><p className="text-xs text-muted-foreground">Cash</p><p className="mt-1 font-semibold text-foreground">{formatNaira(listing.cashPrice ?? 0)}</p></div>
              <div className="rounded-2xl bg-primary/10 p-4"><p className="text-xs text-primary">HP</p><p className="mt-1 font-semibold text-primary">{listing.hpPrice} HP</p></div>
            </div>
          </div>
        </section>

        {code ? (
          <section className="rounded-2xl border border-green-200 bg-green-50 p-5 text-center">
            <Ticket className="mx-auto text-green-600" />
            <p className="mt-2 font-semibold text-green-800">Purchase successful</p>
            <p className="text-sm text-green-700">Your redemption code: <span className="font-mono">{code}</span></p>
          </section>
        ) : (
          <section className="rounded-[2rem] border border-border bg-card p-5">
            <h2 className="font-display text-xl font-bold text-foreground">Choose payment</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button onClick={() => setPaymentMethod('hp')} className={`rounded-2xl border p-3 text-left ${paymentMethod === 'hp' ? 'border-primary bg-primary/10' : 'border-border'}`}>
                <p className="inline-flex items-center gap-1 text-sm font-semibold text-foreground"><Flame size={14} className="text-primary" /> HP</p>
                <p className="mt-1 text-xs text-muted-foreground">Balance: {hpBalance} HP</p>
              </button>
              <button onClick={() => setPaymentMethod('wallet')} className={`rounded-2xl border p-3 text-left ${paymentMethod === 'wallet' ? 'border-primary bg-primary/10' : 'border-border'}`}>
                <p className="inline-flex items-center gap-1 text-sm font-semibold text-foreground"><Wallet size={14} className="text-primary" /> Wallet</p>
                <p className="mt-1 text-xs text-muted-foreground">Balance: {formatNaira(walletBalance)}</p>
              </button>
            </div>
            <button disabled={!canPurchase || !user} onClick={handlePurchase} className="mt-4 w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">
              {listing.locked ? 'Locked listing' : !user ? 'Login to purchase' : canPurchase ? 'Complete purchase' : 'Insufficient balance'}
            </button>
          </section>
        )}
      </div>
    </main>
  );
};

export default MarketplaceDetailPage;
