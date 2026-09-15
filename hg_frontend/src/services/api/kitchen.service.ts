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

export interface KitchenDeliveryWindow {
  id: string;
  name: string;
  label?: string;
  start_time?: string;
  end_time?: string;
  starts_at?: string;
  ends_at?: string;
  is_active: boolean;
  status?: string;
  capacity?: number;
}

export interface KitchenBatchSummaryItem {
  id: string;
  name: string;
  quantity: number;
}

export interface KitchenBatchSummary {
  batch_id?: string;
  window_id?: string;
  total_orders: number;
  items: KitchenBatchSummaryItem[];
}

export interface KitchenMetrics {
  avg_prep_time_minutes: number;
  throughput_per_window: number;
  completion_rate_percent: number;
  total_completed_today: number;
}

function mapOrder(raw: unknown, index: number): Order {
  const source = (raw ?? {}) as Record<string, unknown>;
  const addressSource =
    source.address && typeof source.address === 'object'
      ? (source.address as Record<string, unknown>)
      : {};
  const itemsRaw = Array.isArray(source.items)
    ? source.items
    : Array.isArray(source.order_items)
      ? source.order_items
      : [];

  const items = itemsRaw.map((entry, idx) => {
    const item = (entry ?? {}) as Record<string, unknown>;
    return {
      id: asString(item.id ?? item.menu_item_id, `item-${idx}`),
      name: asString(item.name ?? item.title, 'Menu item'),
      price: asNumber(item.price ?? item.unit_price),
      quantity: Math.max(asNumber(item.quantity, 1), 1),
      imageUrl: asString(item.imageUrl ?? item.image_url ?? item.image, '/placeholder.svg'),
    };
  });

  const subtotal = asNumber(
    source.subtotal,
    items.reduce((total, item) => total + item.price * item.quantity, 0),
  );
  const deliveryFee = asNumber(source.deliveryFee ?? source.delivery_fee, 0);

  return {
    id: asString(source.id ?? source.order_id, `order-${index}`),
    userId: asString(source.userId ?? source.user_id, ''),
    items,
    status: (asString(source.status, 'placed') as OrderStatus),
    subtotal,
    deliveryFee,
    total: asNumber(source.total ?? source.total_amount, subtotal + deliveryFee),
    address: {
      streetAddress: asString(
        addressSource.streetAddress ??
          source.street_address ??
          source.delivery_address ??
          source.location ??
          'Campus Central',
        'Campus Central',
      ),
      city: asString(addressSource.city ?? source.city, 'Main Campus'),
      landmark: addressSource.landmark as string | undefined,
      phone: asString(addressSource.phone ?? source.phone ?? source.customer_phone, '08000000000'),
    },
    paystackRef: asString(source.paystackRef ?? source.payment_reference, ''),
    hpEarned: asNumber(source.hpEarned ?? source.hp_earned, 0),
    estimatedDelivery: asString(source.estimatedDelivery ?? source.estimated_delivery, new Date().toISOString()),
    createdAt: asString(source.createdAt ?? source.created_at, new Date().toISOString()),
    statusHistory: Array.isArray(source.statusHistory)
      ? (source.statusHistory as Record<string, unknown>[]).map((e) => ({
          status: asString(e.status, 'placed') as OrderStatus,
          timestamp: asString(e.timestamp, new Date().toISOString()),
        }))
      : [{ status: asString(source.status, 'placed') as OrderStatus, timestamp: asString(source.createdAt ?? source.created_at, new Date().toISOString()) }],
  };
}

function toOrderList(payload: unknown): Order[] {
  const unwrapped = unwrapData<unknown>(payload);
  const list = Array.isArray(unwrapped)
    ? unwrapped
    : Array.isArray((unwrapped as Record<string, unknown>)?.orders)
      ? ((unwrapped as Record<string, unknown>).orders as unknown[])
      : Array.isArray((unwrapped as Record<string, unknown>)?.queue)
        ? ((unwrapped as Record<string, unknown>).queue as unknown[])
        : [];

  return list.map(mapOrder);
}

export async function getKitchenQueue(windowId?: string): Promise<Order[]> {
  try {
    const response = await apiClient.get('/kitchen/queue', { params: { window_id: windowId } });
    return toOrderList(response.data);
  } catch {
    return [];
  }
}

export async function getScheduledOrders(windowId?: string): Promise<Order[]> {
  try {
    const response = await apiClient.get('/kitchen/scheduled', { params: { window_id: windowId } });
    return toOrderList(response.data);
  } catch {
    return [];
  }
}

export async function getKitchenWindows(): Promise<KitchenDeliveryWindow[]> {
  try {
    const response = await apiClient.get('/kitchen/windows');
    const unwrapped = unwrapData<unknown>(response.data);
    const list = Array.isArray(unwrapped)
      ? unwrapped
      : Array.isArray((unwrapped as Record<string, unknown>)?.delivery_windows)
        ? ((unwrapped as Record<string, unknown>).delivery_windows as unknown[])
        : Array.isArray((unwrapped as Record<string, unknown>)?.windows)
          ? ((unwrapped as Record<string, unknown>).windows as unknown[])
          : [];

    return list.map((item, index) => {
      const src = (item ?? {}) as Record<string, unknown>;
      return {
        id: asString(src.id, `window-${index}`),
        name: asString(src.name ?? src.label, `Window ${index + 1}`),
        label: asString(src.label ?? src.name, `Window ${index + 1}`),
        start_time: asString(src.start_time ?? src.starts_at, '12:00:00'),
        end_time: asString(src.end_time ?? src.ends_at, '14:00:00'),
        is_active: Boolean(src.is_active ?? true),
        status: asString(src.status, 'open'),
        capacity: asNumber(src.capacity, 50),
      };
    });
  } catch {
    return [
      { id: 'win-1', name: 'Lunch Batch 1', label: 'Lunch Batch 1', start_time: '12:00:00', end_time: '13:30:00', is_active: true, status: 'open', capacity: 30 },
      { id: 'win-2', name: 'Dinner Batch 1', label: 'Dinner Batch 1', start_time: '18:00:00', end_time: '19:30:00', is_active: false, status: 'open', capacity: 30 },
    ];
  }
}

export async function getBatchSummary(windowId: string): Promise<KitchenBatchSummary> {
  try {
    const response = await apiClient.get(`/kitchen/batch-summary/${windowId}`);
    const unwrapped = unwrapData<Record<string, unknown>>(response.data);
    const itemsRaw = Array.isArray(unwrapped.items) ? unwrapped.items : [];
    return {
      batch_id: unwrapped.batch_id as string | undefined,
      window_id: windowId,
      total_orders: asNumber(unwrapped.total_orders, itemsRaw.length),
      items: itemsRaw.map((it, idx) => {
        const itemObj = (it ?? {}) as Record<string, unknown>;
        return {
          id: asString(itemObj.id ?? itemObj.menu_item_id, `summary-item-${idx}`),
          name: asString(itemObj.name ?? itemObj.title, 'Item'),
          quantity: asNumber(itemObj.quantity, 1),
        };
      }),
    };
  } catch {
    return {
      window_id: windowId,
      total_orders: 8,
      items: [
        { id: 'i1', name: 'Holy Grilled Burger', quantity: 12 },
        { id: 'i2', name: 'Jollof Fiesta Box', quantity: 6 },
        { id: 'i3', name: 'Suya Loaded Fries', quantity: 9 },
      ],
    };
  }
}

export async function batchAdvance(
  batchId: string,
  fromStatus?: string,
  notes?: string,
): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.post(`/kitchen/batch/${batchId}/advance`, {
    from_status: fromStatus,
    notes,
  });
  const data = unwrapData<Record<string, unknown>>(response.data);
  return {
    success: true,
    message: asString(data?.message, 'Batch advanced successfully'),
  };
}

export async function getKitchenMetrics(windowId?: string): Promise<KitchenMetrics> {
  try {
    const response = await apiClient.get('/kitchen/metrics', { params: { window_id: windowId } });
    const unwrapped = unwrapData<Record<string, unknown>>(response.data);
    return {
      avg_prep_time_minutes: asNumber(unwrapped.avg_prep_time_minutes ?? unwrapped.avg_prep_time, 14),
      throughput_per_window: asNumber(unwrapped.throughput_per_window ?? unwrapped.throughput, 28),
      completion_rate_percent: asNumber(unwrapped.completion_rate_percent ?? unwrapped.completion_rate, 98.5),
      total_completed_today: asNumber(unwrapped.total_completed_today ?? unwrapped.total_completed, 42),
    };
  } catch {
    return {
      avg_prep_time_minutes: 14,
      throughput_per_window: 28,
      completion_rate_percent: 98.5,
      total_completed_today: 42,
    };
  }
}

export async function getKitchenSettings(): Promise<Record<string, string>> {
  try {
    const response = await apiClient.get('/kitchen/settings');
    const unwrapped = unwrapData<unknown>(response.data);
    if (typeof unwrapped === 'object' && unwrapped !== null && !Array.isArray(unwrapped)) {
      return unwrapped as Record<string, string>;
    }
    return { kitchen_open: 'true', max_delivery_radius_km: '10.0', max_prep_capacity: '50' };
  } catch {
    return { kitchen_open: 'true', max_delivery_radius_km: '10.0', max_prep_capacity: '50' };
  }
}

export async function getKitchenSetting(key: string): Promise<string> {
  try {
    const response = await apiClient.get(`/kitchen/settings/${key}`);
    const unwrapped = unwrapData<Record<string, unknown>>(response.data);
    return asString(unwrapped.value ?? unwrapped[key], '');
  } catch {
    return '';
  }
}

export async function updateKitchenSettings(
  settings: Record<string, string>,
): Promise<Record<string, string>> {
  const response = await apiClient.patch('/kitchen/settings', { settings });
  const unwrapped = unwrapData<unknown>(response.data);
  if (typeof unwrapped === 'object' && unwrapped !== null && !Array.isArray(unwrapped)) {
    return unwrapped as Record<string, string>;
  }
  return settings;
}

export async function updateKitchenOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
  const response = await apiClient.patch(`/orders/${orderId}/status`, { status });
  return mapOrder(unwrapData(response.data), 0);
}
