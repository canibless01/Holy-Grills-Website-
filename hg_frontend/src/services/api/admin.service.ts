import apiClient from '@/lib/api/client';
import { MOCK_PAYMENTS, MOCK_USERS } from '@/data/mockOrders';
import type { MenuItem, Order, Payment } from '@/types';
import { getMenuItems } from '@/services/api/menu.service';
import { getOrders } from '@/services/api/order.service';

export interface AdminUserSummary {
  id: string;
  name: string;
  email: string;
  role?: string;
  is_active?: boolean;
  totalHP: number;
  ordersCount: number;
  totalSpent: number;
}

export interface AdminUserDetail extends AdminUserSummary {
  profile?: Record<string, unknown>;
  wallet_balance?: number;
  orders?: Order[];
  hp_ledger?: Array<{ id: string; amount: number; description: string; created_at: string }>;
}

export interface AdminEconomicsOverview {
  food_revenue: number;
  hp_issued: number;
  pending_hp: number;
  active_hp: number;
  hp_redeemed: number;
  hp_outstanding: number;
  theoretical_liability: number;
  actual_redemption_cost: number;
  actual_programme_cost_pct: number;
  target_programme_cost_pct: number;
  variance_from_target: number;
  programme_efficiency: number;
}

export interface AdminEconomicsTier {
  tier: string;
  revenue: number;
  hp_issued: number;
  hp_redeemed: number;
  actual_cost: number;
  effective_pct: number;
}

export interface AdminEconomicsRedemption {
  cost_by_type: Record<string, number>;
  total_actual_cost: number;
  actual_cost_per_redeemed_hp: number;
}

export interface FeatureFlag {
  feature_name: string;
  is_active: boolean;
  description?: string;
}

function unwrapData<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && payload !== null && 'data' in payload) {
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

export async function getAdminUsers(params?: { campus_id?: string; limit?: number; offset?: number; q?: string; role?: string }): Promise<AdminUserSummary[]> {
  try {
    const response = await apiClient.get('/admin/users', { params });
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
        role: asString(source.role ?? profile.role, 'student'),
        is_active: Boolean(source.is_active ?? profile.is_active ?? true),
        totalHP: asNumber(source.hp_balance ?? source.totalHP ?? profile.hp_balance),
        ordersCount: asNumber(source.orders_count ?? source.ordersCount),
        totalSpent: asNumber(source.total_spent ?? source.totalSpent),
      };
    });
  } catch {
    return MOCK_USERS;
  }
}

export async function getAdminUserDetail(userId: string): Promise<AdminUserDetail | null> {
  try {
    const response = await apiClient.get(`/admin/users/${userId}`);
    return unwrapData<AdminUserDetail>(response.data);
  } catch {
    return null;
  }
}

export async function activateUser(userId: string): Promise<void> {
  await apiClient.post(`/admin/users/${userId}/activate`);
}

export async function deactivateUser(userId: string): Promise<void> {
  await apiClient.post(`/admin/users/${userId}/deactivate`);
}

export async function changeUserRole(userId: string, role: string): Promise<void> {
  await apiClient.patch(`/admin/users/${userId}/role`, { role });
}

export async function getUserHpHistory(userId: string): Promise<Record<string, unknown>> {
  try {
    const response = await apiClient.get(`/admin/users/${userId}/hp`);
    return unwrapData<Record<string, unknown>>(response.data);
  } catch {
    return { hp_balance: 0, pending_hp_balance: 0, tier: 'regular', tier_multiplier: 1.0 };
  }
}

export async function getUserOrderHistory(userId: string): Promise<Order[]> {
  try {
    const response = await apiClient.get(`/admin/users/${userId}/orders`);
    const payload = unwrapData<unknown>(response.data);
    const list = Array.isArray(payload)
      ? payload
      : Array.isArray((payload as Record<string, unknown>)?.orders)
        ? ((payload as Record<string, unknown>).orders as unknown[])
        : [];
    return list as Order[];
  } catch {
    return [];
  }
}

export async function getUserWalletHistory(userId: string): Promise<Record<string, unknown>> {
  try {
    const response = await apiClient.get(`/admin/users/${userId}/wallet`);
    return unwrapData<Record<string, unknown>>(response.data);
  } catch {
    return { wallet_balance: 0, currency: 'NGN', user_id: userId };
  }
}

export async function getAdminAuditLogs(params?: { limit?: number; offset?: number }): Promise<Array<Record<string, unknown>>> {
  try {
    const response = await apiClient.get('/admin/audit-log', { params });
    const payload = unwrapData<unknown>(response.data);
    return Array.isArray(payload) ? payload : [];
  } catch {
    return [];
  }
}

export async function getEconomicsOverview(params?: { campus_id?: string; from_date?: string; to_date?: string }): Promise<AdminEconomicsOverview> {
  try {
    const response = await apiClient.get('/admin/economics/overview', { params });
    return unwrapData<AdminEconomicsOverview>(response.data);
  } catch {
    return {
      food_revenue: 150000.0,
      hp_issued: 12000,
      pending_hp: 3000,
      active_hp: 9000,
      hp_redeemed: 4000,
      hp_outstanding: 12000,
      theoretical_liability: 2220.0,
      actual_redemption_cost: 750.0,
      actual_programme_cost_pct: 0.005,
      target_programme_cost_pct: 0.025,
      variance_from_target: -0.02,
      programme_efficiency: 0.3378,
    };
  }
}

export async function getEconomicsTierBreakdown(params?: { campus_id?: string }): Promise<AdminEconomicsTier[]> {
  try {
    const response = await apiClient.get('/admin/economics/tier-breakdown', { params });
    const payload = unwrapData<unknown>(response.data);
    return Array.isArray(payload) ? payload : [];
  } catch {
    return [
      { tier: 'Ember', revenue: 50000.0, hp_issued: 3000, hp_redeemed: 1000, actual_cost: 200.0, effective_pct: 0.004 },
      { tier: 'Flame', revenue: 45000.0, hp_issued: 4000, hp_redeemed: 1200, actual_cost: 250.0, effective_pct: 0.005 },
      { tier: 'Blaze', revenue: 35000.0, hp_issued: 3000, hp_redeemed: 1000, actual_cost: 180.0, effective_pct: 0.005 },
      { tier: 'Holy', revenue: 20000.0, hp_issued: 2000, hp_redeemed: 800, actual_cost: 120.0, effective_pct: 0.006 },
    ];
  }
}

export async function getEconomicsRedemptionAnalytics(params?: { campus_id?: string }): Promise<AdminEconomicsRedemption> {
  try {
    const response = await apiClient.get('/admin/economics/redemption-analytics', { params });
    return unwrapData<AdminEconomicsRedemption>(response.data);
  } catch {
    return {
      cost_by_type: { food: 500.0, merch: 250.0 },
      total_actual_cost: 750.0,
      actual_cost_per_redeemed_hp: 0.1875,
    };
  }
}

export async function getFeatureFlags(campus_id?: string): Promise<FeatureFlag[]> {
  try {
    const response = await apiClient.get('/admin/feature-flags', { params: campus_id ? { campus_id } : {} });
    const payload = unwrapData<unknown>(response.data);
    return Array.isArray(payload) ? payload : [];
  } catch {
    return [
      { feature_name: 'squad_order_enabled', is_active: true, description: 'Allow group squad orders' },
      { feature_name: 'whatsapp_support_enabled', is_active: true, description: 'Enable WhatsApp support button' },
      { feature_name: 'marketplace_enabled', is_active: true, description: 'Enable peer-to-peer marketplace' },
    ];
  }
}

export async function updateFeatureFlag(flag_name: string, payload: { is_active: boolean; description?: string; campus_id?: string }): Promise<FeatureFlag> {
  const response = await apiClient.patch(`/admin/feature-flags/${flag_name}`, payload);
  return unwrapData<FeatureFlag>(response.data);
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

export interface SpinPoolPrize {
  id: string;
  name: string;
  weight: number;
  is_active: boolean;
  campus_id: string | null;
  created_at?: string;
}

export async function getExclusiveSpinPool(): Promise<SpinPoolPrize[]> {
  const response = await apiClient.get('/admin/exclusive-spin-pool');
  const payload = unwrapData<Record<string, unknown>>(response.data);
  return (payload.prizes as SpinPoolPrize[]) ?? [];
}

export async function addExclusiveSpinPrize(prize: { name: string; weight: number; is_active?: boolean }): Promise<SpinPoolPrize> {
  const response = await apiClient.post('/admin/exclusive-spin-pool', prize);
  return unwrapData<SpinPoolPrize>(response.data);
}

export async function updateExclusiveSpinPrize(prizeId: string, updates: Partial<{ name: string; weight: number; is_active: boolean }>): Promise<SpinPoolPrize> {
  const response = await apiClient.patch(`/admin/exclusive-spin-pool/${prizeId}`, updates);
  return unwrapData<SpinPoolPrize>(response.data);
}

export async function deleteExclusiveSpinPrize(prizeId: string): Promise<void> {
  await apiClient.delete(`/admin/exclusive-spin-pool/${prizeId}`);
}
