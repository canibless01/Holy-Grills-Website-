import apiClient from '@/lib/api/client';
import type { DeliveryWindowInfo } from '@/types';
import { OPERATING_HOURS } from '@/services/mocks/platform';
import { getDeliveryWindowInfo } from '@/utils/deliveryWindow';

const FALLBACK = () => getDeliveryWindowInfo(new Date(), OPERATING_HOURS);

function unwrapData<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data;
  }

  return payload as T;
}

export async function getDeliveryStatus(): Promise<DeliveryWindowInfo> {
  try {
    const response = await apiClient.get('/delivery-window');
    const payload = unwrapData<Partial<DeliveryWindowInfo>>(response.data);

    if (!payload?.status || !payload?.message) {
      return FALLBACK();
    }

    return {
      status: payload.status,
      message: payload.message,
      detail: payload.detail ?? '',
      nextChangeLabel: payload.nextChangeLabel ?? '',
      countdownSeconds: Number(payload.countdownSeconds ?? 0),
    };
  } catch {
    return FALLBACK();
  }
}
