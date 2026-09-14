import { describe, expect, it } from 'bun:test';
import {
  getBanners,
  getOperatingHours,
  getPublicConfig,
} from '@/services/api/storefront.service';

describe('Storefront API Service', () => {
  it('fetches banners, operating hours, and public config', async () => {
    const banners = await getBanners('home');
    expect(Array.isArray(banners)).toBe(true);

    const hours = await getOperatingHours();
    expect(typeof hours).toBe('object');

    const config = await getPublicConfig();
    expect(typeof config).toBe('object');
  });
});
