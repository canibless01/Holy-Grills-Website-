import apiClient from '@/lib/api/client';
import type { CartItem } from '@/types';

export interface CartResponse {
  items: CartItem[];
  walletBalance: number;
  availableHP: number;
}

function unwrapData<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data;
  }

  return payload as T;
}

function asNumber(value: unknown, fallback = 0): number {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function mapItems(items: unknown, fallbackItems: CartItem[]): CartItem[] {
  if (!Array.isArray(items)) return fallbackItems;

  return items.map((entry, index) => {
    const source = (entry ?? {}) as Record<string, unknown>;

    return {
      id: typeof source.id === 'string' ? source.id : `cart-${index}`,
      menuItemId:
        typeof source.menuItemId === 'string'
          ? source.menuItemId
          : typeof source.menu_item_id === 'string'
            ? source.menu_item_id
            : undefined,
      name: typeof source.name === 'string' ? source.name : 'Cart item',
      price: asNumber(source.price ?? source.unit_price),
      quantity: Math.max(asNumber(source.quantity, 1), 1),
      imageUrl:
        typeof source.imageUrl === 'string'
          ? source.imageUrl
          : typeof source.image_url === 'string'
            ? source.image_url
            : '/placeholder.svg',
      hpValue: asNumber(source.hpValue ?? source.hp_value),
      sizeLabel:
        typeof source.sizeLabel === 'string'
          ? source.sizeLabel
          : typeof source.size_label === 'string'
            ? source.size_label
            : undefined,
      extras: Array.isArray(source.extras)
        ? source.extras.filter((item): item is string => typeof item === 'string')
        : undefined,
    };
  });
}

export async function getCartSnapshot(items: CartItem[]): Promise<CartResponse> {
  try {
    const response = await apiClient.get('/cart');
    const payload = unwrapData<Record<string, unknown>>(response.data);

    return {
      items: mapItems(payload.items, items),
      walletBalance: asNumber(payload.walletBalance ?? payload.wallet_balance),
      availableHP: asNumber(payload.availableHP ?? payload.available_hp ?? payload.hp_balance),
    };
  } catch {
    return { items, walletBalance: 0, availableHP: 0 };
  }
}
