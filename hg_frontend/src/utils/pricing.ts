import type { CartItem, MenuItem } from '@/types';

export function getMenuItemBasePrice(item: MenuItem, selectedSize?: string | null) {
  if (!selectedSize || !item.sizes?.length) return item.price;
  return item.sizes.find((size) => size.label === selectedSize)?.price ?? item.price;
}

export function getExtrasTotal(item: MenuItem, selectedExtras: string[] = []) {
  return selectedExtras.reduce((total, extraTitle) => {
    const extra = item.extras?.find((entry) => entry.title === extraTitle);
    return total + (extra?.price ?? 0);
  }, 0);
}

export function getConfiguredMenuPrice(item: MenuItem, selectedSize?: string | null, selectedExtras: string[] = []) {
  return getMenuItemBasePrice(item, selectedSize) + getExtrasTotal(item, selectedExtras);
}

export function createCartLineId(menuItemId: string, selectedSize?: string | null, selectedExtras: string[] = []) {
  const extrasKey = [...selectedExtras].sort().join('__');
  return [menuItemId, selectedSize ?? 'default', extrasKey || 'no-extras'].join('::');
}

export function getCartQuantityForMenuItem(items: CartItem[], menuItemId: string) {
  return items.reduce((total, item) => total + ((item.menuItemId ?? item.id) === menuItemId ? item.quantity : 0), 0);
}

export function getPrimaryCartLineId(items: CartItem[], menuItemId: string) {
  return items.find((item) => (item.menuItemId ?? item.id) === menuItemId)?.id ?? menuItemId;
}

export function calculateCartTotals({
  items,
  deliveryFee,
  promoDiscount = 0,
  hpRedemption = 0,
  walletApplied = 0,
}: {
  items: CartItem[];
  deliveryFee: number;
  promoDiscount?: number;
  hpRedemption?: number;
  walletApplied?: number;
}) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const hpToEarn = items.reduce((sum, item) => sum + item.hpValue * item.quantity, 0);
  const totalBeforeCredits = subtotal + (items.length ? deliveryFee : 0) - promoDiscount - hpRedemption;
  const payableTotal = Math.max(totalBeforeCredits - walletApplied, 0);

  return {
    subtotal,
    hpToEarn,
    totalBeforeCredits: Math.max(totalBeforeCredits, 0),
    payableTotal,
  };
}
