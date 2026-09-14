import apiClient from '@/lib/api/client';

export interface SavedItem {
  id: string;
  user_id?: string;
  menu_item_id: string;
  quantity: number;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  menu_item?: {
    id: string;
    name: string;
    price: number;
    image_url?: string;
    imageUrl?: string;
    hp_value?: number;
    hpValue?: number;
    is_available?: boolean;
    isAvailable?: boolean;
  };
}

function unwrapData<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && payload !== null && 'data' in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

export async function getSavedItems(): Promise<SavedItem[]> {
  try {
    const response = await apiClient.get('/saved');
    const unwrapped = unwrapData<unknown>(response.data);
    const list = Array.isArray(unwrapped)
      ? unwrapped
      : Array.isArray((unwrapped as Record<string, unknown>)?.items)
      ? ((unwrapped as Record<string, unknown>).items as unknown[])
      : [];
    return list as SavedItem[];
  } catch {
    return [];
  }
}

export async function saveItem(payload: { menu_item_id: string; notes?: string; quantity?: number }): Promise<SavedItem> {
  const response = await apiClient.post('/saved', payload);
  return unwrapData<SavedItem>(response.data);
}

export async function removeSavedItem(itemId: string): Promise<void> {
  await apiClient.delete(`/saved/${itemId}`);
}

export async function updateSavedItem(itemId: string, payload: { notes?: string; quantity?: number }): Promise<SavedItem> {
  const response = await apiClient.patch(`/saved/${itemId}`, payload);
  return unwrapData<SavedItem>(response.data);
}

export async function moveSavedToCart(itemId: string): Promise<void> {
  await apiClient.post(`/saved/${itemId}/move-to-cart`);
}

export async function moveCartToSaved(cartItemId: string): Promise<void> {
  await apiClient.post(`/saved/from-cart/${cartItemId}`);
}
