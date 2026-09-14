import apiClient from '@/lib/api/client';
import type {
  KitchenCapacity,
  MenuAddonGroup,
  MenuCategory,
  MenuItem,
  MenuItemExtra,
  MenuItemReview,
  MenuItemSize,
  MenuItemVariationGroup,
} from '@/types';
import { MOCK_MENU } from '@/data/menu';

function unwrapData<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && payload !== null) {
    if ('data' in payload) {
      return (payload as { data: T }).data;
    }
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
  if (value === null || value === undefined || value === '') return undefined;
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

function mapVariationGroups(value: unknown): MenuItemVariationGroup[] | undefined {
  if (!Array.isArray(value)) return undefined;

  return value.map((groupRaw: Record<string, unknown>) => {
    const rawOptions = Array.isArray(groupRaw.options)
      ? groupRaw.options
      : Array.isArray(groupRaw.variation_options)
        ? groupRaw.variation_options
        : [];

    return {
      id: asString(groupRaw.id),
      menu_item_id: asOptionalString(groupRaw.menu_item_id),
      name: asString(groupRaw.name),
      is_required: Boolean(groupRaw.is_required),
      min_selections: asNumber(groupRaw.min_selections ?? groupRaw.min_select, 0),
      max_selections: asNumber(groupRaw.max_selections ?? groupRaw.max_select, 1),
      sort_order: asOptionalNumber(groupRaw.sort_order),
      options: rawOptions.map((optRaw: Record<string, unknown>) => ({
        id: asString(optRaw.id),
        variation_group_id: asOptionalString(optRaw.variation_group_id),
        name: asString(optRaw.name),
        price_delta: asNumber(optRaw.price_delta ?? optRaw.price, 0),
        is_available: optRaw.is_available !== false,
        sort_order: asOptionalNumber(optRaw.sort_order),
      })),
    };
  });
}

function mapAddonGroups(value: unknown): MenuAddonGroup[] | undefined {
  if (!Array.isArray(value)) return undefined;

  return value.map((groupRaw: Record<string, unknown>) => {
    const rawAddons = Array.isArray(groupRaw.addons)
      ? groupRaw.addons
      : Array.isArray(groupRaw.menu_addons)
        ? groupRaw.menu_addons
        : [];

    return {
      id: asString(groupRaw.id),
      menu_item_id: asOptionalString(groupRaw.menu_item_id),
      name: asString(groupRaw.name),
      is_required: Boolean(groupRaw.is_required),
      min_select: asNumber(groupRaw.min_select ?? groupRaw.min_selections, 0),
      max_select: asNumber(groupRaw.max_select ?? groupRaw.max_selections, 1),
      sort_order: asOptionalNumber(groupRaw.sort_order),
      addons: rawAddons.map((addonRaw: Record<string, unknown>) => ({
        id: asString(addonRaw.id),
        group_id: asOptionalString(addonRaw.group_id),
        name: asString(addonRaw.name),
        description: asOptionalString(addonRaw.description),
        price: asNumber(addonRaw.price, 0),
        is_available: addonRaw.is_available !== false,
        is_archived: Boolean(addonRaw.is_archived),
        sort_order: asOptionalNumber(addonRaw.sort_order),
      })),
    };
  });
}

export function mapMenuItem(raw: unknown, index: number): MenuItem {
  const source = (raw ?? {}) as Record<string, unknown>;

  const id = asString(source.id ?? source._id ?? source.slug, `menu-${index}`);
  const categoryValue = source.category ?? source.category_name;
  const category =
    typeof categoryValue === 'string'
      ? categoryValue
      : asString((categoryValue as Record<string, unknown> | undefined)?.name, 'General');

  const variationGroups = mapVariationGroups(source.variation_groups ?? source.variationGroups);
  const addonGroups = mapAddonGroups(source.addon_groups ?? source.addonGroups);

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
    hpValue: asNumber(source.hpValue ?? source.hp_value ?? source.hp_earn ?? source.reward_hp, 0),
    isAvailable:
      typeof source.isAvailable === 'boolean'
        ? source.isAvailable
        : typeof source.is_available === 'boolean'
          ? (source.is_available as boolean)
          : source.status !== 'unavailable',
    isSecret:
      typeof source.isSecret === 'boolean'
        ? source.isSecret
        : typeof source.is_secret === 'boolean'
          ? (source.is_secret as boolean)
          : false,
    hpMultiplier: asOptionalNumber(source.hpMultiplier ?? source.hp_multiplier),
    dailyLimit: asOptionalNumber(source.dailyLimit ?? source.daily_limit),
    sizes: mapSizes(source.sizes ?? source.variations),
    tagLine: asOptionalString(source.tagLine ?? source.tag_line),
    slashedPrice: asOptionalNumber(source.slashedPrice ?? source.slashed_price),
    percentageOff: asOptionalNumber(source.percentageOff ?? source.percentage_off),
    extras: mapExtras(source.extras ?? source.addons),
    reviews: mapReviews(source.reviews),
    variationGroups,
    addonGroups,
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

export async function getMenuItems(search?: string | unknown, category?: string): Promise<MenuItem[]> {
  try {
    const params: Record<string, string> = {};
    const searchQuery = typeof search === 'string' ? search.trim() : undefined;
    if (searchQuery) {
      params.q = searchQuery;
    }
    if (category && category !== 'All') {
      params.category = category;
    }

    const response = await apiClient.get('/menu/items', { params });
    const items = mapMenuItems(response.data);
    return items;
  } catch {
    let filteredMock = MOCK_MENU;
    if (category && category !== 'All') {
      filteredMock = filteredMock.filter((i) => i.category === category);
    }
    const searchQuery = typeof search === 'string' ? search.trim() : undefined;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filteredMock = filteredMock.filter(
        (i) => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q),
      );
    }
    return filteredMock;
  }
}

export async function getMenuItemById(menuId: string): Promise<MenuItem | null> {
  try {
    const response = await apiClient.get(`/menu/items/${menuId}`);
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

export async function getItemAddonGroups(menuId: string): Promise<MenuAddonGroup[]> {
  try {
    const response = await apiClient.get(`/menu/items/${menuId}/addons`);
    const unwrapped = unwrapData<unknown>(response.data);
    const mapped = mapAddonGroups(unwrapped);
    return mapped ?? [];
  } catch {
    return [];
  }
}

export async function getKitchenCapacity(): Promise<KitchenCapacity | null> {
  try {
    const response = await apiClient.get('/menu/kitchen-capacity');
    const unwrapped = unwrapData<KitchenCapacity>(response.data);
    return unwrapped ?? null;
  } catch {
    return null;
  }
}

export async function getCategories(): Promise<MenuCategory[]> {
  try {
    const response = await apiClient.get('/menu/categories');
    const unwrapped = unwrapData<unknown>(response.data);
    if (Array.isArray(unwrapped)) {
      return unwrapped as MenuCategory[];
    }
    return [];
  } catch {
    return [];
  }
}

// Admin API endpoints
export async function createCategory(data: Partial<MenuCategory>): Promise<unknown> {
  const response = await apiClient.post('/menu/categories', data);
  return response.data;
}

export async function updateCategory(categoryId: string, data: Partial<MenuCategory>): Promise<unknown> {
  const response = await apiClient.patch(`/menu/categories/${categoryId}`, data);
  return response.data;
}

export async function deleteCategory(categoryId: string): Promise<unknown> {
  const response = await apiClient.delete(`/menu/categories/${categoryId}`);
  return response.data;
}

export async function createMenuItem(data: Record<string, unknown>): Promise<unknown> {
  const response = await apiClient.post('/menu/items', data);
  return response.data;
}

export async function updateMenuItem(itemId: string, data: Record<string, unknown>): Promise<unknown> {
  const response = await apiClient.patch(`/menu/items/${itemId}`, data);
  return response.data;
}

export async function archiveMenuItem(itemId: string): Promise<unknown> {
  const response = await apiClient.post(`/menu/items/${itemId}/archive`);
  return response.data;
}

export async function updateItemAvailability(itemId: string, data: Record<string, unknown>): Promise<unknown> {
  const response = await apiClient.patch(`/menu/items/${itemId}/availability`, data);
  return response.data;
}

export async function bulkUpdateAvailability(data: Record<string, unknown>): Promise<unknown> {
  const response = await apiClient.patch('/menu/items/bulk-availability', data);
  return response.data;
}

export async function updateMenuItemImage(itemId: string, imageUrl: string): Promise<unknown> {
  const response = await apiClient.post(`/menu/items/${itemId}/image`, { image_url: imageUrl });
  return response.data;
}

export async function setKitchenCapacity(dailyOrderCapacity: number): Promise<unknown> {
  const response = await apiClient.patch('/menu/kitchen-capacity', {
    daily_order_capacity: dailyOrderCapacity,
  });
  return response.data;
}
