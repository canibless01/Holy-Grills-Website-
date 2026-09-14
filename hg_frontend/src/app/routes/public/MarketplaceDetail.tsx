'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Flame, ShieldCheck, Wallet, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { Link, useParams } from '@/lib/router';
import {
  getMarketplaceListing,
  purchaseMarketplaceListing,
  type MarketplaceListingItem,
} from '@/services/api/marketplace.service';
import { useAuthStore } from '@/stores/authStore';
import { formatPrice } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type PaymentMethod = 'hp' | 'wallet' | 'card';

export default function MarketplaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { user, setUser } = useAuthStore();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('hp');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [redemptionCode, setRedemptionCode] = useState<string | null>(null);

  // Fetch listing detail
  const { data: listing = null, isLoading } = useQuery<MarketplaceListingItem | null>({
    queryKey: ['marketplace-listing', id],
    queryFn: () => (id ? getMarketplaceListing(id) : Promise.resolve(null)),
    enabled: Boolean(id),
  });

  // Execute purchase
  const purchaseMutation = useMutation({
    mutationFn: (method: PaymentMethod) => {
      if (!listing) throw new Error('Listing not found');
      return purchaseMarketplaceListing(listing.id, {
        payment_method: method,
        use_hp: method === 'hp',
        wallet_amount: method === 'wallet' ? listing.cashPrice : 0,
      });
    },
    onSuccess: (res, method) => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-listing', id] });
      queryClient.invalidateQueries({ queryKey: ['marketplace-purchases'] });

      if (res.authorization_url) {
        window.location.href = res.authorization_url;
        return;
      }

      setRedemptionCode(res.code || 'REDEEMED');
      toast.success(res.message || 'Purchase successful! Voucher code / confirmation sent.');

      // Update local balances if needed
      if (user) {
        if (method === 'hp' && listing) {
          setUser({ ...user, hp_balance: Math.max((user.hp_balance || 0) - listing.hpPrice, 0) });
        } else if (method === 'wallet' && listing) {
          setUser({ ...user, wallet_balance: Math.max((user.wallet_balance || 0) - listing.cashPrice, 0) });
        }
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Listing is no longer available or insufficient balance.');
    },
  });

  if (isLoading) {
    return (
      <main className="flex-1 pb-12 pt-4 md:pt-24">
        <div className="container mx-auto max-w-3xl px-4 space-y-4">
          <div className="h-64 animate-pulse rounded-[2rem] bg-card border border-border" />
        </div>
      </main>
    );
  }

  if (!listing) {
    return (
      <main className="flex-1 pb-12 pt-4 md:pt-24">
        <div className="container mx-auto max-w-3xl px-4 text-xs text-muted-foreground">
          Listing is no longer available.
        </div>
      </main>
    );
  }

  const walletBalance = user?.wallet_balance ?? 0;
  const hpBalance = user?.hp_balance ?? 0;
  const isOutOfStock = listing.stock <= 0;
  const affordableByHp = hpBalance >= listing.hpPrice;
  const canPurchase = !isOutOfStock && !listing.locked && (paymentMethod === 'hp' ? affordableByHp : true);

  const handlePurchaseClick = () => {
    if (!user) {
      toast.error('Please log in to complete your purchase.');
      return;
    }
    setShowConfirmDialog(true);
  };

  const confirmPurchase = () => {
    setShowConfirmDialog(false);
    purchaseMutation.mutate(paymentMethod);
  };

  return (
    <main className="flex-1 pb-12 pt-4 md:pt-24">
      <div className="container mx-auto max-w-3xl space-y-6 px-4">
        <Link to="/marketplace" className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground">
          <ChevronLeft size={14} /> Back to Marketplace
        </Link>

        {/* Listing Banner & Overview */}
        <section className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm">
          <div className="relative aspect-[16/10] bg-secondary">
            {listing.imageUrl && (
              <img src={listing.imageUrl} alt={listing.name} className="h-full w-full object-cover" />
            )}
            {isOutOfStock ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white font-bold text-sm uppercase">
                Sold Out
              </div>
            ) : (
              <span className="absolute top-4 right-4 rounded-full bg-background/90 backdrop-blur-xs px-3 py-1 text-xs font-bold text-foreground">
                Stock: {listing.stock} available
              </span>
            )}
          </div>

          <div className="space-y-3 p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                {listing.category}
              </span>
              <span className="text-xs text-muted-foreground">Vendor: {listing.vendorName}</span>
            </div>

            <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              {listing.name}
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed">{listing.description}</p>

            <div className="grid gap-3 sm:grid-cols-2 pt-2">
              <div className="rounded-2xl border border-border/80 bg-muted/40 p-4">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase">Cash Price</p>
                <p className="mt-1 font-display text-xl font-bold text-foreground">
                  {formatPrice(listing.cashPrice)}
                </p>
              </div>

              <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
                <p className="text-[11px] font-semibold text-primary uppercase">HP Redeem Price</p>
                <p className="mt-1 font-display text-xl font-bold text-primary">
                  {listing.hpPrice} HP
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Purchase Status or Form */}
        {redemptionCode ? (
          <section className="rounded-[2rem] border border-emerald-500/30 bg-emerald-500/10 p-6 text-center space-y-2">
            <ShieldCheck className="mx-auto text-emerald-600 dark:text-emerald-400" size={32} />
            <h2 className="font-display font-bold text-lg text-emerald-800 dark:text-emerald-300">
              Purchase Successful!
            </h2>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              Your voucher / redemption access code:
            </p>
            <p className="font-mono text-xl font-extrabold text-primary bg-background px-4 py-2 rounded-xl inline-block border border-border shadow-xs">
              {redemptionCode}
            </p>
          </section>
        ) : (
          <section className="rounded-[2rem] border border-border bg-card p-6 space-y-4 shadow-sm">
            <h2 className="font-display font-bold text-lg text-foreground">Choose Payment Method</h2>

            <div className="grid gap-3 sm:grid-cols-3 text-xs">
              <button
                onClick={() => setPaymentMethod('hp')}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  paymentMethod === 'hp'
                    ? 'border-primary bg-primary/10 ring-2 ring-primary/30'
                    : 'border-border bg-background'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-foreground">
                  <Flame size={16} className="text-primary" />
                  <span>Holy Points (HP)</span>
                </div>
                <p className="mt-2 text-muted-foreground">Your Balance: {hpBalance} HP</p>
              </button>

              <button
                onClick={() => setPaymentMethod('wallet')}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  paymentMethod === 'wallet'
                    ? 'border-primary bg-primary/10 ring-2 ring-primary/30'
                    : 'border-border bg-background'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-foreground">
                  <Wallet size={16} className="text-primary" />
                  <span>HG Wallet</span>
                </div>
                <p className="mt-2 text-muted-foreground">Balance: {formatPrice(walletBalance)}</p>
              </button>

              <button
                onClick={() => setPaymentMethod('card')}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  paymentMethod === 'card'
                    ? 'border-primary bg-primary/10 ring-2 ring-primary/30'
                    : 'border-border bg-background'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-foreground">
                  <CreditCard size={16} className="text-primary" />
                  <span>Card / Paystack</span>
                </div>
                <p className="mt-2 text-muted-foreground">Instant online checkout</p>
              </button>
            </div>

            <button
              disabled={!canPurchase || purchaseMutation.isPending}
              onClick={handlePurchaseClick}
              className="w-full rounded-full bg-primary px-4 py-3 text-xs font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isOutOfStock
                ? 'Item Sold Out'
                : listing.locked
                  ? 'Listing Locked'
                  : !user
                    ? 'Login to Purchase'
                    : !canPurchase
                      ? 'Insufficient Balance'
                      : purchaseMutation.isPending
                        ? 'Processing Purchase...'
                        : `Confirm & Buy with ${paymentMethod.toUpperCase()}`}
            </button>
          </section>
        )}
      </div>

      {/* Purchase Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Purchase</AlertDialogTitle>
            <AlertDialogDescription>
              Confirm purchase of "{listing.name}" for{' '}
              {paymentMethod === 'hp' ? `${listing.hpPrice} HP` : formatPrice(listing.cashPrice)}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmPurchase}
              className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Confirm Purchase
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
