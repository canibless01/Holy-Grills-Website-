import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Flame, Ticket, Plus, Send } from 'lucide-react';
import { mockApi } from '@/lib/mockApi';
import { useHolyGrill } from '@/lib/HolyGrillContext';
import { formatNaira } from '@/lib/hgUtils';
import { toast } from '@/components/ui/use-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Marketplace() {
  const navigate = useNavigate();
  const { isAuthenticated } = useHolyGrill();
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showPurchases, setShowPurchases] = useState(false);
  const [purchases, setPurchases] = useState([]);
  const [showRequest, setShowRequest] = useState(false);
  const [requestForm, setRequestForm] = useState({ title: '', description: '', category: 'product', max_price: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    try { setPurchases(JSON.parse(localStorage.getItem('hg_purchases') || '[]')); } catch { setPurchases([]); }
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await mockApi.marketplace.list();
        setListings(result);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  const handleRequest = async () => {
    if (!isAuthenticated) { toast({ title: 'Sign in to request', description: 'You need an account to request a product.' }); navigate('/login'); return; }
    if (!requestForm.title.trim()) { toast({ title: 'Add a title', description: 'What product are you looking for?' }); return; }
    setSubmitting(true);
    try {
      await mockApi.marketplace.request({
        title: requestForm.title.trim(),
        description: requestForm.description.trim() || undefined,
        category: requestForm.category,
        max_price: requestForm.max_price ? Number(requestForm.max_price) : undefined,
      });
      toast({ title: '✅ Request submitted', description: "We'll notify you when a matching listing goes live." });
      setShowRequest(false);
      setRequestForm({ title: '', description: '', category: 'product', max_price: '' });
    } catch (e) {
      toast({ title: 'Request failed', description: e.message, variant: 'destructive' });
    }
    setSubmitting(false);
  };

  const filtered = listings.filter(l => {
    if (filter !== 'all' && l.listing_type !== filter) return false;
    if (search && !l.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) return <LoadingSpinner label="Loading marketplace..." />;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-cocoa-800">Marketplace 🛍️</h1>
          <p className="text-sm text-cocoa-400">Buy with HP or cash</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowRequest(true)} className="flex items-center gap-1 px-3 py-2 rounded-full bg-flame-600 text-white text-xs font-bold">
            <Plus className="w-3.5 h-3.5" /> Request
          </button>
          <button onClick={() => setShowPurchases(!showPurchases)} className="flex items-center gap-1 px-3 py-2 rounded-full bg-cocoa-800 text-white text-xs font-bold">
            <Ticket className="w-3.5 h-3.5" /> My Purchases {purchases.length > 0 && `(${purchases.length})`}
          </button>
        </div>
      </div>

      {showPurchases && (
        <div className="rounded-2xl bg-white border border-cocoa-100 p-4 space-y-2">
          <h3 className="font-bold text-sm text-cocoa-800">My Purchases</h3>
          {purchases.length === 0 ? (
            <p className="text-xs text-cocoa-400">No purchases yet. Your codes will appear here after you buy.</p>
          ) : (
            purchases.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-2 rounded-xl bg-cocoa-50">
                <div><div className="text-sm font-semibold text-cocoa-700">{p.title}</div><div className="text-[10px] text-cocoa-400">{new Date(p.date).toLocaleDateString()}</div></div>
                <div className="font-mono font-bold text-sm text-flame-600">{p.code}</div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cocoa-400" />
        <input
          type="text"
          placeholder="Search marketplace..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-10 py-3 rounded-full bg-white border border-cocoa-200 text-sm focus:outline-none focus:border-flame-400"
        />
        {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-cocoa-400" /></button>}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {[
          { id: 'all', label: 'All' },
          { id: 'product', label: 'Products' },
          { id: 'digital', label: 'Digital' },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold ${filter === f.id ? 'flame-gradient text-white' : 'bg-white text-cocoa-600 border border-cocoa-200'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Listings — same card shape as Menu/Rewards (4:3, rounded-2xl, on-brand) */}
      <div className="grid grid-cols-2 gap-3">
        {filtered.map(listing => (
          <button
            key={listing.id}
            onClick={() => navigate(`/marketplace/${listing.id}`)}
            className="group text-left bg-white rounded-2xl border border-cocoa-100 overflow-hidden hover:border-flame-200 hover:shadow-lg transition-all duration-300"
          >
            <div className="relative aspect-[4/3] bg-cocoa-100 overflow-hidden">
              <img src={listing.image_url} alt={listing.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <span className="absolute top-2 right-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white/95 text-gold-700 text-[10px] font-bold shadow-sm">
                <Flame className="w-3 h-3 text-flame-600" />{listing.hp_price}
              </span>
              {listing.codes_remaining != null && listing.codes_remaining <= 3 && (
                <span className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-amber-500 text-white text-[10px] font-bold animate-pulse">{listing.codes_remaining} left</span>
              )}
            </div>
            <div className="p-3">
              <h3 className="font-heading font-bold text-sm text-cocoa-800 leading-tight line-clamp-1">{listing.title}</h3>
              <p className="text-[10px] text-cocoa-400 mt-0.5">{listing.vendor_name}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="font-heading font-bold text-base text-cocoa-800">{formatNaira(listing.price)}</span>
                <span className="text-[9px] text-cocoa-400">{listing.codes_remaining ?? '—'} left</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Request a product modal — POST /api/marketplace/requests */}
      {showRequest && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowRequest(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-heading font-bold text-base text-cocoa-800 flex items-center gap-2"><Plus className="w-5 h-5 text-flame-600" /> Request a Product</h3>
              <button onClick={() => setShowRequest(false)}><X className="w-5 h-5 text-cocoa-400" /></button>
            </div>
            <p className="text-xs text-cocoa-500 mb-3">Can't find what you want? Tell us what you're looking for and we'll notify you the moment a matching listing drops.</p>
            <div className="space-y-2.5">
              <input
                type="text"
                value={requestForm.title}
                onChange={(e) => setRequestForm({ ...requestForm, title: e.target.value })}
                placeholder="Product name (e.g., AirPods Pro)"
                className="w-full p-3 rounded-xl border border-cocoa-200 text-sm focus:outline-none focus:border-flame-400"
              />
              <textarea
                value={requestForm.description}
                onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                placeholder="Describe what you want — condition, specs, anything specific."
                rows={3}
                className="w-full p-3 rounded-xl border border-cocoa-200 text-sm focus:outline-none focus:border-flame-400 resize-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={requestForm.category}
                  onChange={(e) => setRequestForm({ ...requestForm, category: e.target.value })}
                  className="w-full p-3 rounded-xl border border-cocoa-200 text-sm focus:outline-none focus:border-flame-400"
                >
                  <option value="product">Physical product</option>
                  <option value="digital">Digital item</option>
                </select>
                <input
                  type="number"
                  value={requestForm.max_price}
                  onChange={(e) => setRequestForm({ ...requestForm, max_price: e.target.value })}
                  placeholder="Max price (₦)"
                  className="w-full p-3 rounded-xl border border-cocoa-200 text-sm focus:outline-none focus:border-flame-400"
                />
              </div>
              <button
                onClick={handleRequest}
                disabled={submitting || !requestForm.title.trim()}
                className="w-full py-3 rounded-xl flame-gradient text-white font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}