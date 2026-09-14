import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Gift, Heart, ShoppingBag } from 'lucide-react';
import { useNavigate } from '@/lib/router';
import { CartItemCard } from '@/components/cart/CartItemCard';
import { CartSummary } from '@/components/cart/CartSummary';
import { EmptyCart } from '@/components/cart/EmptyCart';
import { EmptyState } from '@/components/shared/EmptyState';
import { Input } from '@/components/ui/input';
import { calculateCartTotals, createCartLineId } from '@/utils/pricing';
import { DELIVERY_FEE } from '@/data/menu';
import { getCartSnapshot } from '@/services/api/cart.service';
import { getMenuItems } from '@/services/api/menu.service';
import { validatePromoCode } from '@/services/api/order.service';
import { getSavedItems, moveCartToSaved, moveSavedToCart, removeSavedItem, saveItem } from '@/services/api/saved.service';
import { useCartStore } from '@/stores/cartStore';
import { useFavouritesStore } from '@/stores/favouritesStore';
import { useAuthStore } from '@/stores/authStore';
import type { MenuItem } from '@/types';
import { toast } from 'sonner';

interface DisplaySavedItem {
  id: string;
  savedItemId?: string;
  name: string;
  description?: string;
  price: number;
  imageUrl: string;
  hpValue: number;
  isAvailable: boolean;
  category: string;
}

const CartPage = ({ initialTab = 'cart' }: { initialTab?: 'cart' | 'saved' }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'cart' | 'saved'>(initialTab);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<number>(0);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [guestCheckout, setGuestCheckout] = useState(false);
  const [redeemHP, setRedeemHP] = useState(true);
  const { items, updateQuantity, removeItem, addItem } = useCartStore();
  const { items: favItems, toggle: toggleFav } = useFavouritesStore();
  const { user, isAuthenticated } = useAuthStore();

  const { data } = useQuery({
    queryKey: ['cart-snapshot', items],
    queryFn: () => getCartSnapshot(items),
    initialData: { items, walletBalance: 8400, availableHP: 248 },
  });

  const { data: menuItems = [] } = useQuery({
    queryKey: ['menu-items'],
    queryFn: getMenuItems,
  });

  const { data: apiSavedItems = [] } = useQuery({
    queryKey: ['saved-items'],
    queryFn: getSavedItems,
    enabled: isAuthenticated,
  });

  const savedList = useMemo<DisplaySavedItem[]>(() => {
    if (isAuthenticated && apiSavedItems.length > 0) {
      return apiSavedItems.map((item) => ({
        id: item.menu_item_id || item.id,
        savedItemId: item.id,
        name: item.menu_item?.name || 'Menu Item',
        description: '',
        price: item.menu_item?.price || 0,
        imageUrl: item.menu_item?.imageUrl || item.menu_item?.image_url || '/placeholder.svg',
        hpValue: item.menu_item?.hpValue || item.menu_item?.hp_value || 10,
        isAvailable: item.menu_item?.isAvailable ?? item.menu_item?.is_available ?? true,
        category: 'general',
      }));
    }
    return favItems;
  }, [apiSavedItems, favItems, isAuthenticated]);

  const availableHP = isAuthenticated ? (user?.hp_balance ?? data.availableHP) : data.availableHP;
  const walletBalance = isAuthenticated ? (user?.wallet_balance ?? data.walletBalance) : data.walletBalance;
  const hpRedemption = redeemHP && items.length ? Math.min(600, availableHP * 2) : 0;
  const totals = useMemo(
    () => calculateCartTotals({ items, deliveryFee: DELIVERY_FEE, promoDiscount: appliedPromo, hpRedemption }),
    [appliedPromo, hpRedemption, items]
  );

  const applyPromo = async () => {
    if (!promoCode.trim()) {
      toast.error('Invalid promo code.');
      return;
    }

    setIsValidatingPromo(true);
    try {
      const res = await validatePromoCode(promoCode.trim(), totals.subtotal);
      if (res.valid) {
        setAppliedPromo(res.discount_amount);
        toast.success('Promo code applied!');
      } else {
        toast.error(res.message || 'Invalid promo code.');
      }
    } catch {
      toast.error('Invalid promo code.');
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handleMoveSavedToCart = async (item: DisplaySavedItem) => {
    const basePrice = item.price;
    const lineId = createCartLineId(item.id);
    addItem({ id: lineId, menuItemId: item.id, name: item.name, price: basePrice, imageUrl: item.imageUrl, hpValue: item.hpValue });

    if (isAuthenticated && item.savedItemId) {
      try {
        await moveSavedToCart(item.savedItemId);
        queryClient.invalidateQueries({ queryKey: ['saved-items'] });
      } catch {
        // fallback
      }
    }
    const matchingFav = favItems.find((f) => f.id === item.id);
    if (matchingFav) toggleFav(matchingFav);

    toast.success(`${item.name} moved to cart`);
  };

  const handleSaveCartItemToSaved = async (item: (typeof items)[number]) => {
    const menuItemId = item.menuItemId || item.id;
    if (isAuthenticated) {
      try {
        await moveCartToSaved(item.id);
        queryClient.invalidateQueries({ queryKey: ['saved-items'] });
      } catch {
        try {
          await saveItem({ menu_item_id: menuItemId, quantity: item.quantity });
          queryClient.invalidateQueries({ queryKey: ['saved-items'] });
        } catch {
          // fallback
        }
      }
    }

    const menuItem = menuItems.find((entry) => entry.id === menuItemId);
    if (menuItem && !favItems.some((entry) => entry.id === menuItem.id)) {
      toggleFav(menuItem);
    }

    removeItem(item.id);
    toast.success('Moved item to saved list');
  };

  const handleRemoveSaved = async (item: DisplaySavedItem) => {
    if (isAuthenticated && item.savedItemId) {
      try {
        await removeSavedItem(item.savedItemId);
        queryClient.invalidateQueries({ queryKey: ['saved-items'] });
      } catch {
        // fallback
      }
    }
    const matchingFav = favItems.find((f) => f.id === item.id);
    if (matchingFav) toggleFav(matchingFav);

    toast.success('Item removed from saved');
  };

  return (
    <main className="flex-1 pb-12 md:pt-24">
      <div className="container mx-auto space-y-6 px-4">
        <div className="inline-flex rounded-full border border-border bg-card p-1">
          {[
            { key: 'cart', label: `My cart (${items.length})` },
            { key: 'saved', label: `Saved items (${savedList.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'cart' | 'saved')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${activeTab === tab.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="space-y-6">
            {activeTab === 'cart' ? (
              items.length ? (
                <div className="space-y-4">
                  {items.map((item) => (
                    <CartItemCard
                      key={item.id}
                      mode="cart"
                      item={item}
                      quantity={item.quantity}
                      onIncrement={() => updateQuantity(item.id, item.quantity + 1)}
                      onDecrement={() => updateQuantity(item.id, item.quantity - 1)}
                      onRemove={() => removeItem(item.id)}
                      onMoveToSaved={() => handleSaveCartItemToSaved(item)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyCart />
              )
            ) : savedList.length ? (
              <div className="space-y-4">
                {savedList.map((item) => (
                  <CartItemCard key={item.id} mode="saved" item={item as MenuItem} onMoveToCart={() => handleMoveSavedToCart(item)} onRemove={() => handleRemoveSaved(item)} />
                ))}
              </div>
            ) : (
              <EmptyState icon={Heart} title="No saved items yet" description="Save dishes from the menu to keep them ready for the next delivery window." ctaLabel="Browse menu" ctaTo="/menu" />
            )}

            <div className="grid gap-4 rounded-[2rem] border border-border bg-card p-5 md:grid-cols-2">
              <div>
                <p className="text-sm font-semibold text-foreground">Promo code</p>
                <p className="mt-1 text-xs text-muted-foreground">Use codes like STUDENT10 or FREEDELIVERY.</p>
                <div className="mt-3 flex gap-2">
                  <Input value={promoCode} onChange={(event) => setPromoCode(event.target.value)} placeholder="Enter promo code" aria-label="Promo code" />
                  <button onClick={applyPromo} className="rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground">Apply</button>
                </div>
              </div>
              <div className="space-y-3 rounded-3xl bg-secondary/60 p-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Wallet balance</span>
                  <span className="font-semibold text-foreground">{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(walletBalance)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Available HP</span>
                  <span className="font-semibold text-foreground">{availableHP} HP</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Redeem HP</span>
                  <button onClick={() => setRedeemHP((value) => !value)} className={`rounded-full px-3 py-1 text-xs font-semibold ${redeemHP ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground'}`}>
                    {redeemHP ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Guest checkout</span>
                  <button onClick={() => setGuestCheckout((value) => !value)} className={`rounded-full px-3 py-1 text-xs font-semibold ${guestCheckout ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground'}`}>
                    {guestCheckout ? 'Guest path' : 'Signed in'}
                  </button>
                </div>
              </div>
            </div>

          </div>

          <CartSummary
            subtotal={totals.subtotal}
            deliveryFee={items.length ? DELIVERY_FEE : 0}
            promoDiscount={appliedPromo}
            hpRedemption={hpRedemption}
            total={totals.payableTotal}
            hpToEarn={totals.hpToEarn}
            checkoutLabel={guestCheckout ? 'Guest checkout' : 'Checkout'}
            isCheckoutDisabled={!items.length}
            onCheckout={() => navigate('/checkout')}
          />
        </div>
      </div>
    </main>
  );
};

export default CartPage;
