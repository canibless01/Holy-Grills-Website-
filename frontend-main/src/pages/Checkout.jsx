import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ChevronLeft, ChevronDown, MapPin, CreditCard, Wallet, Split, Check, AlertCircle, User, Phone, Edit2, Plus, Sparkles, Clock, Flame } from 'lucide-react';
import { mockApi } from '@/lib/mockApi';
import { useHolyGrill } from '@/lib/HolyGrillContext';
import { formatNaira, formatTime } from '@/lib/hgUtils';
import { squadOrderDiscountEnabled, squadOrderDiscountPct, squadDeliveryDiscountEnabled, squadDeliveryDiscountPct, walletTopupMin, walletTopupHp } from '@/lib/appConfig';
import { findNearestGate, formatKm } from '@/lib/deliveryUtils';
import { toast } from '@/components/ui/use-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import FreeSideCreditModal from '@/components/FreeSideCreditModal';
import OffCampusMap from '@/components/OffCampusMap';
import { useSound } from '@/lib/SoundProvider';

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const passed = location.state || {};
  const { cart, wallet, refreshUser, addToCart, isAuthenticated, user, getSetting } = useHolyGrill();
  const { play } = useSound();
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [windowStatus, setWindowStatus] = useState(null);
  const [hostels, setHostels] = useState([]);
  const [gates, setGates] = useState([]);
  const [addresses, setAddresses] = useState([]);

  const [deliveryType, setDeliveryType] = useState(null);
  const [hostelId, setHostelId] = useState(null);
  const [gateId, setGateId] = useState(null);
  const [deliveryFee, setDeliveryFee] = useState(0);
  // Off-campus: precise pin + address snapshot + landmark.
  const [deliveryPin, setDeliveryPin] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [landmark, setLandmark] = useState('');
  const [feePreview, setFeePreview] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [walletAmount, setWalletAmount] = useState(0);
  const [notes, setNotes] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [error, setError] = useState(null);
  const [freeSideCredits, setFreeSideCredits] = useState({ count: 0, expires_at: null });
  const [showFreeSide, setShowFreeSide] = useState(false);
  const [freeSideChoice, setFreeSideChoice] = useState(null);
  const [showGateSelector, setShowGateSelector] = useState(false);
  // "Complete your meal" add-ons (admin-managed Checkout Add-Ons category) +
  // order-level global add-ons, plus an optional scheduled window carried from
  // the closed-store popup when the kitchen is closed.
  const [checkoutAddons, setCheckoutAddons] = useState([]);
  const [globalAddons, setGlobalAddons] = useState([]);
  const [selectedGlobalAddonIds, setSelectedGlobalAddonIds] = useState([]);
  const [scheduledWindow, setScheduledWindow] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [status, h, g, cats, ga] = await Promise.all([
          mockApi.orders.getDeliveryWindowStatus(),
          mockApi.delivery.getHostels(),
          mockApi.delivery.getGates(),
          mockApi.menu.getCategories().catch(() => []),
          mockApi.menu.getGlobalAddons().catch(() => []),
        ]);
        setWindowStatus(status);
        setHostels(h || []);
        setGates(g || []);
        setGlobalAddons(Array.isArray(ga) ? ga : (ga?.addons || ga?.global_addons || []));
        // "Complete your meal" = items in the admin-managed "Checkout Add-Ons"
        // category. Gracefully no-ops if the category doesn't exist yet.
        const checkoutCat = (cats || []).find((c) => /checkout[\s-]?add/i.test(c.name || '') || /checkout_addons?/i.test(c.slug || ''));
        if (checkoutCat) {
          const res = await mockApi.menu.getItems({ category: checkoutCat.slug || checkoutCat.id, available_only: 'true' }).catch(() => ({ items: [] }));
          setCheckoutAddons(res.items || []);
        }
        if (isAuthenticated) {
          try { setAddresses(await mockApi.addresses.list()); } catch { /* ignore */ }
          try { setFreeSideCredits(await mockApi.rewards.getFreeSideCredits()); } catch { /* ignore */ }
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
    try { setScheduledWindow(JSON.parse(sessionStorage.getItem('hg_scheduled_window') || 'null')); }
    catch { /* ignore */ }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Prefer the live cart subtotal so adding the checkout "complete your meal"
  // items pushes the new total immediately (the cart refreshes after each add).
  const subtotal = cart?.subtotal != null ? cart.subtotal : (passed.subtotal || 0);
  const promoDiscount = passed.promoResult?.calculated_discount || 0;
  // Squad discount %s read live from config (Squad). Only applied when the
  // admin has the discount enabled — otherwise 0 regardless of the % value.
  const squadSubPct = passed.squadEnabled && squadOrderDiscountEnabled() ? squadOrderDiscountPct() : 0;
  const squadDelEnabled = passed.squadEnabled && squadDeliveryDiscountEnabled();
  const squadDeliveryPct = squadDelEnabled ? squadDeliveryDiscountPct() : 0;
  const squadDiscount = squadSubPct > 0 ? subtotal * (squadSubPct / 100) : 0;
  const selectedGlobalAddons = globalAddons.filter((a) => selectedGlobalAddonIds.includes(a.id));
  const globalAddonsTotal = selectedGlobalAddons.reduce((s, a) => s + (Number(a.price) || 0), 0);
  const effectiveDeliveryFee = Math.round(deliveryFee * (1 - squadDeliveryPct / 100));
  const total = Math.max(0, subtotal - promoDiscount - squadDiscount) + effectiveDeliveryFee + globalAddonsTotal;
  // HP preview — each item's HP × its admin-set multiplier × qty (spec: the
  // multiplier is included in the HP calculation preview during checkout).
  const hpPreview = (cart?.items || []).reduce(
    (s, ci) => s + Math.round((Number(ci.hp_earn_value) || 0) * (Number(ci.hp_multiplier) || 1) * (ci.quantity || 1)),
    0
  );

  // Guests can only pay by card (spec §6).
  const effectivePayment = isAuthenticated ? paymentMethod : 'card';

  // On-campus fee is a flat hostel fee keyed by the hostel id.
  const calcOnCampusFee = async (id) => {
    if (!id) { setDeliveryFee(0); setFeePreview(null); return; }
    try {
      const res = await mockApi.delivery.calculateFee({ delivery_type: 'on_campus', delivery_location_id: id });
      setDeliveryFee(res.delivery_fee ?? res.fee ?? 0);
    } catch { setDeliveryFee(0); }
    setFeePreview(null);
  };

  // Off-campus fee is distance-based. The backend derives distance + nearest
  // gate from the delivery pin's lat/lon (POST /delivery/calculate-fee with
  // { delivery_type, lat, lon }) and returns { delivery_fee, distance_km,
  // gate_name }. We keep refs to the latest pin + gate so the fee always reads
  // fresh values — avoiding the stale-state race where the first pin drop
  // (which also auto-selects the nearest gate in the same event) never
  // computed a fee. Requests are debounced so dragging doesn't flood the API.
  const pinRef = useRef(null);
  const gateRef = useRef(null);
  const feeTimer = useRef(null);

  const runFeeCalc = async () => {
    const ll = pinRef.current;
    if (!ll || ll.lat == null || ll.lng == null) { setDeliveryFee(0); setFeePreview(null); return; }
    const body = { delivery_type: 'off_campus', lat: ll.lat, lon: ll.lng };
    if (gateRef.current) body.gate_id = gateRef.current;
    try {
      const res = await mockApi.delivery.calculateFee(body);
      const fee = res.delivery_fee ?? res.fee ?? 0;
      setDeliveryFee(fee);
      setFeePreview({ fee, km: res.distance_km ?? null, gateName: res.gate_name || gateRef.current });
    } catch {
      setDeliveryFee(0); setFeePreview(null);
    }
  };

  const calcOffCampusFee = (gid, ll) => {
    if (gid !== undefined && gid !== null) gateRef.current = gid;
    if (ll && ll.lat != null) pinRef.current = ll;
    if (feeTimer.current) clearTimeout(feeTimer.current);
    feeTimer.current = setTimeout(runFeeCalc, 350);
  };

  const handlePlaceOrder = async () => {
    setError(null);
    // When the store is closed the student can still place a SCHEDULED order, but
    // only if a valid future window was chosen (carried from the closed-store
    // popup). No window → block, per spec.
    const scheduled = !windowStatus?.is_open ? scheduledWindow : null;
    if (!windowStatus?.is_open && !scheduled) { setError('Ordering is currently closed — schedule a future window or try again later.'); return; }
    if (scheduled && !scheduled.id) { setError('Please pick a delivery window for your scheduled order.'); return; }
    if (!deliveryType) { setError('Please choose on-campus or off-campus delivery'); return; }
    if (deliveryType === 'on_campus' && !hostelId) { setError('Please select your hostel'); return; }
    if (deliveryType === 'off_campus') {
      if (!deliveryPin || deliveryPin.lat == null || deliveryPin.lng == null) { setError('Drop your delivery pin on the map'); return; }
      if (!locationConfirmed) { setError('Please confirm your delivery location'); return; }
      if (!gateId) { setError('Please select your nearest gate'); return; }
    }
    if (!isAuthenticated) {
      if (!guestName.trim()) { setError('Please enter your name'); return; }
      if (!guestPhone.match(/^(0|\+234)\d{10}$/)) { setError('Phone must be 11 digits (080...) or +234 + 10 digits'); return; }
    }
    // Split payment: wallet_amount must be ≤ total AND ≤ wallet balance.
    if (effectivePayment === 'split' && isAuthenticated) {
      if (walletAmount <= 0) { setError('Enter a wallet amount for your split payment.'); return; }
      if (walletAmount > (wallet?.balance || 0)) { setError('Wallet amount can\'t exceed your balance.'); return; }
      if (walletAmount > total) { setError('Wallet amount can\'t exceed the order total.'); return; }
    }

    setPlacing(true);
    try {
      const payload = {
        // Spec §3.4 — items carry selected_variations:[{option_id}] and
        // selected_addons:[{addon_id, quantity}]. The cart already stores the
        // server shapes; we only normalise to the spec keys so the backend no
        // longer rejects with "required field".
        items: (cart?.items || []).map((ci) => ({
          menu_item_id: ci.menu_item_id,
          quantity: ci.quantity,
          notes: ci.notes || undefined,
          selected_variations: (ci.selected_variations || []).map((v) => ({ option_id: v.option_id || v.id || v })),
          selected_addons: (ci.selected_addons || []).map((a) => ({ addon_id: a.addon_id || a.id || a, quantity: a.quantity || 1 })),
        })),
        payment_method: effectivePayment,
        delivery_type: deliveryType,
        promo_code: passed.promoResult?.code,
        squad_name: passed.squadEnabled ? passed.squadName : undefined,
        squad_members: passed.squadEnabled ? passed.squadMembers : undefined,
        notes,
        ...(paymentMethod === 'split' && isAuthenticated ? { wallet_amount: walletAmount } : {}),
        ...(freeSideChoice ? { free_side_credit: true, free_side_choice: freeSideChoice } : {}),
        ...(!isAuthenticated ? { guest_name: guestName, guest_phone: guestPhone } : {}),
        ...(deliveryType === 'on_campus'
          ? { delivery_location_id: hostelId }
          : {
            delivery_location_lat: deliveryPin.lat,
            delivery_location_lon: deliveryPin.lng,
            delivery_address: deliveryAddress || landmark || 'Off-campus delivery',
            landmark: landmark || undefined,
            gate_id: gateId,
          }),
        ...(selectedGlobalAddonIds.length ? { addon_ids: selectedGlobalAddonIds } : {}),
        // Spec §3.4 — scheduled orders use is_scheduled + scheduled_date (ISO).
        ...(scheduled ? { delivery_window_id: scheduled.id, is_scheduled: true, scheduled_date: scheduled.starts_at } : {}),
      };
      const result = await mockApi.orders.create(payload);
      const order = result?.order || result;
      play('order_placed');
      if (isAuthenticated) { try { await refreshUser(); } catch { /* ignore */ } }
      // Clear the guest cart + store guest order for track-order access without auth.
      if (!isAuthenticated) {
        localStorage.removeItem('hg_guest_cart');
        try {
          const guestOrders = JSON.parse(localStorage.getItem('hg_guest_orders') || '[]');
          guestOrders.unshift({ id: order?.id, claim_token: order?.claim_token, created_at: new Date().toISOString(), total: order?.total_amount || total });
          localStorage.setItem('hg_guest_orders', JSON.stringify(guestOrders.slice(0, 10)));
        } catch { /* ignore */ }
      }
      if (scheduled) { try { sessionStorage.removeItem('hg_scheduled_window'); } catch { /* ignore */ } }
      navigate(`/order-confirmation/${order?.id || 'pending'}`, { state: { claim_token: order?.claim_token, guest: !isAuthenticated } });
    } catch (e) { setError(e.message); }
    setPlacing(false);
  };

  if (loading) return <LoadingSpinner label="Preparing checkout..." />;

  return (
    <div className="space-y-4 animate-fade-in pb-24">
      <button onClick={() => navigate('/cart')} className="flex items-center gap-1 text-sm text-cocoa-500"><ChevronLeft className="w-4 h-4" /> Back to cart</button>
      <h1 className="font-heading font-bold text-xl text-cocoa-800">Checkout</h1>

      {!isAuthenticated && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-flame-50 border border-flame-200">
          <User className="w-4 h-4 text-flame-600 shrink-0" />
          <div className="text-xs text-flame-800">Guest checkout — pay by card. <button onClick={() => navigate('/login')} className="font-bold underline">Sign in</button> to use wallet & earn HP.</div>
        </div>
      )}

      {passed.squadEnabled && (
        <div className="text-xs text-primary font-semibold">Squad order: {passed.squadName}</div>
      )}

      {scheduledWindow && !windowStatus?.is_open && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-gold-100 border border-gold-200">
          <Clock className="w-4 h-4 text-gold-700 shrink-0" />
          <div className="text-xs text-cocoa-700">
            Scheduled for <span className="font-bold">{scheduledWindow.label || 'next window'}</span>
            {scheduledWindow.starts_at ? ` · ${new Date(scheduledWindow.starts_at).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}` : ''}
          </div>
          <button
            onClick={() => { setScheduledWindow(null); try { sessionStorage.removeItem('hg_scheduled_window'); } catch { /* ignore */ } }}
            className="ml-auto text-xs font-bold text-cocoa-500 underline"
          >
            Clear
          </button>
        </div>
      )}

      {/* Guest details */}
      {!isAuthenticated && (
        <div className="hg-card space-y-2">
          <h3 className="hg-section-title flex items-center gap-2"><User className="w-4 h-4 text-flame-600" /> Your Details</h3>
          <input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Full name" className="w-full p-3 rounded-xl border border-cocoa-200 text-sm focus:outline-none focus:border-flame-400" />
          <input value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} placeholder="08012345678" className="w-full p-3 rounded-xl border border-cocoa-200 text-sm focus:outline-none focus:border-flame-400" />
        </div>
      )}

      {/* Saved addresses */}
      {isAuthenticated && (
        <div className="hg-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="hg-section-title flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> Saved Addresses</h3>
            <Link to="/addresses" className="flex items-center gap-1 text-xs font-bold text-primary hover:underline">
              <Edit2 className="w-3 h-3" /> Edit
            </Link>
          </div>
          {addresses.length > 0 ? (
            <div className="space-y-2">
              {addresses.map((addr) => (
                <button
                  key={addr.id}
                  onClick={() => {
                    if (addr.delivery_type) setDeliveryType(addr.delivery_type);
                    if (addr.delivery_type === 'on_campus' && (addr.hostel_id || addr.delivery_location_id)) {
                      const hid = addr.hostel_id || addr.delivery_location_id;
                      setHostelId(hid); calcOnCampusFee(hid);
                    }
                    if (addr.delivery_type === 'off_campus') {
                      const gid = addr.gate_id || addr.delivery_location_id;
                      if (gid) setGateId(gid);
                      // Restore the saved pin so the map shows it and the fee
                      // calculates from the saved coordinates — not a blank map.
                      const savedPin = (addr.lat != null && addr.lng != null) ? { lat: addr.lat, lng: addr.lng } : null;
                      if (savedPin) { setDeliveryPin(savedPin); setDeliveryAddress(addr.line1 || addr.description || addr.address || ''); setLocationConfirmed(false); }
                      calcOffCampusFee(gid, savedPin);
                    }
                  }}
                  className="w-full flex items-center gap-2 p-3 rounded-xl border border-border text-left hover:border-primary transition-colors bg-card"
                >
                  <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground truncate">{addr.label || addr.name || 'Saved address'}</div>
                    <div className="text-xs text-muted-foreground truncate">{addr.description || addr.address || addr.line1 || ''}</div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <Link to="/addresses" className="text-xs text-primary font-semibold hover:underline">+ Add a saved address</Link>
          )}
        </div>
      )}

      {/* Delivery location */}
      <div className="hg-card">
        <h3 className="hg-section-title mb-3 flex items-center gap-2"><MapPin className="w-4 h-4 text-flame-600" /> Delivery Location</h3>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => { setDeliveryType('on_campus'); setHostelId(null); setGateId(null); setDeliveryFee(0); setDeliveryPin(null); setDeliveryAddress(''); setLandmark(''); setFeePreview(null); }} className={`p-3 rounded-xl border text-center transition-all ${deliveryType === 'on_campus' ? 'border-flame-400 bg-flame-50' : 'border-cocoa-200 hover:border-cocoa-300'}`}>
            <div className="text-xl mb-0.5">🏫</div><div className="text-xs font-semibold text-cocoa-700">On Campus</div>
          </button>
          <button onClick={() => { setDeliveryType('off_campus'); setHostelId(null); setGateId(null); setDeliveryFee(0); setDeliveryAddress(''); setLandmark(''); }} className={`p-3 rounded-xl border text-center transition-all ${deliveryType === 'off_campus' ? 'border-flame-400 bg-flame-50' : 'border-cocoa-200 hover:border-cocoa-300'}`}>
            <div className="text-xl mb-0.5">🏠</div><div className="text-xs font-semibold text-cocoa-700">Off Campus</div>
          </button>
        </div>

        {deliveryType === 'on_campus' && (
          <div className="mt-3 animate-fade-in">
            <label className="text-xs font-semibold text-cocoa-500 uppercase tracking-wide">Select Hostel</label>
            <div className="grid grid-cols-2 gap-2 mt-1.5">
              {hostels.map((h) => (
              <button key={h.id} onClick={() => { setHostelId(h.id); calcOnCampusFee(h.id); }} className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${hostelId === h.id ? 'border-flame-400 bg-flame-50 text-flame-700' : 'border-cocoa-200 text-cocoa-600 hover:border-cocoa-300'}`}>
                  {h.name}
                  <div className="text-[10px] font-normal text-cocoa-400">{formatNaira(h.delivery_fee)}</div>
                </button>
              ))}
              {hostels.length === 0 && <p className="text-xs text-cocoa-400 col-span-2">No hostels available.</p>}
            </div>
          </div>
        )}

        {deliveryType === 'off_campus' && (
          <div className="mt-3 animate-fade-in space-y-3">
            {/* Draggable map — drop your exact delivery pin */}
            <label className="text-xs font-semibold text-cocoa-500 uppercase tracking-wide">Drop your delivery pin</label>
            <OffCampusMap
              gates={gates}
              pin={deliveryPin}
              confirmed={locationConfirmed}
              onPinChange={(ll) => { setDeliveryPin(ll); setLocationConfirmed(false); calcOffCampusFee(gateId, ll); }}
              onConfirmLocation={() => setLocationConfirmed(true)}
              selectedGateId={gateId}
              onGateSelect={(g) => { setGateId(g.id); calcOffCampusFee(g.id, deliveryPin); }}
              feePreview={feePreview}
            />

            {/* Gate selector — hidden by default; toggle on if pin/GPS isn't visible */}
            <div>
              <button
                type="button"
                onClick={() => setShowGateSelector((v) => !v)}
                className="flex items-center gap-2 text-xs font-semibold text-flame-600"
              >
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showGateSelector ? 'rotate-180' : ''}`} />
                {showGateSelector ? 'Hide gate selector' : 'Can\'t see your location? Select closest gate'}
              </button>
              {showGateSelector && (
                <div className="grid grid-cols-2 gap-2 mt-1.5 animate-fade-in">
                  {gates.map((g) => (
                    <button key={g.id} onClick={() => { setGateId(g.id); calcOffCampusFee(g.id, deliveryPin); }} className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${gateId === g.id ? 'border-flame-400 bg-flame-50 text-flame-700' : 'border-cocoa-200 text-cocoa-600 hover:border-cocoa-300'}`}>
                      {g.name}
                      <div className="text-[10px] font-normal text-cocoa-400">{formatNaira(g.base_fee)}</div>
                    </button>
                  ))}
                  {gates.length === 0 && <p className="text-xs text-cocoa-400 col-span-2">No gates available.</p>}
                </div>
              )}
            </div>

            {/* Exact address snapshot */}
            <div>
              <label className="text-xs font-semibold text-cocoa-500 uppercase tracking-wide">Exact address / description</label>
              <input value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder="e.g. Behind the market, near the blue gate" className="w-full mt-1.5 p-3 rounded-xl border border-cocoa-200 text-sm focus:outline-none focus:border-flame-400" />
            </div>

            {/* Landmark — helps the rider */}
            <div>
              <label className="text-xs font-semibold text-cocoa-500 uppercase tracking-wide">Landmark (optional)</label>
              <input value={landmark} onChange={(e) => setLandmark(e.target.value)} placeholder="e.g. Behind the market" className="w-full mt-1.5 p-3 rounded-xl border border-cocoa-200 text-sm focus:outline-none focus:border-flame-400" />
            </div>
          </div>
        )}
      </div>

      {/* Payment method */}
      <div className="hg-card">
        <h3 className="hg-section-title mb-2 flex items-center gap-2"><CreditCard className="w-4 h-4 text-flame-600" /> Payment Method</h3>
        <div className="space-y-2">
          {[
            { id: 'wallet', label: 'Wallet', icon: Wallet, desc: wallet ? `Balance: ${formatNaira(wallet.balance)}` : '', authOnly: true },
            { id: 'card', label: 'Card', icon: CreditCard, desc: 'Paystack secure payment' },
            { id: 'split', label: 'Split (Wallet + Card)', icon: Split, desc: 'Pay part with wallet, rest with card', authOnly: true },
          ].filter((pm) => !pm.authOnly || isAuthenticated).map((pm) => {
            const Icon = pm.icon;
            return (
              <button key={pm.id} onClick={() => setPaymentMethod(pm.id)} className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${effectivePayment === pm.id ? 'border-flame-400 bg-flame-50' : 'border-cocoa-200'}`}>
                <Icon className="w-5 h-5 text-cocoa-500" />
                <div className="flex-1 text-left"><div className="text-sm font-semibold text-cocoa-700">{pm.label}</div>{pm.desc && <div className="text-xs text-cocoa-400">{pm.desc}</div>}</div>
                <div className={`w-5 h-5 rounded-full border-2 ${effectivePayment === pm.id ? 'border-flame-600 bg-flame-600' : 'border-cocoa-300'}`}>{effectivePayment === pm.id && <Check className="w-3 h-3 text-white m-auto mt-0.5" />}</div>
              </button>
            );
          })}
        </div>
        {effectivePayment === 'split' && (
          <div className="mt-3 animate-slide-up">
            <label className="text-xs font-semibold text-cocoa-500 uppercase tracking-wide">Wallet Amount (max {formatNaira(Math.min(wallet?.balance || 0, total))})</label>
            <input type="number" value={walletAmount} onChange={(e) => setWalletAmount(Math.min(wallet?.balance || 0, total, Math.max(0, parseInt(e.target.value) || 0)))} max={Math.min(wallet?.balance || 0, total)} className="w-full mt-1 p-3 rounded-xl border border-cocoa-200 text-sm focus:outline-none focus:border-flame-400" />
            <p className="text-xs text-cocoa-400 mt-1">Card portion: {formatNaira(Math.max(0, total - walletAmount))}</p>
          </div>
        )}
        {effectivePayment === 'wallet' && wallet && wallet.balance < total && (
          <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <div className="flex-1 text-xs text-red-800">Insufficient balance. Need {formatNaira(total - wallet.balance)} more.</div>
            <button onClick={() => navigate('/wallet')} className="text-xs font-bold text-red-600 underline">Fund</button>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="hg-card">
        <label className="text-xs font-semibold text-cocoa-500 uppercase tracking-wide">Order Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Call before delivery, extra packaging, etc." className="w-full mt-1 p-3 rounded-xl border border-cocoa-200 text-sm resize-none focus:outline-none focus:border-flame-400" rows={2} />
      </div>

      {/* Free side credit banner — auth only */}
      {isAuthenticated && freeSideCredits.count > 0 && (
        <div className="rounded-2xl bg-flame-50 border border-flame-200 p-3 flex items-center gap-3">
          <span className="text-xl">🏆</span>
          <div className="flex-1 text-xs text-cocoa-700">
            You have <span className="font-bold text-flame-600">{freeSideCredits.count}</span> free side credit{freeSideCredits.count !== 1 ? 's' : ''}!
            {freeSideChoice && <span className="text-green-600 font-semibold"> · {freeSideChoice} added at ₦0</span>}
          </div>
          <button onClick={() => setShowFreeSide(true)} className="px-3 py-1.5 rounded-full flame-gradient text-white text-xs font-bold shrink-0">
            {freeSideChoice ? 'Change' : 'Use one'}
          </button>
        </div>
      )}

      {/* Complete your meal — admin-managed "Checkout Add-Ons" category */}
      {checkoutAddons.length > 0 && (
        <div className="hg-card">
          <h3 className="hg-section-title mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4 text-flame-600" /> Complete your meal</h3>
          <div className="grid grid-cols-2 gap-2">
            {checkoutAddons.map((a) => (
              <button
                key={a.id}
                onClick={async () => {
                  try { play('cart_add'); await addToCart({ menu_item_id: a.id, quantity: 1 }); toast({ title: '🔥 Added', description: a.name }); }
                  catch (e) { toast({ title: 'Could not add', description: e.message, variant: 'destructive' }); }
                }}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-cocoa-200 text-left hover:border-flame-300 transition"
              >
                {a.image_url && <img src={a.image_url} alt={a.name} className="w-9 h-9 rounded-lg object-cover" />}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-cocoa-800 truncate">{a.name}</div>
                  <div className="text-[10px] text-cocoa-400">{formatNaira(a.price)}</div>
                </div>
                <Plus className="w-4 h-4 text-flame-600 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Order-level extras — global add-ons (no min/max, added to the whole order) */}
      {globalAddons.length > 0 && (
        <div className="hg-card">
          <h3 className="hg-section-title mb-2 flex items-center gap-2"><Plus className="w-4 h-4 text-flame-600" /> Add extras to your order</h3>
          <div className="space-y-2">
            {globalAddons.filter((a) => a.is_available !== false).map((a) => {
              const on = selectedGlobalAddonIds.includes(a.id);
              return (
                <button
                  key={a.id}
                  onClick={() => setSelectedGlobalAddonIds((ids) => (on ? ids.filter((x) => x !== a.id) : [...ids, a.id]))}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition ${on ? 'border-flame-400 bg-flame-50' : 'border-cocoa-200 hover:border-cocoa-300'}`}
                >
                  <span className="text-sm font-medium text-cocoa-700">{a.name}</span>
                  <span className="text-xs font-bold text-cocoa-500">+{formatNaira(a.price)}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Order summary — at the bottom after all selections */}
      <div className="rounded-2xl bg-card border border-border p-4 space-y-1.5 text-sm shadow-cart-card">
        <div className="font-heading font-bold text-base text-foreground mb-2">Order Summary</div>
        <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-semibold text-foreground">{formatNaira(subtotal)}</span></div>
        {promoDiscount > 0 && <div className="flex justify-between text-green-600"><span>Promo ({passed.promoResult?.code})</span><span>-{formatNaira(promoDiscount)}</span></div>}
        {squadDiscount > 0 && <div className="flex justify-between text-green-600"><span>Squad ({squadSubPct}%)</span><span>-{formatNaira(squadDiscount)}</span></div>}
        {freeSideChoice && <div className="flex justify-between text-green-600"><span>🏆 Reward · {freeSideChoice}</span><span>₦0</span></div>}
        <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span className="font-semibold">{effectiveDeliveryFee > 0 ? formatNaira(effectiveDeliveryFee) : <span className="text-green-600">FREE</span>}</span></div>
        {squadDeliveryPct > 0 && deliveryFee > 0 && <div className="flex justify-between text-green-600"><span>Squad delivery ({squadDeliveryPct}%)</span><span>-{formatNaira(deliveryFee - effectiveDeliveryFee)}</span></div>}
        {globalAddonsTotal > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Extras</span><span className="font-semibold">{formatNaira(globalAddonsTotal)}</span></div>}
        {hpPreview > 0 && <div className="flex justify-between text-gold-700"><span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-flame-500" /> You'll earn</span><span className="font-semibold">+{hpPreview} HP</span></div>}
        <div className="border-t border-border pt-1.5 flex justify-between"><span className="font-semibold text-foreground">Total</span><span className="font-heading font-bold text-lg text-foreground">{formatNaira(total)}</span></div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span className="text-sm text-red-800">{error}</span>
        </div>
      )}

      <button onClick={handlePlaceOrder} disabled={placing} className="w-full py-4 rounded-button flame-gradient text-white font-bold shadow-selected-soft disabled:opacity-50 active:scale-[0.98] transition-transform">
        {placing ? 'Placing order...' : `Place Order · ${formatNaira(total)}`}
      </button>

      <FreeSideCreditModal
        open={showFreeSide}
        count={freeSideCredits.count}
        onClose={() => setShowFreeSide(false)}
        onUse={(choice) => {
          setFreeSideChoice(choice);
          setShowFreeSide(false);
          toast({ title: '🏆 Free side added', description: `${choice} added to your order at ₦0. Your credit is used when you place the order.` });
        }}
      />
    </div>
  );
}