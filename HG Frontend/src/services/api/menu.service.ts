import apiClient from '@/lib/api/client';
import type { MenuItem, MenuItemExtra, MenuItemReview, MenuItemSize } from '@/types';
import { MOCK_MENU } from '@/data/menu';

function unwrapData<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data;
  }

  return payload as T;
}

function asNumber(value: unknown, fallback = 0): number {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function asOptionalNumber(value: unknown): number | undefined {
  const next = Number(value);
  return Number.isFinite(next) ? next : undefined;
}

function mapSizes(value: unknown): MenuItemSize[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const mapped: MenuItemSize[] = [];
  value.forEach((entry) => {
    if (!entry || typeof entry !== 'object') return;
    const source = entry as Record<string, unknown>;
    const label = asString(source.label ?? source.name);
    if (!label) return;

    mapped.push({
      label,
      price: asNumber(source.price),
      description: asOptionalString(source.description),
    });
  });

  return mapped.length ? mapped : undefined;
}

function mapExtras(value: unknown): MenuItemExtra[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const mapped: MenuItemExtra[] = [];
  value.forEach((entry) => {
    if (!entry || typeof entry !== 'object') return;
    const source = entry as Record<string, unknown>;
    const title = asString(source.title ?? source.name);
    if (!title) return;

    mapped.push({
      title,
      price: asNumber(source.price),
      imageUrl: asString(source.imageUrl ?? source.image_url ?? source.image, ''),
    });
  });

  return mapped.length ? mapped : undefined;
}

function mapReviews(value: unknown): MenuItemReview[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const mapped: MenuItemReview[] = [];
  value.forEach((entry, index) => {
    if (!entry || typeof entry !== 'object') return;
    const source = entry as Record<string, unknown>;

    mapped.push({
      id: asString(source.id ?? source._id, `review-${index}`),
      author: asString(source.author ?? source.user_name ?? source.name, 'Anonymous'),
      rating: asNumber(source.rating, 0),
      comment: asString(source.comment ?? source.review ?? source.text),
      createdAt: asString(source.createdAt ?? source.created_at, ''),
      rewardHP: asNumber(source.rewardHP ?? source.reward_hp ?? source.hp_reward, 0),
    });
  });

  return mapped.length ? mapped : undefined;
}

function mapMenuItem(raw: unknown, index: number): MenuItem {
  const source = (raw ?? {}) as Record<string, unknown>;

  const id = asString(source.id ?? source._id ?? source.slug, `menu-${index}`);
  const categoryValue = source.category;
  const category =
    typeof categoryValue === 'string'
      ? categoryValue
      : asString((categoryValue as Record<string, unknown> | undefined)?.name, 'General');

  return {
    id,
    name: asString(source.name ?? source.title, 'Unnamed menu item'),
    description: asString(source.description ?? source.details, ''),
    price: asNumber(source.price ?? source.base_price ?? source.amount),
    imageUrl: asString(
      source.imageUrl ?? source.image_url ?? source.image ?? source.photo_url,
      '/placeholder.svg',
    ),
    category,
    hpValue: asNumber(source.hpValue ?? source.hp_value ?? source.reward_hp, 0),
    isAvailable:
      typeof source.isAvailable === 'boolean'
        ? source.isAvailable
        : typeof source.is_available === 'boolean'
          ? (source.is_available as boolean)
          : source.status !== 'unavailable',
    sizes: mapSizes(source.sizes ?? source.variations),
    tagLine: asOptionalString(source.tagLine ?? source.tag_line),
    slashedPrice: asOptionalNumber(source.slashedPrice ?? source.slashed_price),
    percentageOff: asOptionalNumber(source.percentageOff ?? source.percentage_off),
    extras: mapExtras(source.extras ?? source.addons),
    reviews: mapReviews(source.reviews),
  };
}

function mapMenuItems(payload: unknown): MenuItem[] {
  const unwrapped = unwrapData<unknown>(payload);
  const list = Array.isArray(unwrapped)
    ? unwrapped
    : Array.isArray((unwrapped as Record<string, unknown>)?.items)
      ? ((unwrapped as Record<string, unknown>).items as unknown[])
      : Array.isArray((unwrapped as Record<string, unknown>)?.menu)
        ? ((unwrapped as Record<string, unknown>).menu as unknown[])
        : [];

  return list.map(mapMenuItem);
}

export async function getMenuItems(): Promise<MenuItem[]> {
  try {
    const response = await apiClient.get('/menu');
    const items = mapMenuItems(response.data);
    return items.length ? items : MOCK_MENU;
  } catch {
    return MOCK_MENU;
  }
}

export async function getMenuItemById(menuId: string): Promise<MenuItem | null> {
  try {
    const response = await apiClient.get(`/menu/${menuId}`);
    const unwrapped = unwrapData<unknown>(response.data);

    if (Array.isArray(unwrapped)) {
      const item = unwrapped[0];
      return item ? mapMenuItem(item, 0) : null;
    }

    return mapMenuItem(unwrapped, 0);
  } catch {
    const fallback = MOCK_MENU.find((item) => item.id === menuId);
    return fallback ?? null;
  }
}
