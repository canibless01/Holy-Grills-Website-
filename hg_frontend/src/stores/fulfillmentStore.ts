import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type DeliveryInfo = {
  zone: string;
  area: string;
  streetAddress: string;
  city: string;
  landmark?: string;
  phone: string;
};

type PickupInfo = {
  name: string;
  phone: string;
  riderName?: string;
  pickupDate: string;
  pickupWindow: string;
  restaurantAddress: string;
  note?: string;
};

type FulfillmentMethod = 'delivery' | 'pickup';

interface FulfillmentState {
  method: FulfillmentMethod;
  deliveryInfo?: DeliveryInfo;
  pickupInfo?: PickupInfo;
  setMethod: (method: FulfillmentMethod) => void;
  saveDelivery: (info: DeliveryInfo) => void;
  savePickup: (info: PickupInfo) => void;
  clear: () => void;
}

export const useFulfillmentStore = create<FulfillmentState>()(
  persist(
    (set) => ({
      method: 'delivery',
      deliveryInfo: undefined,
      pickupInfo: undefined,
      setMethod: (method) => set({ method }),
      saveDelivery: (info) => set({ deliveryInfo: info, method: 'delivery' }),
      savePickup: (info) => set({ pickupInfo: info, method: 'pickup' }),
      clear: () => set({ deliveryInfo: undefined, pickupInfo: undefined, method: 'delivery' }),
    }),
    { name: 'holy-grills-fulfillment' }
  )
);

export const hasDeliveryInfo = (state: FulfillmentState) =>
  Boolean(state.deliveryInfo?.zone && state.deliveryInfo?.area && state.deliveryInfo?.streetAddress && state.deliveryInfo?.city && state.deliveryInfo?.phone);

export const hasPickupInfo = (state: FulfillmentState) =>
  Boolean(
    state.pickupInfo?.name &&
      state.pickupInfo?.phone &&
      state.pickupInfo?.pickupDate &&
      state.pickupInfo?.pickupWindow &&
      state.pickupInfo?.restaurantAddress
  );
