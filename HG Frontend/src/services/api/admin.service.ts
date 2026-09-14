import apiClient from '@/lib/api/client';
import { MOCK_PAYMENTS, MOCK_USERS } from '@/data/mockOrders';
import type { MenuItem, Order, Payment } from '@/types';
import { getMenuItems } from '@/services/api/menu.service';
import { getOrders } from '@/services/api/order.service';

export interface AdminUserSummary {
  id: string;
  name: string;
  email: string;
  totalHP: number;
  ordersCount: number;
  totalSpent: number;
}

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

export async function getAdminUsers(): Promise<AdminUserSummary[]> {
  try {
    const response = await apiClient.get('/admin/users');
    const payload = unwrapData<unknown>(response.data);
    const users = Array.isArray(payload)
      ? payload
      : Array.isArray((payload as Record<string, unknown>)?.users)
        ? ((payload as Record<string, unknown>).users as unknown[])
        : [];

    if (!users.length) return MOCK_USERS;

    return users.map((entry, index) => {
      const source = (entry ?? {}) as Record<string, unknown>;
      const profile = (source.profile ?? {}) as Record<string, unknown>;

      return {
        id: asString(source.id, `user-${index}`),
        name: asString(source.full_name ?? source.name ?? profile.full_name, 'User'),
        email: asString(source.email ?? profile.email),
        totalHP: asNumber(source.hp_balance ?? source.totalHP ?? profile.hp_balance),
        ordersCount: asNumber(source.orders_count ?? source.ordersCount),
        totalSpent: asNumber(source.total_spent ?? source.totalSpent),
      };
    });
  } catch {
    return MOCK_USERS;
  }
}

export async function getAdminPayments(): Promise<Payment[]> {
  try {
    const response = await apiClient.get('/payments');
    const payload = unwrapData<unknown>(response.data);
    const payments = Array.isArray(payload)
      ? payload
      : Array.isArray((payload as Record<string, unknown>)?.payments)
        ? ((payload as Record<string, unknown>).payments as unknown[])
        : [];

    if (!payments.length) return MOCK_PAYMENTS;

    return payments.map((entry, index) => {
      const source = (entry ?? {}) as Record<string, unknown>;
      const statusValue = asString(source.status, 'pending');
      const channelValue = asString(source.channel, 'card');

      return {
        id: asString(source.id, `payment-${index}`),
        orderId: asString(source.orderId ?? source.order_id),
        paystackRef: asString(source.paystackRef ?? source.reference ?? source.payment_reference),
        amount: asNumber(source.amount ?? source.total),
        status:
          statusValue === 'success' ||
          statusValue === 'pending' ||
          statusValue === 'failed' ||
          statusValue === 'refunded'
            ? statusValue
            : 'pending',
        channel:
          channelValue === 'card' ||
          channelValue === 'bank_transfer' ||
          channelValue === 'ussd' ||
          channelValue === 'wallet'
            ? channelValue
            : 'card',
        customerEmail: asString(source.customerEmail ?? source.customer_email ?? source.email),
        customerPhone: asString(source.customerPhone ?? source.customer_phone ?? source.phone),
        paidAt: asString(source.paidAt ?? source.paid_at ?? source.created_at, new Date().toISOString()),
        refundedAt: asOptionalString(source.refundedAt ?? source.refunded_at),
      };
    });
  } catch {
    return MOCK_PAYMENTS;
  }
}

export interface AdminAnalyticsSnapshot {
  orders: Order[];
  menuItems: MenuItem[];
  users: AdminUserSummary[];
}

export async function getAdminAnalyticsSnapshot(): Promise<AdminAnalyticsSnapshot> {
  const [orders, menuItems, users] = await Promise.all([
    getOrders(),
    getMenuItems(),
    getAdminUsers(),
  ]);

  return {
    orders,
    menuItems,
    users,
  };
}
