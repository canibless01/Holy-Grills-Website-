import { useEffect, useState } from 'react';
import { useNavigate, Link } from '@/lib/router';
import { useCartStore, selectSubtotal, selectTotalHP } from '@/stores/cartStore';
import { DELIVERY_FEE, formatPrice } from '@/data/menu';
import { Flame, Loader2, MapPin, Home, Clock, UserRound, Mail, Phone, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { FulfillmentDialog } from '@/components/checkout/FulfillmentDialog';
import { hasDeliveryInfo, hasPickupInfo, useFulfillmentStore } from '@/stores/fulfillmentStore';
import { useAuthStore } from '@/stores/authStore';
import { createOrderApi } from '@/services/api/order.service';

const CheckoutPage = () => {
  const { items } = useCartStore();
  const subtotal = useCartStore(selectSubtotal);
  const totalHP = useCartStore(selectTotalHP);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  const { method, deliveryInfo, pickupInfo, setMethod } = useFulfillmentStore();
  const deliveryReady = useFulfillmentStore(hasDeliveryInfo);
  const pickupReady = useFulfillmentStore(hasPickupInfo);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Guest contact info
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestContactError, setGuestContactError] = useState('');

  const deliveryFee = method === 'delivery' ? DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;

  useEffect(() => {
    if (items.length === 0) navigate('/cart');
  }, [items.length, navigate]);

  if (items.length === 0) return null;

  const canPay = method === 'delivery' ? deliveryReady : pickupReady;

  const [capacityError, setCapacityError] = useState<{ nextDate?: string } | null>(null);

  const handlePay = async (acceptDeferred = false) => {
    if (!isAuthenticated) {
      if (!guestEmail.trim() && !guestPhone.trim()) {
        setGuestContactError('Please enter your email or phone number so we can identify your order.');
        return;
      }
      setGuestContactError('');
    }
    if (!canPay) {
      toast.error('Please select a delivery address.');
      setDialogOpen(true);
      return;
    }
    setLoading(true);
    setCapacityError(null);

    const payload = {
      items: items.map((i) => ({ menu_item_id: i.menuItemId ?? i.id, quantity: i.quantity })),
      payment_method: 'wallet',
      delivery_type: method === 'delivery' ? 'on_campus' : 'off_campus',
      delivery_location_id: deliveryInfo?.area || undefined,
      notes: deliveryInfo?.streetAddress,
      guest_email: !isAuthenticated ? guestEmail.trim() || undefined : undefined,
      guest_phone: !isAuthenticated ? guestPhone.trim() || undefined : undefined,
      accept_next_available_date: acceptDeferred ? true : undefined,
    };

    try {
      const res = await createOrderApi(payload);
      toast.success('Order placed successfully!');
      useCartStore.getState().clearCart();
      navigate(`/order-confirmation/${res.id}`, { state: { order: res } });
    } catch (err: unknown) {
      const errObj = (err as { response?: { data?: { error?: string; next_available_date?: string } } })?.response?.data;
      if (errObj?.next_available_date || errObj?.error?.includes('CAPACITY')) {
        setCapacityError({ nextDate: errObj.next_available_date || 'the next opening date' });
      } else {
        toast.error('Order placement failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderDeliverySummary = () => (
    <div className="space-y-1 text-sm font-body">
      <p className="text-muted-foreground">{deliveryInfo?.zone || 'Zone not set'}{deliveryInfo?.area ? ` • ${deliveryInfo.area}` : ''}</p>
      <p className="text-foreground">{deliveryInfo?.streetAddress || 'Not set'}</p>
      <p className="text-muted-foreground">{deliveryInfo?.city || 'City not set'}</p>
      {deliveryInfo?.landmark && <p className="text-muted-foreground">Landmark: {deliveryInfo.landmark}</p>}
      {deliveryInfo?.phone && <p className="text-muted-foreground">Phone: {deliveryInfo.phone}</p>}
      {!deliveryReady && <p className="text-destructive text-xs">Complete required fields.</p>}
    </div>
  );

  const renderPickupSummary = () => (
    <div className="space-y-1 text-sm font-body">
      <p className="text-foreground">{pickupInfo?.restaurantAddress || 'Address not set'}</p>
      <p className="text-muted-foreground">
        {pickupInfo?.pickupDate ? `${pickupInfo.pickupDate} • ${pickupInfo?.pickupWindow || 'Window not set'}` : 'Pickup date/window not set'}
      </p>
      {pickupInfo?.name && <p className="text-muted-foreground">Name: {pickupInfo.name}</p>}
      {pickupInfo?.riderName && <p className="text-muted-foreground">Rider: {pickupInfo.riderName}</p>}
      {pickupInfo?.phone && <p className="text-muted-foreground">Phone: {pickupInfo.phone}</p>}
      {!pickupReady && <p className="text-destructive text-xs">Complete required fields.</p>}
    </div>
  );

  return (
    <main className="flex-1 md:pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="font-display font-bold text-foreground text-2xl md:text-3xl mb-8">Checkout</h1>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Fulfillment & payment */}
          <div className="md:col-span-3 space-y-5">

            {/* Guest contact (only shown if not authenticated) */}
            {!isAuthenticated && (
              <div className="bg-card rounded-lg border border-border p-5 space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground font-body uppercase tracking-wide">Guest Checkout</p>
                  <h3 className="font-display font-bold text-foreground text-base">Contact Info</h3>
                   <p className="text-xs text-muted-foreground font-body mt-1">
                     Provide your email or phone so we can track your order.{' '}
                     <Link to="/signup" className="text-primary hover:underline">Create an account</Link>{' '}
                     for full order history.
                   </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground font-body mb-1">
                      <Mail size={13} className="text-primary" /> Email
                    </label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => { setGuestEmail(e.target.value); setGuestContactError(''); }}
                      placeholder="you@example.com"
                      className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground font-body mb-1">
                      <Phone size={13} className="text-primary" /> Phone
                    </label>
                    <input
                      type="tel"
                      value={guestPhone}
                      onChange={(e) => { setGuestPhone(e.target.value); setGuestContactError(''); }}
                      placeholder="08012345678"
                      className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
                {guestContactError && (
                  <p className="text-destructive text-xs font-body">{guestContactError}</p>
                )}
              </div>
            )}

            <div className="bg-card rounded-lg border border-border p-5 space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-xs text-muted-foreground font-body uppercase tracking-wide">Fulfillment</p>
                  <h3 className="font-display font-bold text-foreground text-base">Delivery or Pickup</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMethod('delivery')}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold ${method === 'delivery' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'}`}
                  >
                    Home Delivery
                  </button>
                  <button
                    onClick={() => setMethod('pickup')}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold ${method === 'pickup' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'}`}
                  >
                    Pickup Window
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-display text-foreground">
                    {method === 'delivery' ? <Home size={16} /> : <Clock size={16} />}
                    {method === 'delivery' ? 'Home Delivery' : 'Pickup Window'}
                  </div>
                  <button
                    onClick={() => setDialogOpen(true)}
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    {canPay ? 'Edit details' : 'Add details'}
                  </button>
                </div>

                <div className="rounded-lg border border-border bg-secondary/50 p-4">
                  {method === 'delivery' ? renderDeliverySummary() : renderPickupSummary()}
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-5">
              <h3 className="font-display font-bold text-foreground text-base mb-3">Payment</h3>
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-secondary border border-primary/30">
                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">₦</div>
                <span className="text-sm font-body text-foreground">Paystack — Cards, Bank Transfer, USSD</span>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="md:col-span-2">
            <div className="bg-card rounded-lg border border-border p-5 space-y-4 sticky top-24">
              <h3 className="font-display font-bold text-foreground text-base">Order Summary</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm font-body">
                    <span className="text-muted-foreground truncate mr-2">{item.quantity}× {item.name}</span>
                    <span className="text-foreground shrink-0">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-3 space-y-1.5 text-sm font-body">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span><span className="text-foreground">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>{method === 'pickup' ? 'Pickup' : 'Delivery'}</span>
                  <span className="text-foreground">{method === 'pickup' ? '₦0' : formatPrice(DELIVERY_FEE)}</span>
                </div>
                <div className="flex justify-between font-bold text-foreground text-base pt-1">
                  <span>Total</span><span className="text-primary">{formatPrice(total)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-accent/10 rounded-md px-3 py-2">
                <Flame size={14} className="text-accent" />
                <span className="text-xs font-body text-accent font-medium">+{totalHP} HP earned!</span>
              </div>

              {capacityError ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center space-y-2">
                  <div className="flex items-center justify-center gap-1.5 text-amber-800 font-semibold text-sm">
                    <AlertCircle size={16} /> Today's orders are full
                  </div>
                  <p className="text-xs text-amber-700">Schedule for {capacityError.nextDate} instead?</p>
                  <button
                    onClick={() => handlePay(true)}
                    disabled={loading}
                    className="w-full py-2.5 rounded-lg bg-amber-600 text-white font-display font-bold text-xs hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    {loading ? <Loader2 size={14} className="animate-spin" /> : `Schedule for ${capacityError.nextDate}`}
                  </button>
                </div>
              ) : null}

              <button
                onClick={() => handlePay(false)}
                disabled={loading || !canPay}
                className="w-full py-3 rounded-lg bg-gradient-fire text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 size={16} className="animate-spin" /> Processing...</> : `Pay ${formatPrice(total)}`}
              </button>
              {!canPay && (
                <p className="text-xs text-destructive font-body text-center">
                  Please save your {method === 'delivery' ? 'delivery address' : 'pickup details'} first.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <FulfillmentDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </main>
  );
};

export default CheckoutPage;
