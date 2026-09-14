import apiClient from '@/lib/api/client';
import type { Order, OrderItem, OrderStatus } from '@/types';
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

function asOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function asNumber(value: unknown, fallback = 0): number {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function mapOrderStatus(value: unknown): OrderStatus {
  const status = asString(value, 'placed');
  const allowed: OrderStatus[] = [
    'placed',
    'confirmed',
    'preparing',
    'out_for_delivery',
    'delivered',
    'cancelled',
    'refunded',
  ];

  return allowed.includes(status as OrderStatus) ? (status as OrderStatus) : 'placed';
}

function mapOrderItems(value: unknown): OrderItem[] {
  if (!Array.isArray(value)) return [];

  return value.map((entry, index) => {
    const source = (entry ?? {}) as Record<string, unknown>;

    return {
      id: asString(source.id ?? source.menu_item_id, `item-${index}`),
      name: asString(source.name ?? source.title, 'Menu item'),
      price: asNumber(source.price ?? source.unit_price),
      quantity: Math.max(asNumber(source.quantity, 1), 1),
      imageUrl: asString(source.imageUrl ?? source.image_url ?? source.image, '/placeholder.svg'),
    };
  });
}

function mapOrder(raw: unknown, index: number): Order {
  const source = (raw ?? {}) as Record<string, unknown>;
  const addressSource =
    source.address && typeof source.address === 'object'
      ? (source.address as Record<string, unknown>)
      : {};
  const items = mapOrderItems(source.items ?? source.order_items);
  const subtotal = asNumber(
    source.subtotal,
    items.reduce((total, item) => total + item.price * item.quantity, 0),
  );
  const deliveryFee = asNumber(source.deliveryFee ?? source.delivery_fee, 0);

  return {
    id: asString(source.id ?? source.order_id, `order-${index}`),
    userId: asString(source.userId ?? source.user_id, ''),
    items,
    status: mapOrderStatus(source.status),
    subtotal,
    deliveryFee,
    total: asNumber(source.total, subtotal + deliveryFee),
    address: {
      streetAddress: asString(addressSource.streetAddress ?? source.street_address ?? source.delivery_address, ''),
      city: asString(addressSource.city ?? source.city, ''),
      landmark: asOptionalString(addressSource.landmark ?? source.landmark),
      phone: asString(addressSource.phone ?? source.phone ?? source.customer_phone, ''),
    },
    paystackRef: asString(source.paystackRef ?? source.payment_reference, ''),
    hpEarned: asNumber(source.hpEarned ?? source.hp_earned, 0),
    estimatedDelivery: asString(source.estimatedDelivery ?? source.estimated_delivery, new Date().toISOString()),
    prepDeadline: asOptionalString(source.prepDeadline ?? source.prep_deadline),
    rider:
      source.rider && typeof source.rider === 'object'
        ? {
            name: asString((source.rider as Record<string, unknown>).name),
            phone: asString((source.rider as Record<string, unknown>).phone),
            vehicle: asString((source.rider as Record<string, unknown>).vehicle),
            etaMinutes: asNumber((source.rider as Record<string, unknown>).etaMinutes ?? (source.rider as Record<string, unknown>).eta_minutes, 0),
          }
        : undefined,
    statusHistory: Array.isArray(source.statusHistory)
      ? (source.statusHistory as unknown[]).map((event) => ({
          status: mapOrderStatus((event as Record<string, unknown>)?.status),
          timestamp: asString((event as Record<string, unknown>)?.timestamp, new Date().toISOString()),
        }))
      : [{ status: mapOrderStatus(source.status), timestamp: asString(source.createdAt ?? source.created_at, new Date().toISOString()) }],
    createdAt: asString(source.createdAt ?? source.created_at, new Date().toISOString()),
    cancelReason: asOptionalString(source.cancelReason ?? source.cancel_reason),
    refundedAt: asOptionalString(source.refundedAt ?? source.refunded_at),
  };
}

function toOrderList(payload: unknown): Order[] {
  const unwrapped = unwrapData<unknown>(payload);
  const list = Array.isArray(unwrapped)
    ? unwrapped
    : Array.isArray((unwrapped as Record<string, unknown>)?.orders)
      ? ((unwrapped as Record<string, unknown>).orders as unknown[])
      : [];

  return list.map(mapOrder);
}

export async function getOrders(): Promise<Order[]> {
  try {
    const response = await apiClient.get('/orders');
    const orders = toOrderList(response.data);
    return orders.length ? orders : MOCK_ORDERS;
  } catch {
    return MOCK_ORDERS;
  }
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const response = await apiClient.get(`/orders/${orderId}`);
    const unwrapped = unwrapData<unknown>(response.data);
    return mapOrder(unwrapped, 0);
  } catch {
    return MOCK_ORDERS.find((order) => order.id === orderId) ?? null;
  }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
  const response = await apiClient.patch(`/orders/${orderId}`, { status });
  return mapOrder(unwrapData(response.data), 0);
}

export async function cancelOrder(orderId: string, reason: string): Promise<Order> {
  const response = await apiClient.post(`/orders/${orderId}/cancel`, { reason });
  return mapOrder(unwrapData(response.data), 0);
}

export async function refundOrder(orderId: string): Promise<Order> {
  const response = await apiClient.post(`/orders/${orderId}/refund`);
  return mapOrder(unwrapData(response.data), 0);
}
