import apiClient from '@/lib/api/client';
import { EVENT_DISCOVERY_ITEMS } from '@/services/mocks/platform';

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

export interface CampusEventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  capacity: string;
  imageUrl?: string;
  hpReward?: number;
  ticketPrice?: number;
  featured?: boolean;
}

export interface EventTicketTier {
  id: string;
  event_id: string;
  name: string;
  price_naira: number;
  price_hp: number;
  capacity?: number;
  sold_count?: number;
  description?: string;
  is_active: boolean;
}

export interface EventRegisterPayload {
  name: string;
  email: string;
  phone: string;
  payment_method: string;
  tier_id?: string;
  use_hp?: boolean;
  wallet_amount?: number | string;
  guest_email?: string;
  guest_name?: string;
  guest_phone?: string;
}

export interface EventCheckinPayload {
  email: string;
  qr_token?: string;
  ticket_id?: string;
}

export interface CateringRequestPayload {
  organizer_name: string;
  email: string;
  phone: string;
  event_name: string;
  event_date: string;
  expected_guests: number;
  budget?: number;
  organization?: string;
  notes?: string;
}

export interface MyEventTicket {
  id: string;
  event_id: string;
  event_title: string;
  event_date: string;
  event_location: string;
  qr_code: string;
  status: string;
  created_at: string;
}

function mapEvent(raw: unknown, index: number): CampusEventItem {
  const src = (raw ?? {}) as Record<string, unknown>;
  return {
    id: asString(src.id, `evt-${index}`),
    title: asString(src.title, 'Campus Event'),
    description: asString(src.description, 'Holy Grills campus event'),
    date: asString(src.date ?? src.starts_at, 'Upcoming'),
    location: asString(src.location, 'Main Campus Hall'),
    capacity: asString(src.capacity ? `${src.capacity} seats` : 'Open access'),
    imageUrl: asString(src.imageUrl ?? src.image_url, '/placeholder.svg'),
    hpReward: asNumber(src.hpReward ?? src.hp_reward, 20),
    ticketPrice: asNumber(src.ticketPrice ?? src.ticket_price, 0),
    featured: Boolean(src.featured ?? src.is_featured ?? false),
  };
}

export async function getEvents(): Promise<CampusEventItem[]> {
  try {
    const response = await apiClient.get('/events');
    const unwrapped = unwrapData<unknown>(response.data);
    const list = Array.isArray(unwrapped)
      ? unwrapped
      : Array.isArray((unwrapped as Record<string, unknown>)?.events)
        ? ((unwrapped as Record<string, unknown>).events as unknown[])
        : [];

    if (!list.length) return EVENT_DISCOVERY_ITEMS.map((e, i) => mapEvent(e, i));
    return list.map(mapEvent);
  } catch {
    return EVENT_DISCOVERY_ITEMS.map((e, i) => mapEvent(e, i));
  }
}

export async function getEvent(id: string): Promise<CampusEventItem | null> {
  try {
    const response = await apiClient.get(`/events/${id}`);
    const unwrapped = unwrapData<unknown>(response.data);
    return mapEvent(unwrapped, 0);
  } catch {
    const mock = EVENT_DISCOVERY_ITEMS.find((entry) => entry.id === id);
    return mock ? mapEvent(mock, 0) : null;
  }
}

export async function getEventTicketTiers(eventId: string): Promise<EventTicketTier[]> {
  try {
    const response = await apiClient.get(`/events/${eventId}/tiers`);
    const unwrapped = unwrapData<unknown>(response.data);
    const list = Array.isArray(unwrapped)
      ? unwrapped
      : Array.isArray((unwrapped as Record<string, unknown>)?.tiers)
        ? ((unwrapped as Record<string, unknown>).tiers as unknown[])
        : [];

    return list.map((item, idx) => {
      const src = (item ?? {}) as Record<string, unknown>;
      return {
        id: asString(src.id, `tier-${idx}`),
        event_id: eventId,
        name: asString(src.name, 'Standard Entry'),
        price_naira: asNumber(src.price_naira ?? src.price, 0),
        price_hp: asNumber(src.price_hp, 0),
        capacity: src.capacity ? asNumber(src.capacity) : undefined,
        is_active: Boolean(src.is_active ?? true),
      };
    });
  } catch {
    return [
      { id: 'tier-vip', event_id: eventId, name: 'VIP Pass', price_naira: 5000, price_hp: 800, is_active: true },
      { id: 'tier-regular', event_id: eventId, name: 'Regular Entry', price_naira: 2000, price_hp: 300, is_active: true },
    ];
  }
}

export async function registerForEvent(
  eventId: string,
  payload: EventRegisterPayload,
): Promise<{ success: boolean; message: string; qr_code?: string }> {
  const response = await apiClient.post(`/events/${eventId}/register`, payload);
  const data = unwrapData<Record<string, unknown>>(response.data);
  return {
    success: true,
    message: asString(data?.message, 'Event registration successful!'),
    qr_code: asString(data?.qr_code, `QR-${Math.random().toString(36).substring(2, 10).toUpperCase()}`),
  };
}

export async function checkinEvent(
  eventId: string,
  payload: EventCheckinPayload,
): Promise<{ success: boolean; message: string; hp_earned?: number }> {
  const response = await apiClient.post(`/events/${eventId}/checkin`, payload);
  const data = unwrapData<Record<string, unknown>>(response.data);
  return {
    success: true,
    message: asString(data?.message, 'Check-in successful!'),
    hp_earned: asNumber(data?.hp_earned, 20),
  };
}

export async function submitCateringRequest(
  payload: CateringRequestPayload,
): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.post('/events/catering-requests', payload);
  const data = unwrapData<Record<string, unknown>>(response.data);
  return {
    success: true,
    message: asString(data?.message, 'Catering request submitted! Our team will contact you shortly.'),
  };
}

export async function getMyEventTickets(): Promise<MyEventTicket[]> {
  try {
    const response = await apiClient.get('/events/my-tickets');
    const unwrapped = unwrapData<unknown>(response.data);
    const list = Array.isArray(unwrapped)
      ? unwrapped
      : Array.isArray((unwrapped as Record<string, unknown>)?.tickets)
        ? ((unwrapped as Record<string, unknown>).tickets as unknown[])
        : [];

    return list.map((item, idx) => {
      const src = (item ?? {}) as Record<string, unknown>;
      return {
        id: asString(src.id, `ticket-${idx}`),
        event_id: asString(src.event_id, ''),
        event_title: asString(src.event_title ?? src.title, 'Event Ticket'),
        event_date: asString(src.event_date ?? src.starts_at, 'Upcoming'),
        event_location: asString(src.event_location ?? src.location, 'Campus Venue'),
        qr_code: asString(src.qr_code, `QR-TICKET-${idx}`),
        status: asString(src.status, 'valid'),
        created_at: asString(src.created_at, new Date().toISOString()),
      };
    });
  } catch {
    return [];
  }
}
