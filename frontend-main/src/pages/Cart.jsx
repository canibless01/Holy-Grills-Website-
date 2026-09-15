import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Minus, Plus, Trash2, Flame, AlertTriangle, ShoppingBag, ChevronRight, Tag, Check, Users, Gift, Heart, X, Wallet as WalletIcon } from 'lucide-react';
import { mockApi } from '@/lib/mockApi';
import { useHolyGrill } from '@/lib/HolyGrillContext';
import { useSound } from '@/lib/SoundProvider';
import { formatNaira } from '@/lib/hgUtils';
import { squadOrderMinItems, squadOrderMaxItems, squadOrderDiscountEnabled, squadOrderDiscountPct, squadDeliveryDiscountEnabled, squadDeliveryDiscountPct, squadOrdersEnabled } from '@/lib/appConfig';
import { toast } from '@/components/ui/use-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Cart() {
  const navigate = useNavigate();
  const { cart, wallet, refreshCart, updateCartItem, removeFromCart, clearCart, addToCart, savedItems, toggleSavedItem, moveSavedToCart, removeSavedItem: removeSaved, refreshSavedItems, isAuthenticated: isAuthed, getSetting } = useHolyGrill();
  const { play } = useSound();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('cart');
  // Summary state — promo + squad. Delivery type & HP redemption live on the
  // checkout page now (HP redemption removed entirely from the product).
  const [promoCode, setPromoCode] = useState('');
  const [promoResult, setPromoResult] = useState(null);
  const [promoError, setPromoError] = useState(null);
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [showSquad, setShowSquad] = useState(false);
  const [squadEnabled, setSquadEnabled] = useState(false);
  const [squadName, setSquadName] = useState('');
  const [squadMembers, setSquadMembers] = useState([{ name: '', email: '' }]);
  const [showFreeSide, setShowFreeSide] = useState(false);
  const [showFbt, setShowFbt] = useState(false);
  const [fbtDismissed, setFbtDismissed] = useState(false);
  const [fbtItems, setFbtItems] = useState([]);

  useEffect(() => {
    refreshCart().then(() => setLoading(false));
    mockApi.menu.getItems({ is_featured: 'true', available_only: 'true' }).then((res) => setFbtItems((res.items || []).slice(0, 4))).catch(() => {});
  }, []);

  const subtotal = cart?.subtotal || 0;
  const promoDiscount = promoResult?.calculated_discount || 0;
  // Squad config — all values read live from the backend (Config Reference:
  // Squad). Add-ons never count toward the item threshold; quantity does
  // (2 items × qty 2 = 4 toward the total), so we sum cart line quantities.
  const squadMinItems = squadOrderMinItems();
  const squadMaxItems = squadOrderMaxItems();
  const squadSubEnabled = squadOrderDiscountEnabled();
  const squadSubPct = squadSubEnabled ? squadOrderDiscountPct() : 0;
  const squadDelEnabled = squadDeliveryDiscountEnabled();
  const squadDeliveryPct = squadDelEnabled ? squadDeliveryDiscountPct() : 0;
  // Item-count for squad eligibility = sum of cart line quantities (add-ons
  // excluded by the backend; here we count every cart line's quantity which
  // matches the backend's own threshold math).
  const squadItemCount = (cart?.items || []).reduce((s, ci) => s + (ci.quantity || 1), 0);
  const squadDiscount = squadEnabled && squadSubPct > 0 ? subtotal * (squadSubPct / 100) : 0;
  const squadChipLabel = squadSubPct > 0 ? `${squadSubPct}% off` : squadDeliveryPct >= 100 ? 'Free delivery' : 'Split HP';
  const squadFeatureOn = squadOrdersEnabled();
  const squadEligible = squadItemCount >= squadMinItems && squadItemCount <= squadMaxItems;
  const squadItemsToGo = Math.max(0, squadMinItems - squadItemCount);
  const total = Math.max(0, subtotal - promoDiscount - squadDiscount);

  const handleQty = async (itemId, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty <= 0) { play('cart_remove'); await removeFromCart(itemId); }
    else { play('cart_add'); await updateCartItem(itemId, { quantity: newQty }); }
  };

  const handleRemove = (itemId) => { play('cart_remove'); removeFromCart(itemId); };

  const [savingId, setSavingId] = useState(null);
  const handleSaveForLater = async (ci) => {
    if (!isAuthed) { toast({ title: 'Sign in to save items', description: 'Saved items sync to your account.' }); return; }
    setSavingId(ci.id);
    try {
      await mockApi.saved.fromCart(ci.id);
      await refreshSavedItems();
      await refreshCart();
      toast({ title: '❤️ Saved to your favourites', description: `${ci.menu_items.name} moved to Saved Items.` });
    } catch (e) {
      toast({ title: 'Could not save item', description: e.message, variant: 'destructive' });
    }
    setSavingId(null);
  };

  const handleMoveToCart = async (saved) => {
    play('cart_add');
    await moveSavedToCart(saved);
    if (savedItems.length === 1) setTab('cart');
    toast({ title: '🔥 Moved to cart', description: `${saved.name} is back in your cart.` });
  };

  const handleRemoveSaved = (saved) => { removeSaved(saved.id); };

  const handleValidatePromo = async () => {
    if (!promoCode) return;
    setValidatingPromo(true);
    setPromoError(null);
    try {
      const result = await mockApi.orders.validatePromo({ code: promoCode, order_subtotal: subtotal });
      setPromoResult(result);
    } catch (e) { setPromoError(e.message); setPromoResult(null); }
    setValidatingPromo(false);
  };

  /* Squad Order eligibility uses the backend's min/max item thresholds
   * (SQUAD_ORDER_MIN_ITEMS / SQUAD_ORDER_MAX_ITEMS) read live from config.
   * Add-ons never count toward the threshold; quantity does, so we use
   * squadItemCount (sum of line quantities). */
  const handleSquadClick = () => {
    if (!squadFeatureOn) {
      toast({ title: 'Squad Orders are turned off', description: 'Check back soon — this feature may be re-enabled.' });
      return;
    }
    if (squadItemCount < squadMinItems) {
      toast({
        title: 'Your order is not valid for Squad Order',
        description: `Add ${squadItemsToGo} more item${squadItemsToGo !== 1 ? 's' : ''} to reach the ${squadMinItems}-item squad minimum.`,
      });
      return;
    }
    if (squadItemCount > squadMaxItems) {
      toast({
        title: `Squad orders are capped at ${squadMaxItems} items`,
        description: `Remove ${squadItemCount - squadMaxItems} item${squadItemCount - squadMaxItems !== 1 ? 's' : ''} to keep your squad order within the ${squadMaxItems}-item limit.`,
      });
      return;
    }
    setShowSquad(true);
  };

  const maxMembers = Math.min(squadItemCount, squadMaxItems);
  const validMembers = squadMembers.filter(m => m.name.trim() && m.email.trim());

  const addSquadMember = () => {
    if (squadMembers.length >= maxMembers) return;
    setSquadMembers([...squadMembers, { name: '', email: '' }]);
  };
  const removeSquadMember = (idx) => {
    if (squadMembers.length <= 1) return;
    setSquadMembers(squadMembers.filter((_, i) => i !== idx));
  };
  const updateSquadMember = (idx, field, value) => {
    setSquadMembers(squadMembers.map((m, i) => i === idx ? { ...m, [field]: value } : m));
  };

  const handleConfirmSquad = () => {
    if (!squadName || validMembers.length === 0) return;
    setSquadEnabled(true);
    setShowSquad(false);
    toast({ title: '🔥 Squad Order enabled', description: `You and ${validMembers.length} squad member${validMembers.length !== 1 ? 's' : ''} just unlocked squad benefits.` });
  };

  const handleCheckout = () => {
    if (!fbtDismissed && fbtItems.length > 0) {
      setShowFbt(true);
      return;
    }
    navigate('/checkout', {
      state: {
        promoResult,
        squadEnabled,
        squadName: squadEnabled ? squadName : '',
        squadMembers: squadEnabled ? validMembers : [],
        total,
        subtotal,
      },
    });
  };

  const proceedToCheckout = () => {
    setShowFbt(false);
    navigate('/checkout', {
      state: {
        promoResult,
        squadEnabled,
        squadName: squadEnabled ? squadName : '',
        squadMembers: squadEnabled ? validMembers : [],
        total,
        subtotal,
      },
    });
  };

  const dismissFbt = () => {
    setShowFbt(false);
    setFbtDismissed(true);
  };

  const handleFbtAdd = async (item) => {
    play('cart_add');
    await addToCart({ menu_item_id: item.id, quantity: 1 });
    toast({ title: '🔥 Added to your cart', description: `${item.name} added — total updated.` });
  };

  if (loading) return <LoadingSpinner label="Loading cart..." />;

  const empty = !cart || cart.items.length === 0;
  const savedCount = savedItems.length;

  if (empty && savedCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-xl bg-cocoa-100 flex items-center justify-center mb-4">
          <ShoppingBag className="w-10 h-10 text-cocoa-300" />
        </div>
        <h2 className="font-heading font-bold text-lg text-cocoa-800 mb-1">Your cart is empty</h2>
        <p className="text-sm text-cocoa-400 mb-4">Add some flame-grilled goodness to get started.</p>
        <button onClick={() => navigate('/menu')} className="px-6 py-3 rounded-lg flame-gradient text-white font-bold text-sm shadow-md">Browse Menu →</button>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in pb-4">
      {/* Left: Cart + Saved tabs · Right: Wallet balance in boxed card */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2">
          <button
            onClick={() => setTab('cart')}
            className={`px-4 py-2 rounded-button text-xs font-semibold transition-all ${tab === 'cart' ? 'flame-gradient text-white shadow-selected-soft' : 'bg-card text-muted-foreground border border-border'}`}
          >
            My Cart {cart?.item_count > 0 && `(${cart.item_count})`}
          </button>
          <button
            onClick={() => setTab('saved')}
            className={`flex items-center gap-1 px-4 py-2 rounded-button text-xs font-semibold transition-all ${tab === 'saved' ? 'flame-gradient text-white shadow-selected-soft' : 'bg-card text-muted-foreground border border-border'}`}
          >
            <Heart className={`w-3.5 h-3.5 ${tab === 'saved' ? 'fill-white' : ''}`} />
            Saved {savedCount > 0 && `(${savedCount})`}
          </button>
        </div>
        <Link to="/wallet" className="flex items-center gap-2.5 rounded-2xl bg-card border border-border px-3 py-2 shadow-cart-card hover:shadow-selected-soft transition-shadow">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <WalletIcon className="w-4 h-4 text-primary" />
          </div>
          <div className="leading-tight">
            <div className="text-[10px] text-muted-foreground font-medium">Wallet</div>
            <div className="text-sm font-bold text-foreground">{formatNaira(wallet?.balance || 0)}</div>
          </div>
        </Link>
      </div>

      {tab === 'cart' ? (
        empty ? (
          <div className="text-center py-12">
            <p className="text-sm text-cocoa-400 mb-3">Your cart is empty.</p>
            {savedCount > 0 && <button onClick={() => setTab('saved')} className="text-xs font-bold text-flame-600">View Saved Items →</button>}
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-heading font-bold text-xl text-cocoa-800">Your Cart</h1>
                <p className="text-sm text-cocoa-400">{cart.item_count} item{cart.item_count !== 1 ? 's' : ''}</p>
              </div>
              <button onClick={clearCart} className="text-xs font-semibold text-red-500 hover:text-red-700 flex items-center gap-1">
                <Trash2 className="w-3.5 h-3.5" /> Clear all
              </button>
            </div>

            {cart.has_unavailable_items && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <div className="text-xs text-amber-800">Some items are no longer available. Please remove them before checkout.</div>
              </div>
            )}

            {/* HP Preview — dopamine moment at top with animated flame */}
            <div className="flex items-center gap-2.5 p-3.5 rounded-2xl flame-gradient text-white shadow-selected-soft">
              <Flame className="w-5 h-5 text-white shrink-0 animate-flame-flicker" />
              <div className="flex-1">
                <span className="font-bold text-sm">You'll earn {cart.hp_earn_preview} HP</span>
                <span className="text-xs text-white/80"> on this order 🔥</span>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3">
              {cart.items.map((ci) => (
                <div key={ci.id} className={`rounded-menu bg-card border p-3 shadow-cart-card ${ci.is_unavailable ? 'border-red-200 opacity-60' : 'border-border'}`}>
                  <div className="flex gap-3">
                    {ci.menu_items.image_url ? (
                      <img src={ci.menu_items.image_url} alt={ci.menu_items.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Flame className="w-6 h-6 text-primary/40" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-sm text-foreground">{ci.menu_items.name}</h3>
                      {ci.notes && <p className="text-xs text-cocoa-400 mt-0.5">📝 {ci.notes}</p>}
                      {ci.is_unavailable && <p className="text-xs text-red-500 mt-0.5">⚠️ No longer available</p>}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2 bg-cocoa-50 rounded-lg p-1">
                          <button onClick={() => handleQty(ci.id, ci.quantity, -1)} className="w-7 h-7 rounded-lg bg-white border border-cocoa-200 flex items-center justify-center"><Minus className="w-3.5 h-3.5 text-cocoa-600" /></button>
                          <span className="font-bold text-cocoa-800 w-5 text-center text-sm">{ci.quantity}</span>
                          <button onClick={() => handleQty(ci.id, ci.quantity, 1)} disabled={ci.is_unavailable} className="w-7 h-7 rounded-lg bg-white border border-cocoa-200 flex items-center justify-center disabled:opacity-40"><Plus className="w-3.5 h-3.5 text-cocoa-600" /></button>
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={() => handleSaveForLater(ci)} className="text-cocoa-400 hover:text-flame-600" title="Save for later"><Heart className="w-4 h-4" /></button>
                          <button onClick={() => handleRemove(ci.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-heading font-bold text-cocoa-800">{formatNaira(ci.menu_items.price * ci.quantity)}</div>
                      <div className="flex items-center gap-1 mt-1 justify-end">
                        <Flame className="w-3 h-3 text-flame-500" />
                        <span className="text-xs font-semibold text-flame-600">
                          +{Math.round(ci.menu_items.hp_earn_value * (ci.menu_items.hp_multiplier || 1) * ci.quantity)}
                          {ci.menu_items.hp_multiplier && ci.menu_items.hp_multiplier !== 1 && (
                            <span className="text-[9px] ml-0.5">({ci.menu_items.hp_multiplier}×)</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo */}
            <div className="hg-card">
              <h3 className="hg-section-title mb-2 flex items-center gap-2"><Tag className="w-4 h-4 text-flame-600" /> Promo Code</h3>
              <div className="flex gap-2">
                <input type="text" value={promoCode} onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoResult(null); setPromoError(null); }} placeholder="Try SAVE10 or WELCOME50" className="flex-1 p-3 rounded-xl border border-cocoa-200 text-sm focus:outline-none focus:border-flame-400" />
                <button onClick={handleValidatePromo} disabled={!promoCode || validatingPromo} className="px-4 rounded-xl bg-cocoa-800 text-white text-xs font-bold disabled:opacity-40">{validatingPromo ? '...' : 'Apply'}</button>
              </div>
              {promoResult && <div className="mt-2 flex items-center gap-2 text-xs text-green-600 font-semibold"><Check className="w-3.5 h-3.5" /> {promoResult.code} applied — save {formatNaira(promoResult.calculated_discount)}</div>}
              {promoError && <div className="mt-2 flex items-center gap-2 text-xs text-red-600 font-semibold"><AlertTriangle className="w-3.5 h-3.5" /> {promoError}</div>}
            </div>

            {/* Squad + Free Side — colored chips matching Home quick-link style */}
            <div className="grid grid-cols-2 gap-3">
              <div>
              <button onClick={handleSquadClick} className="w-full rounded-2xl bg-purple-600 p-3 flex items-center gap-2 text-left hover:scale-[1.02] transition-transform">
                <Users className="w-5 h-5 text-white shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white truncate">Squad Order {squadEnabled && '✓'}</div>
                  <div className="text-[10px] text-white/80">{squadChipLabel} · split HP</div>
                </div>
              </button>
              {squadFeatureOn && !squadEnabled && squadItemsToGo > 0 && squadItemCount > 0 && (
                <div className="mt-1 text-[10px] font-bold text-purple-600 px-1">Add {squadItemsToGo} more to qualify</div>
              )}
              </div>
              <button onClick={() => setShowFreeSide(true)} className="rounded-2xl bg-teal-600 p-3 flex items-center gap-2 text-left hover:scale-[1.02] transition-transform">
                <Gift className="w-5 h-5 text-white shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white truncate">Free Side</div>
                  <div className="text-[10px] text-white/80">Tap to view</div>
                </div>
              </button>
            </div>

            {/* Summary */}
            <div className="hg-card space-y-2">
              <div className="flex items-center justify-between text-sm"><span className="text-cocoa-600">Subtotal</span><span className="font-semibold text-cocoa-800">{formatNaira(subtotal)}</span></div>
              {promoDiscount > 0 && <div className="flex items-center justify-between text-sm text-green-600"><span>Promo</span><span>-{formatNaira(promoDiscount)}</span></div>}
              {squadDiscount > 0 && <div className="flex items-center justify-between text-sm text-green-600"><span>Squad ({squadSubPct}%)</span><span>-{formatNaira(squadDiscount)}</span></div>}
              <div className="border-t border-cocoa-100 pt-2 flex items-center justify-between"><span className="font-semibold text-cocoa-800">Total</span><span className="font-heading font-bold text-lg text-cocoa-800">{formatNaira(total)}</span></div>
            </div>

            <button onClick={handleCheckout} disabled={cart.has_unavailable_items} className="w-full flex items-center justify-center gap-2 py-4 rounded-xl flame-gradient text-white font-bold shadow-md disabled:opacity-50">
              Checkout · {formatNaira(total)} <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )
      ) : (
        /* Saved items tab */
        <div className="space-y-3">
          <h1 className="font-heading font-bold text-xl text-cocoa-800 flex items-center gap-2">
            <Heart className="w-5 h-5 text-flame-600 fill-flame-500" /> Saved Items
          </h1>
          {savedCount === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-10 h-10 text-cocoa-200 mx-auto mb-2" />
              <p className="text-sm text-cocoa-400">No saved items yet. Tap the heart on a menu item or cart item to save it for later.</p>
            </div>
          ) : (
            savedItems.map((s) => (
              <div key={s.id} className="rounded-2xl bg-white border border-cocoa-100 p-3 flex items-center gap-3">
                <div className="flex-1">
                  <h3 className="font-bold text-sm text-cocoa-800">{s.name}</h3>
                  <p className="text-xs text-cocoa-400">{s.quantity}× · {formatNaira(s.price * s.quantity)}</p>
                </div>
                <button onClick={() => handleMoveToCart(s)} className="px-3 py-2 rounded-lg bg-flame-600 text-white text-xs font-bold hover:bg-flame-700 transition-colors">Move to cart</button>
                <button onClick={() => handleRemoveSaved(s)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Squad popup — dynamic member rows, max = cart item count */}
      {showSquad && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowSquad(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-heading font-bold text-base text-cocoa-800 flex items-center gap-2"><Users className="w-5 h-5 text-flame-600" /> Squad Order</h3>
              <button onClick={() => setShowSquad(false)}><X className="w-5 h-5 text-cocoa-400" /></button>
            </div>
            <p className="text-xs text-cocoa-500 mb-3">Order with your squad — {squadSubPct > 0 ? `${squadSubPct}% off and ` : ''}{squadDelEnabled && squadDeliveryPct >= 100 ? 'free delivery, ' : ''}HP split across members. Min {squadMinItems} items, max {squadMaxItems}. Add your squad members below.</p>
            <div className="space-y-2">
              <input type="text" value={squadName} onChange={(e) => setSquadName(e.target.value)} placeholder="Squad name (e.g., Team Awesome)" className="w-full p-3 rounded-xl border border-cocoa-200 text-sm focus:outline-none focus:border-flame-400" />
              <div className="space-y-2 mt-2">
                {squadMembers.map((m, idx) => (
                  <div key={idx} className="flex gap-2 items-start">
                    <div className="flex-1 space-y-1.5">
                      <input type="text" value={m.name} onChange={(e) => updateSquadMember(idx, 'name', e.target.value)} placeholder={`Member ${idx + 1} name`} className="w-full p-2.5 rounded-lg border border-cocoa-200 text-sm focus:outline-none focus:border-flame-400" />
                      <input type="email" value={m.email} onChange={(e) => updateSquadMember(idx, 'email', e.target.value)} placeholder="email@example.com" className="w-full p-2.5 rounded-lg border border-cocoa-200 text-sm focus:outline-none focus:border-flame-400" />
                    </div>
                    {squadMembers.length > 1 && (
                      <button onClick={() => removeSquadMember(idx)} className="mt-1 p-2 rounded-lg bg-red-50 text-red-400 hover:text-red-600 shrink-0"><X className="w-4 h-4" /></button>
                    )}
                  </div>
                ))}
              </div>
              {squadMembers.length < maxMembers && (
                <button onClick={addSquadMember} className="w-full py-2 rounded-lg bg-flame-50 border border-flame-200 text-flame-600 text-xs font-bold flex items-center justify-center gap-1 hover:bg-flame-100 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Add member
                </button>
              )}
              <button onClick={handleConfirmSquad} disabled={!squadName || validMembers.length === 0} className="w-full py-3 rounded-lg flame-gradient text-white font-bold text-sm disabled:opacity-40 mt-2">
                Confirm Squad ({validMembers.length} member{validMembers.length !== 1 ? 's' : ''})
              </button>
              {squadEnabled && <button onClick={() => { setSquadEnabled(false); setShowSquad(false); setSquadName(''); setSquadMembers([{ name: '', email: '' }]); }} className="w-full py-2 text-xs text-red-500 font-semibold">Remove squad</button>}
            </div>
          </div>
        </div>
      )}

      {/* Free Side popup */}
      {showFreeSide && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowFreeSide(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm animate-slide-up text-center" onClick={(e) => e.stopPropagation()}>
            <div className="text-4xl mb-2">🎁</div>
            <h3 className="font-heading font-bold text-base text-cocoa-800">Free Side Credit</h3>
            <p className="text-sm text-cocoa-500 mt-1">Free sides are earned by winning on the leaderboard — crack the top ranks and a free side credit lands in your account. We'll notify you the moment it lands, then add it here before checkout.</p>
            <button onClick={() => setShowFreeSide(false)} className="mt-4 w-full py-3 rounded-lg flame-gradient text-white font-bold text-sm">Got it</button>
          </div>
        </div>
      )}

      {/* Frequently Bought Together — checkout popup (bottom sheet) */}
      {showFbt && fbtItems.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4" onClick={dismissFbt}>
          <div className="bg-white rounded-2xl p-5 w-full max-w-md max-h-[80vh] overflow-y-auto animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-heading font-bold text-base text-cocoa-800 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-flame-600" /> Add something extra? 🔥
              </h3>
              <button onClick={dismissFbt}><X className="w-5 h-5 text-cocoa-400" /></button>
            </div>
            <p className="text-xs text-cocoa-500 mb-3">Frequently bought together — add a side before you check out.</p>
            <div className="space-y-2">
              {fbtItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-2 rounded-xl border border-cocoa-100">
                  <img src={item.image_url} alt={item.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-cocoa-800 truncate">{item.name}</div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-xs text-cocoa-800">{formatNaira(item.price)}</span>
                      <span className="flex items-center gap-0.5 text-[10px] font-bold text-gold-700 bg-gold-100 px-1.5 py-0.5 rounded-md">
                        <Flame className="w-2.5 h-2.5 text-flame-600" />+{item.hp_earn_value} HP
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleFbtAdd(item)}
                    disabled={item.is_sold_out}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-flame-600 text-white text-xs font-bold disabled:opacity-40 active:scale-95 transition-transform"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              ))}
            </div>
            <button onClick={proceedToCheckout} className="mt-4 w-full py-3 rounded-xl flame-gradient text-white font-bold text-sm flex items-center justify-center gap-1.5">
              Proceed to Checkout <ChevronRight className="w-4 h-4" />
            </button>
            <button onClick={dismissFbt} className="mt-2 w-full py-2 text-xs text-cocoa-400 font-semibold">Skip — just checkout</button>
          </div>
        </div>
      )}
    </div>
  );
}