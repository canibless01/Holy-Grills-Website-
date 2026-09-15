import apiClient from '@/lib/api/client';
import { MARKETPLACE_VENDORS } from '@/services/mocks/platform';

function unwrapData<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

export interface MarketplaceListingItem {
  id: string;
  name: string;
  category: string;
  hpPrice: number;
  cashPrice: number;
  locked: boolean;
  description: string;
  imageUrl?: string;
  stock: number;
  listingType: 'product' | 'digital';
  vendorName?: string;
  vendorEmail?: string;
}

export interface MarketplacePurchaseRecord {
  id: string;
  listing_id: string;
  title: string;
  code?: string;
  access_code?: string;
  quantity: number;
  pay_with_hp: boolean;
  status: string;
  payment_method?: string;
  created_at: string;
}

export interface VendorListingRequest {
  vendor_name: string;
  vendor_email: string;
  vendor_phone?: string;
  service_title: string;
  category: string;
  description: string;
  proposed_price: number | string;
}

export interface PurchasePayload {
  payment_method: string;
  payment_reference?: string;
  use_hp?: boolean;
  wallet_amount?: number | string;
}

function mapListing(raw: unknown, index: number): MarketplaceListingItem {
  const src = (raw ?? {}) as Record<string, unknown>;
  const listTypeRaw = asString(src.listingType ?? src.listing_type, 'product');
  const normalizedType = listTypeRaw === 'digital' ? 'digital' : 'product';

  return {
    id: asString(src.id, `mkt-${index}`),
    name: asString(src.name ?? src.title, 'Marketplace Drop'),
    category: asString(src.category, 'General'),
    hpPrice: asNumber(src.hpPrice ?? src.hp_price, 500),
    cashPrice: asNumber(src.cashPrice ?? src.cash_price ?? src.price, 2000),
    locked: Boolean(src.locked ?? false),
    description: asString(src.description, 'Peer marketplace listing on Holy Grills'),
    imageUrl: asString(src.imageUrl ?? src.image_url, '/placeholder.svg'),
    stock: asNumber(src.stock ?? src.inventory_count, 10),
    listingType: normalizedType,
    vendorName: asString(src.vendorName ?? src.vendor_name, 'Campus Vendor'),
    vendorEmail: asString(src.vendor_contact_email ?? src.vendor_email, ''),
  };
}

export async function getMarketplaceListings(params?: {
  category?: string;
  listing_type?: string;
  q?: string;
}): Promise<MarketplaceListingItem[]> {
  try {
    const response = await apiClient.get('/marketplace', { params });
    const unwrapped = unwrapData<unknown>(response.data);
    const list = Array.isArray(unwrapped)
      ? unwrapped
      : Array.isArray((unwrapped as Record<string, unknown>)?.listings)
        ? ((unwrapped as Record<string, unknown>).listings as unknown[])
        : [];

    return list.map(mapListing);
  } catch {
    return [];
  }
}

export async function getMarketplaceListing(id: string): Promise<MarketplaceListingItem | null> {
  try {
    const response = await apiClient.get(`/marketplace/${id}`);
    const unwrapped = unwrapData<unknown>(response.data);
    return mapListing(unwrapped, 0);
  } catch {
    return null;
  }
}

export async function purchaseMarketplaceListing(
  listingId: string,
  payload: PurchasePayload,
): Promise<{
  success: boolean;
  message: string;
  code?: string;
  authorization_url?: string;
}> {
  const response = await apiClient.post(`/marketplace/${listingId}/purchase`, payload);
  const data = unwrapData<Record<string, unknown>>(response.data);
  return {
    success: true,
    message: asString(data?.message, 'Purchase completed successfully!'),
    code: asString(data?.code ?? data?.access_code, `HG-${Math.floor(1000 + Math.random() * 9000)}`),
    authorization_url: asString(data?.authorization_url, ''),
  };
}

export async function submitVendorListingRequest(
  payload: VendorListingRequest,
): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.post('/marketplace/requests', payload);
  const data = unwrapData<Record<string, unknown>>(response.data);
  return {
    success: true,
    message: asString(data?.message, 'Listing request submitted for admin review!'),
  };
}

export async function getMyMarketplacePurchases(): Promise<MarketplacePurchaseRecord[]> {
  try {
    const response = await apiClient.get('/marketplace/purchases');
    const unwrapped = unwrapData<unknown>(response.data);
    const list = Array.isArray(unwrapped)
      ? unwrapped
      : Array.isArray((unwrapped as Record<string, unknown>)?.purchases)
        ? ((unwrapped as Record<string, unknown>).purchases as unknown[])
        : [];

    return list.map((item, idx) => {
      const src = (item ?? {}) as Record<string, unknown>;
      return {
        id: asString(src.id, `purchase-${idx}`),
        listing_id: asString(src.listing_id, ''),
        title: asString(src.title ?? src.service_title, 'Marketplace Item'),
        code: asString(src.code ?? src.access_code, `HG-${idx + 1000}`),
        quantity: asNumber(src.quantity, 1),
        pay_with_hp: Boolean(src.pay_with_hp),
        status: asString(src.status, 'completed'),
        created_at: asString(src.created_at, new Date().toISOString()),
      };
    });
  } catch {
    return [];
  }
}
