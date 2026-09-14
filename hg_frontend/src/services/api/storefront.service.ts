import apiClient from '@/lib/api/client';

export interface StorefrontBanner {
  id: string;
  title: string;
  subtitle?: string | null;
  image_url?: string | null;
  mobile_image_url?: string | null;
  images?: string[];
  action_url?: string | null;
  action_label?: string | null;
  placement?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface OperatingHours {
  day?: string;
  open_time?: string;
  close_time?: string;
  is_closed?: boolean;
  overrides?: Array<{ date: string; is_closed?: boolean; open_time?: string; close_time?: string }>;
}

function unwrapData<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && payload !== null && 'data' in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

export async function getBanners(placement?: string): Promise<StorefrontBanner[]> {
  try {
    const response = await apiClient.get('/storefront/banners', { params: placement ? { placement } : {} });
    const unwrapped = unwrapData<unknown>(response.data);
    return Array.isArray(unwrapped) ? unwrapped : [];
  } catch {
    return [];
  }
}

export async function createBanner(payload: Record<string, unknown>): Promise<StorefrontBanner> {
  const response = await apiClient.post('/storefront/banners', payload);
  return unwrapData<StorefrontBanner>(response.data);
}

export async function updateBanner(bannerId: string, payload: Record<string, unknown>): Promise<StorefrontBanner> {
  const response = await apiClient.patch(`/storefront/banners/${bannerId}`, payload);
  return unwrapData<StorefrontBanner>(response.data);
}

export async function deleteBanner(bannerId: string): Promise<void> {
  await apiClient.delete(`/storefront/banners/${bannerId}`);
}

export async function updateBannerImage(bannerId: string, payload: { image_url?: string; mobile_image_url?: string }): Promise<StorefrontBanner> {
  const response = await apiClient.post(`/storefront/banners/${bannerId}/image`, payload);
  return unwrapData<StorefrontBanner>(response.data);
}

export async function subscribeNewsletter(email: string, fullName?: string, source?: string): Promise<void> {
  await apiClient.post('/storefront/newsletter', { email, full_name: fullName, source });
}

export async function unsubscribeNewsletter(email: string): Promise<void> {
  await apiClient.post('/storefront/newsletter/unsubscribe', { email });
}

export async function getOperatingHours(): Promise<OperatingHours> {
  try {
    const response = await apiClient.get('/storefront/operating-hours');
    return unwrapData<OperatingHours>(response.data);
  } catch {
    return {};
  }
}

export async function getPublicConfig(): Promise<Record<string, unknown>> {
  try {
    const response = await apiClient.get('/storefront/config/public');
    return unwrapData<Record<string, unknown>>(response.data);
  } catch {
    return {};
  }
}
