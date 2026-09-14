'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Ticket, Store, ShoppingBag, X } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from '@/lib/router';
import {
  getMarketplaceListings,
  submitVendorListingRequest,
  getMyMarketplacePurchases,
  type MarketplaceListingItem,
  type MarketplacePurchaseRecord,
} from '@/services/api/marketplace.service';
import { formatPrice } from '@/lib/utils';

export default function MarketplacePage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [showPurchases, setShowPurchases] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);

  // Vendor listing request form state
  const [vendorName, setVendorName] = useState('');
  const [vendorEmail, setVendorEmail] = useState('');
  const [vendorPhone, setVendorPhone] = useState('');
  const [serviceTitle, setServiceTitle] = useState('');
  const [requestCategory, setRequestCategory] = useState('Vouchers');
  const [description, setDescription] = useState('');
  const [proposedPrice, setProposedPrice] = useState('');

  // Fetch listings
  const { data: listings = [], isLoading } = useQuery<MarketplaceListingItem[]>({
    queryKey: ['marketplace-listings', category, query],
    queryFn: () =>
      getMarketplaceListings({
        category: category !== 'all' ? category : undefined,
        q: query.trim() || undefined,
      }),
  });

  // Fetch purchases
  const { data: purchases = [] } = useQuery<MarketplacePurchaseRecord[]>({
    queryKey: ['marketplace-purchases'],
    queryFn: getMyMarketplacePurchases,
    enabled: showPurchases,
  });

  // Submit vendor listing request
  const submitRequestMutation = useMutation({
    mutationFn: submitVendorListingRequest,
    onSuccess: (res) => {
      toast.success(res.message || 'Listing request submitted for admin review!');
      setShowSellModal(false);
      setVendorName('');
      setVendorEmail('');
      setVendorPhone('');
      setServiceTitle('');
      setDescription('');
      setProposedPrice('');
    },
    onError: () => {
      toast.error('Failed to submit listing request.');
    },
  });

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceTitle || !vendorEmail || !vendorName) {
      toast.error('Please fill in all required fields.');
      return;
    }

    submitRequestMutation.mutate({
      vendor_name: vendorName,
      vendor_email: vendorEmail,
      vendor_phone: vendorPhone,
      service_title: serviceTitle,
      category: requestCategory,
      description,
      proposed_price: Number(proposedPrice) || 0,
    });
  };

  const categories = ['all', 'Vouchers', 'Tickets', 'Goodies', 'Services'];

  return (
    <main className="flex-1 pb-12 pt-4 md:pt-24">
      <div className="container mx-auto max-w-5xl space-y-6 px-4">
        {/* Banner Section */}
        <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Store size={18} className="text-primary" />
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                  Student Peer Marketplace
                </span>
              </div>
              <h1 className="mt-1 font-display text-3xl font-bold text-foreground">
                Spend HP or cash on student drops & vouchers.
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPurchases((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
              >
                <Ticket size={14} className="text-primary" />
                <span>My Purchases ({purchases.length})</span>
              </button>

              <button
                onClick={() => setShowSellModal(true)}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
              >
                <Plus size={14} />
                <span>Sell / List Item</span>
              </button>
            </div>
          </div>

          {/* User Purchases Drawer / Drawer */}
          {showPurchases && (
            <div className="mt-4 space-y-3 rounded-2xl border border-border/80 bg-muted/40 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Your Redemption Codes & Vouchers</span>
                <button onClick={() => setShowPurchases(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={16} />
                </button>
              </div>

              {!purchases.length ? (
                <p className="text-xs text-muted-foreground">No marketplace purchases recorded yet.</p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {purchases.map((purchase) => (
                    <div key={purchase.id} className="flex items-center justify-between rounded-xl bg-card border border-border p-3 text-xs">
                      <div>
                        <p className="font-semibold text-foreground">{purchase.title}</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(purchase.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className="font-mono font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">
                        {purchase.code || 'REDEEMED'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Search & Category Filter Bar */}
        <section className="space-y-3">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search vouchers, tickets, services, drops..."
              className="w-full rounded-full border border-border bg-card py-2.5 pl-10 pr-4 text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/35"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  category === cat
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border bg-card text-muted-foreground hover:bg-muted'
                }`}
              >
                {cat === 'all' ? 'All Items' : cat}
              </button>
            ))}
          </div>
        </section>

        {/* Listings Grid */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-[2rem] border border-border bg-card/50" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-border p-12 text-center text-xs text-muted-foreground bg-card">
            No marketplace items found matching your filters.
          </div>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <Link
                key={listing.id}
                to={`/marketplace/${listing.id}`}
                className="relative overflow-hidden rounded-[2rem] border border-border bg-card transition-all hover:border-primary/30 hover:shadow-md flex flex-col justify-between"
              >
                <div className="relative aspect-[4/3] bg-secondary">
                  {listing.imageUrl && (
                    <img src={listing.imageUrl} alt={listing.name} className="h-full w-full object-cover" />
                  )}

                  {/* Stock Badge / Sold Out Overlay */}
                  {listing.stock <= 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs text-white font-bold text-xs uppercase tracking-wider">
                      Sold Out
                    </div>
                  ) : (
                    <span className="absolute top-3 right-3 rounded-full bg-background/80 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-bold text-foreground">
                      {listing.stock} in stock
                    </span>
                  )}
                </div>

                <div className="space-y-2 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {listing.category}
                    </span>
                    <span className="text-[10px] text-muted-foreground">By {listing.vendorName}</span>
                  </div>

                  <h2 className="font-display text-lg font-bold text-foreground line-clamp-1">
                    {listing.name}
                  </h2>
                  <p className="text-xs text-muted-foreground line-clamp-2">{listing.description}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-border/60">
                    <span className="font-bold text-sm text-foreground">
                      {formatPrice(listing.cashPrice)}
                    </span>
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                      {listing.hpPrice} HP
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </section>
        )}
      </div>

      {/* Vendor Listing Request Form Modal */}
      {showSellModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowSellModal(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-card p-6 border border-border shadow-xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-bold text-foreground">Sell / List Item Request</h3>
              <button onClick={() => setShowSellModal(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Submit your service or product listing request for admin review and approval.
            </p>

            <form onSubmit={handleRequestSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-foreground">Vendor Name</label>
                <input
                  required
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  placeholder="Your display name or shop"
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/35"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-foreground">Contact Email</label>
                  <input
                    required
                    type="email"
                    value={vendorEmail}
                    onChange={(e) => setVendorEmail(e.target.value)}
                    placeholder="email@campus.edu"
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/35"
                  />
                </div>
                <div>
                  <label className="font-semibold text-foreground">Phone Number</label>
                  <input
                    value={vendorPhone}
                    onChange={(e) => setVendorPhone(e.target.value)}
                    placeholder="08000000000"
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/35"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-foreground">Listing / Service Title</label>
                <input
                  required
                  value={serviceTitle}
                  onChange={(e) => setServiceTitle(e.target.value)}
                  placeholder="e.g. Cinema Ticket Voucher / Tech Repair"
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/35"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-foreground">Category</label>
                  <select
                    value={requestCategory}
                    onChange={(e) => setRequestCategory(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/35"
                  >
                    <option value="Vouchers">Vouchers</option>
                    <option value="Tickets">Tickets</option>
                    <option value="Goodies">Goodies</option>
                    <option value="Services">Services</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-foreground">Proposed Price (₦)</label>
                  <input
                    required
                    type="number"
                    value={proposedPrice}
                    onChange={(e) => setProposedPrice(e.target.value)}
                    placeholder="2500"
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/35"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-foreground">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your offer, redemption process, and terms..."
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary/35 min-h-[70px]"
                />
              </div>

              <button
                type="submit"
                disabled={submitRequestMutation.isPending}
                className="w-full rounded-full bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90"
              >
                {submitRequestMutation.isPending ? 'Submitting...' : 'Submit Request for Approval'}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
