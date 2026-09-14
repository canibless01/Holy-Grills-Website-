import { describe, expect, it } from 'vitest';
import {
  getAdminUsers,
  getUserHpHistory,
  getUserOrderHistory,
  getUserWalletHistory,
  getEconomicsOverview,
  getEconomicsTierBreakdown,
  getEconomicsRedemptionAnalytics,
  getFeatureFlags,
} from '@/services/api/admin.service';

describe('Admin Management & Economics Service', () => {
  it('fetches admin user list and details', async () => {
    const users = await getAdminUsers();
    expect(Array.isArray(users)).toBe(true);

    const hpHistory = await getUserHpHistory('u1');
    expect(hpHistory).toBeDefined();

    const orders = await getUserOrderHistory('u1');
    expect(Array.isArray(orders)).toBe(true);

    const wallet = await getUserWalletHistory('u1');
    expect(wallet).toBeDefined();
  });

  it('fetches HP economics overview, tier breakdown, and redemption analytics', async () => {
    const overview = await getEconomicsOverview();
    expect(overview.food_revenue).toBeGreaterThanOrEqual(0);
    expect(typeof overview.programme_efficiency).toBe('number');

    const tiers = await getEconomicsTierBreakdown();
    expect(Array.isArray(tiers)).toBe(true);

    const redemptions = await getEconomicsRedemptionAnalytics();
    expect(redemptions.cost_by_type).toBeDefined();
  });

  it('fetches feature flags', async () => {
    const flags = await getFeatureFlags();
    expect(Array.isArray(flags)).toBe(true);
  });
});
