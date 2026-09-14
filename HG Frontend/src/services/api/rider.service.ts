import apiClient from '@/lib/api/client';
import type { Order, OrderStatus } from '@/types';
import { MOCK_ORDERS } from '@/data/mockOrders';

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

export interface RiderAvailability {
  is_available: boolean;
  location_lat?: number;
  location_lng?: number;
  updated_at?: string;
}

export interface RiderBatchOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  delivery_location: string;
  gate_name?: string;
  hostel_name?: string;
  room_number?: string;
  landmark?: string;
  payment_method: 'paystack' | 'cash' | 'wallet';
  payment_status: 'paid' | 'pending';
  total_amount: number;
  status: OrderStatus;
  items: Array<{ id: string; name: string; quantity: number; price: number }>;
  sequence?: number;
  notes?: string;
}

export interface RiderBatch {
  id: string;
  zone?: string;
  status: 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  gate_id?: string;
  gate_name?: string;
  orders: RiderBatchOrder[];
}

export interface RiderStats {
  total_deliveries: number;
  rating: number;
  on_time_rate_percent: number;
  active_hours_today: number;
}

export interface RiderEarnings {
  period: string;
  total_earnings: number;
  base_pay: number;
  tips: number;
  deliveries_count: number;
}

function mapOrderToRiderBatchOrder(raw: unknown, index: number): RiderBatchOrder {
  const source = (raw ?? {}) as Record<string, unknown>;
  const addressSource =
    source.address && typeof source.address === 'object'
      ? (source.address as Record<string, unknown>)
      : {};

  const itemsRaw = Array.isArray(source.items) ? source.items : [];
  const items = itemsRaw.map((it, idx) => {
    const itemObj = (it ?? {}) as Record<string, unknown>;
    return {
      id: asString(itemObj.id ?? itemObj.menu_item_id, `item-${idx}`),
      name: asString(itemObj.name ?? itemObj.title, 'Item'),
      quantity: Math.max(asNumber(itemObj.quantity, 1), 1),
      price: asNumber(itemObj.price ?? itemObj.unit_price, 0),
    };
  });

  const payMethod = asString(source.payment_method ?? source.channel, 'paystack');
  const normalizedPayMethod = payMethod === 'cash' ? 'cash' : payMethod === 'wallet' ? 'wallet' : 'paystack';

  const payStatus = asString(source.payment_status, 'paid');
  const normalizedPayStatus = payStatus === 'pending' || payStatus === 'unpaid' ? 'pending' : 'paid';

  return {
    id: asString(source.id ?? source.order_id, `order-${index}`),
    order_number: asString(source.order_number ?? source.id, `HG-${index + 1000}`),
    customer_name: asString(source.customer_name ?? source.userName ?? source.user_name, 'Customer'),
    customer_phone: asString(
      source.customer_phone ?? addressSource.phone ?? source.phone,
      '08012345678',
    ),
    delivery_location: asString(
      source.delivery_location ??
        addressSource.streetAddress ??
        source.street_address ??
        source.location,
      'Campus Hostel A, Room 102',
    ),
    gate_name: asString(source.gate_name ?? addressSource.gate, 'South Gate'),
    hostel_name: asString(source.hostel_name ?? addressSource.hostel, 'Hall 1'),
    room_number: asString(source.room_number ?? addressSource.room, 'Room 102'),
    landmark: asString(source.landmark ?? addressSource.landmark, ''),
    payment_method: normalizedPayMethod,
    payment_status: normalizedPayStatus,
    total_amount: asNumber(source.total_amount ?? source.total, 3200),
    status: (asString(source.status, 'confirmed') as OrderStatus),
    items,
    sequence: asNumber(source.sequence, index + 1),
    notes: asString(source.notes ?? source.cancelReason, ''),
  };
}

export async function toggleRiderAvailability(
  isAvailable: boolean,
  locationLat?: number,
  locationLng?: number,
): Promise<RiderAvailability> {
  const response = await apiClient.patch('/riders/availability', {
    is_available: isAvailable,
    location_lat: locationLat,
    location_lng: locationLng,
  });
  const data = unwrapData<Record<string, unknown>>(response.data);
  return {
    is_available: Boolean(data.is_available ?? isAvailable),
    location_lat: (data.location_lat as number) ?? locationLat,
    location_lng: (data.location_lng as number) ?? locationLng,
    updated_at: asString(data.updated_at, new Date().toISOString()),
  };
}

export async function getMyBatch(campusId?: string, sequencing?: string): Promise<RiderBatch | null> {
  try {
    const response = await apiClient.get('/riders/my-batch', {
      params: { campus_id: campusId, sequencing },
    });
    const unwrapped = unwrapData<Record<string, unknown>>(response.data);
    if (!unwrapped || typeof unwrapped !== 'object') return null;

    const ordersRaw = Array.isArray(unwrapped.orders)
      ? unwrapped.orders
      : Array.isArray(unwrapped.batch_orders)
        ? unwrapped.batch_orders
        : [];

    const mappedOrders = ordersRaw.map((o, idx) => mapOrderToRiderBatchOrder(o, idx));

    return {
      id: asString(unwrapped.id ?? unwrapped.batch_id, 'batch-1'),
      zone: asString(unwrapped.zone, 'Main Zone'),
      status: (asString(unwrapped.status, 'assigned') as RiderBatch['status']),
      gate_id: unwrapped.gate_id as string | undefined,
      gate_name: asString(unwrapped.gate_name, 'Main Gate'),
      orders: mappedOrders,
    };
  } catch {
    // Return mock batch with orders if request fails
    const mockOrders = MOCK_ORDERS.slice(0, 3).map((o, idx) => ({
      id: o.id,
      order_number: `HG-${o.id.slice(0, 6).toUpperCase()}`,
      customer_name: 'Blessing Okon',
      customer_phone: o.address.phone || '08034567890',
      delivery_location: `${o.address.streetAddress}${o.address.landmark ? ` (${o.address.landmark})` : ''}`,
      gate_name: 'South Gate',
      hostel_name: 'Moremi Hall',
      room_number: 'B204',
      payment_method: idx === 1 ? ('cash' as const) : ('paystack' as const),
      payment_status: idx === 1 ? ('pending' as const) : ('paid' as const),
      total_amount: o.total,
      status: o.status,
      items: o.items.map((i) => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.price })),
      sequence: idx + 1,
    }));

    return {
      id: 'batch-demo-1',
      zone: 'Hostel Zone A',
      status: 'assigned',
      gate_name: 'South Gate',
      orders: mockOrders,
    };
  }
}

export async function markOrderPickedUp(orderId: string): Promise<Order> {
  const response = await apiClient.post(`/riders/orders/${orderId}/pickup`);
  return unwrapData<Order>(response.data);
}

export async function markOrderDelivered(orderId: string): Promise<Order> {
  const response = await apiClient.post(`/riders/orders/${orderId}/deliver`);
  return unwrapData<Order>(response.data);
}

export async function markOrderAttempted(orderId: string, notes?: string): Promise<Order> {
  const response = await apiClient.post(`/riders/orders/${orderId}/attempt`, { notes });
  return unwrapData<Order>(response.data);
}

export async function getCallLink(orderId: string): Promise<{ phone: string; call_url: string }> {
  try {
    const response = await apiClient.get(`/riders/call/${orderId}`);
    const data = unwrapData<Record<string, unknown>>(response.data);
    const phone = asString(data.phone ?? data.customer_phone, '08000000000');
    return {
      phone,
      call_url: asString(data.call_url, `tel:${phone}`),
    };
  } catch {
    return { phone: '08000000000', call_url: 'tel:08000000000' };
  }
}

export async function getRiderStats(): Promise<RiderStats> {
  try {
    const response = await apiClient.get('/riders/stats');
    const data = unwrapData<Record<string, unknown>>(response.data);
    return {
      total_deliveries: asNumber(data.total_deliveries, 124),
      rating: asNumber(data.rating, 4.9),
      on_time_rate_percent: asNumber(data.on_time_rate_percent ?? data.on_time_rate, 96.5),
      active_hours_today: asNumber(data.active_hours_today, 5.2),
    };
  } catch {
    return {
      total_deliveries: 124,
      rating: 4.9,
      on_time_rate_percent: 96.5,
      active_hours_today: 5.2,
    };
  }
}

export async function getRiderEarnings(period = 'today'): Promise<RiderEarnings> {
  try {
    const response = await apiClient.get('/riders/earnings', { params: { period } });
    const data = unwrapData<Record<string, unknown>>(response.data);
    return {
      period,
      total_earnings: asNumber(data.total_earnings ?? data.earnings, 8500),
      base_pay: asNumber(data.base_pay, 6500),
      tips: asNumber(data.tips, 2000),
      deliveries_count: asNumber(data.deliveries_count, 12),
    };
  } catch {
    return {
      period,
      total_earnings: 8500,
      base_pay: 6500,
      tips: 2000,
      deliveries_count: 12,
    };
  }
}

export async function getRiderHistory(limit = 20, offset = 0): Promise<RiderBatchOrder[]> {
  try {
    const response = await apiClient.get('/riders/history', { params: { limit, offset } });
    const unwrapped = unwrapData<unknown>(response.data);
    const list = Array.isArray(unwrapped)
      ? unwrapped
      : Array.isArray((unwrapped as Record<string, unknown>)?.history)
        ? ((unwrapped as Record<string, unknown>).history as unknown[])
        : Array.isArray((unwrapped as Record<string, unknown>)?.orders)
          ? ((unwrapped as Record<string, unknown>).orders as unknown[])
          : [];

    return list.map((o, idx) => mapOrderToRiderBatchOrder(o, idx));
  } catch {
    return MOCK_ORDERS.slice(0, 5).map((o, idx) => mapOrderToRiderBatchOrder(o, idx));
  }
}
