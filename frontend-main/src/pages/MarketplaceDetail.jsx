import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Flame, Wallet, CreditCard, Split, Check, X, Store } from 'lucide-react';
import { mockApi } from '@/lib/mockApi';
import { useHolyGrill } from '@/lib/HolyGrillContext';
import { formatNaira } from '@/lib/hgUtils';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function MarketplaceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hpBalance, wallet, refreshHp, refreshWallet } = useHolyGrill();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPurchase, setShowPurchase] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [walletAmount, setWalletAmount] = useState(0);
  const [purchasing, setPurchasing] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await mockApi.marketplace.list();
        const item = result.find(l => l.id === id);
        setListing(item);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, [id]);

  const handlePurchase = async () => {
    setPurchasing(true);
    try {
      const res = await mockApi.marketplace.purchase(id, {
        use_hp_pricing: paymentMethod === 'hp',
        payment_method: paymentMethod,
        wallet_amount: paymentMethod === 'split' ? walletAmount : undefined,
      });
      // Normalise the response so the success screen never shows "undefined"
      // regardless of which field name the backend returns.
      const purchase = res?.purchase || res?.data || res || {};
      const code = res?.code || purchase.code || purchase.voucher_code || purchase.redemption_code || '—';
      const purchaseId = purchase.id || purchase.purchase_id || res?.purchase_id || '—';
      const hpEarned = res?.hp_earned || purchase.hp_earned || res?.hp_awarded || 0;
      setResult({ code, hp_earned: hpEarned, purchase: { id: purchaseId } });
      try {
        const existing = JSON.parse(localStorage.getItem('hg_purchases') || '[]');
        existing.unshift({ id: purchaseId, title: listing.title, code, date: new Date().toISOString() });
        localStorage.setItem('hg_purchases', JSON.stringify(existing));
      } catch { /* ignore */ }
      await refreshHp();
      await refreshWallet();
    } catch (e) { alert(e.message); }
    setPurchasing(false);
  };

  if (loading) return <LoadingSpinner label="Loading listing..." />;
  if (!listing) return <div className="text-center py-12 text-cocoa-400">Listing not found</div>;

  return (
    <div className="space-y-4 animate-fade-in pb-4">
      <button onClick={() => navigate('/marketplace')} className="flex items-center gap-1 text-sm text-cocoa-500">
        <ChevronLeft className="w-4 h-4" /> Back to marketplace
      </button>

      {/* Image */}
      <div className="rounded-3xl overflow-hidden aspect-square bg-cocoa-100">
        <img src={listing.image_url} alt={listing.title} className="w-full h-full object-cover" />
      </div>

      {/* Info */}
      <div>
        <div className="flex items-center gap-1 text-xs text-cocoa-400 mb-1">
          <Store className="w-3 h-3" /> {listing.vendor_name}
        </div>
        <h1 className="font-heading font-extrabold text-xl text-cocoa-800">{listing.title}</h1>
        <p className="text-sm text-cocoa-500 mt-1">{listing.description}</p>
      </div>

      {/* Price */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white border border-cocoa-100 p-4 text-center">
          <Wallet className="w-5 h-5 text-green-600 mx-auto mb-1" />
          <div className="font-heading font-bold text-lg text-cocoa-800">{formatNaira(listing.price)}</div>
          <div className="text-xs text-cocoa-400">Cash price</div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-flame-50 to-gold-100 border border-flame-200 p-4 text-center">
          <Flame className="w-5 h-5 text-flame-600 mx-auto mb-1" />
          <div className="font-heading font-bold text-lg text-flame-600">{listing.hp_price} HP</div>
          <div className="text-xs text-cocoa-400">HP price</div>
        </div>
      </div>

      {/* Stock */}
      <div className="flex items-center gap-2 text-xs text-cocoa-500">
        <span className="w-2 h-2 rounded-full bg-green-500" />
        {listing.codes_remaining} available
      </div>

      {/* Purchase Result */}
      {result && (
        <div className="rounded-2xl bg-green-50 border border-green-200 p-4 text-center">
          <div className="text-4xl mb-2">🎉</div>
          <h3 className="font-heading font-bold text-lg text-green-800">Purchase Successful!</h3>
          <p className="text-sm text-green-600 mt-1">Your code: <span className="font-mono font-bold">{result.code}</span></p>
          {result.hp_earned > 0 && (
            <div className="flex items-center justify-center gap-1 mt-2 text-flame-600 font-bold">
              <Flame className="w-4 h-4" />+{result.hp_earned} HP earned
            </div>
          )}
          <button onClick={() => navigate('/marketplace')} className="mt-3 px-6 py-2 rounded-full bg-white border border-green-200 text-green-700 font-bold text-sm">
            Continue
          </button>
        </div>
      )}

      {/* Purchase Button */}
      {!result && (
        <button
          onClick={() => setShowPurchase(true)}
          className="w-full py-4 rounded-full flame-gradient text-white font-bold shadow-lg"
        >
          Purchase Now
        </button>
      )}

      {/* Purchase Modal */}
      {showPurchase && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowPurchase(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-heading font-bold text-lg text-cocoa-800">Choose Payment</h3>
              <button onClick={() => setShowPurchase(false)}><X className="w-5 h-5 text-cocoa-400" /></button>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => setPaymentMethod('hp')}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border ${paymentMethod === 'hp' ? 'border-flame-400 bg-flame-50' : 'border-cocoa-200'}`}
              >
                <Flame className="w-5 h-5 text-flame-600" />
                <div className="text-left flex-1">
                  <div className="font-semibold text-sm text-cocoa-700">Pay with HP</div>
                  <div className="text-xs text-cocoa-400">{listing.hp_price} HP · You have {hpBalance?.active || 0}</div>
                </div>
              </button>
              <button
                onClick={() => setPaymentMethod('wallet')}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border ${paymentMethod === 'wallet' ? 'border-flame-400 bg-flame-50' : 'border-cocoa-200'}`}
              >
                <Wallet className="w-5 h-5 text-green-600" />
                <div className="text-left flex-1">
                  <div className="font-semibold text-sm text-cocoa-700">Pay with Wallet</div>
                  <div className="text-xs text-cocoa-400">{formatNaira(listing.price)} · Balance: {formatNaira(wallet?.balance || 0)}</div>
                </div>
              </button>
              <button
                onClick={() => setPaymentMethod('card')}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border ${paymentMethod === 'card' ? 'border-flame-400 bg-flame-50' : 'border-cocoa-200'}`}
              >
                <CreditCard className="w-5 h-5 text-cocoa-500" />
                <div className="text-left flex-1">
                  <div className="font-semibold text-sm text-cocoa-700">Pay with Card</div>
                  <div className="text-xs text-cocoa-400">{formatNaira(listing.price)} · Paystack</div>
                </div>
              </button>
              <button
                onClick={() => setPaymentMethod('split')}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border ${paymentMethod === 'split' ? 'border-flame-400 bg-flame-50' : 'border-cocoa-200'}`}
              >
                <Split className="w-5 h-5 text-gold-500" />
                <div className="text-left flex-1">
                  <div className="font-semibold text-sm text-cocoa-700">Split (Wallet + Card)</div>
                  <div className="text-xs text-cocoa-400">{formatNaira(listing.price)} total</div>
                </div>
              </button>

              {paymentMethod === 'split' && (
                <div className="animate-slide-up">
                  <label className="text-xs font-bold text-cocoa-500 uppercase">Wallet Amount</label>
                  <input
                    type="number"
                    value={walletAmount}
                    onChange={(e) => setWalletAmount(Math.min(wallet?.balance || 0, Math.max(0, parseFloat(e.target.value) || 0)))}
                    max={wallet?.balance || 0}
                    className="w-full mt-1 p-3 rounded-xl border border-cocoa-200 text-sm focus:outline-none focus:border-flame-400"
                  />
                </div>
              )}

              <button
                onClick={handlePurchase}
                disabled={purchasing}
                className="w-full py-3 rounded-full flame-gradient text-white font-bold disabled:opacity-50 mt-2"
              >
                {purchasing ? 'Processing...' : 'Confirm Purchase'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}