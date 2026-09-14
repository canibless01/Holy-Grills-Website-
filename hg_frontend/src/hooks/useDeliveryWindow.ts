'use client';

import { useQuery } from '@tanstack/react-query';
import { getDeliveryStatus } from '@/services/api/delivery.service';
import { getDeliveryWindowInfo } from '@/utils/deliveryWindow';
import { OPERATING_HOURS } from '@/services/mocks/platform';

export function useDeliveryWindow() {
  const { data } = useQuery({
    queryKey: ['delivery-window'],
    queryFn: getDeliveryStatus,
    refetchInterval: 30_000,
    initialData: getDeliveryWindowInfo(new Date(), OPERATING_HOURS),
  });

  return data;
}
