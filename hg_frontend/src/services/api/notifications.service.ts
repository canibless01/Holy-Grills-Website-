import apiClient from '@/lib/api/client';

export interface NotificationItem {
  id: string;
  user_id?: string;
  title: string;
  body: string;
  channel?: string;
  action_url?: string;
  metadata?: Record<string, unknown>;
  read_at?: string | null;
  read?: boolean;
  created_at: string;
  type?: string;
}

export interface NotificationPreferences {
  push_enabled: boolean;
  email_enabled: boolean;
  order_updates: boolean;
  promotions: boolean;
  hp_updates: boolean;
  delivery_updates: boolean;
}

export interface NotificationBlast {
  id: string;
  title?: string;
  body?: string;
  channels?: string[];
  segment?: Record<string, unknown> | string;
  action_url?: string;
  scheduled_at?: string | null;
  status?: string;
  email_provider?: 'resend' | 'onesignal' | null;
  created_at?: string;
}

function unwrapData<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && payload !== null && 'data' in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

export async function getNotifications(params?: { unread_only?: boolean; limit?: number }): Promise<NotificationItem[]> {
  try {
    const response = await apiClient.get('/notifications', { params });
    const unwrapped = unwrapData<unknown>(response.data);
    const list = Array.isArray(unwrapped)
      ? unwrapped
      : Array.isArray((unwrapped as Record<string, unknown>)?.notifications)
      ? ((unwrapped as Record<string, unknown>).notifications as unknown[])
      : [];

    return list.map((entry) => {
      const item = (entry ?? {}) as Record<string, unknown>;
      return {
        id: String(item.id || crypto.randomUUID()),
        title: String(item.title || 'Notification'),
        body: String(item.body || item.message || ''),
        channel: String(item.channel || 'in_app'),
        action_url: item.action_url ? String(item.action_url) : item.actionUrl ? String(item.actionUrl) : undefined,
        read_at: item.read_at ? String(item.read_at) : item.readAt ? String(item.readAt) : null,
        read: Boolean(item.read_at || item.read),
        created_at: String(item.created_at || item.createdAt || new Date().toISOString()),
        type: String(item.type || 'system'),
      };
    });
  } catch {
    return [];
  }
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await apiClient.post(`/notifications/${notificationId}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiClient.post('/notifications/read-all');
}

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  try {
    const response = await apiClient.get('/notifications/preferences');
    const data = unwrapData<Record<string, unknown>>(response.data);
    return {
      push_enabled: Boolean(data.push_enabled ?? true),
      email_enabled: Boolean(data.email_enabled ?? true),
      order_updates: Boolean(data.order_updates ?? true),
      promotions: Boolean(data.promotions ?? true),
      hp_updates: Boolean(data.hp_updates ?? true),
      delivery_updates: Boolean(data.delivery_updates ?? true),
    };
  } catch {
    return {
      push_enabled: true,
      email_enabled: true,
      order_updates: true,
      promotions: true,
      hp_updates: true,
      delivery_updates: true,
    };
  }
}

export async function updateNotificationPreferences(prefs: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
  const response = await apiClient.patch('/notifications/preferences', prefs);
  const data = unwrapData<Record<string, unknown>>(response.data);
  return {
    push_enabled: Boolean(data.push_enabled ?? prefs.push_enabled ?? true),
    email_enabled: Boolean(data.email_enabled ?? prefs.email_enabled ?? true),
    order_updates: Boolean(data.order_updates ?? prefs.order_updates ?? true),
    promotions: Boolean(data.promotions ?? prefs.promotions ?? true),
    hp_updates: Boolean(data.hp_updates ?? prefs.hp_updates ?? true),
    delivery_updates: Boolean(data.delivery_updates ?? prefs.delivery_updates ?? true),
  };
}

export async function subscribePush(payload: { device_label?: string; subscription?: unknown }): Promise<void> {
  await apiClient.post('/push/subscribe', payload);
}

export async function unsubscribePush(payload?: { endpoint?: string }): Promise<void> {
  await apiClient.delete('/push/subscribe', { data: payload });
}

export async function getBlasts(params?: { campus_id?: string; limit?: number; offset?: number; status?: string }): Promise<NotificationBlast[]> {
  try {
    const response = await apiClient.get('/notifications/blasts', { params });
    const unwrapped = unwrapData<unknown>(response.data);
    return Array.isArray(unwrapped) ? unwrapped : [];
  } catch {
    return [];
  }
}

export async function createBlast(payload: {
  campus_id?: string | null;
  created_by?: string | null;
  scheduled_at?: string | null;
  segment?: unknown;
  status?: string | null;
  email_provider?: 'resend' | 'onesignal' | null;
  title?: string;
  body?: string;
}): Promise<NotificationBlast> {
  const response = await apiClient.post('/notifications/blasts', payload);
  return unwrapData<NotificationBlast>(response.data);
}

export async function getBlast(blastId: string): Promise<NotificationBlast | null> {
  try {
    const response = await apiClient.get(`/notifications/blasts/${blastId}`);
    return unwrapData<NotificationBlast>(response.data);
  } catch {
    return null;
  }
}
