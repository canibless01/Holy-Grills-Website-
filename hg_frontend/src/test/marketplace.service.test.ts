import { describe, it, expect } from 'vitest';
import {
  getMarketplaceListings,
  getMarketplaceListing,
  getMyMarketplacePurchases,
} from '../services/api/marketplace.service';

describe('Marketplace API Service', () => {
  it('fetches marketplace listings', async () => {
    const listings = await getMarketplaceListings();
    expect(Array.isArray(listings)).toBe(true);
  });

  it('fetches marketplace listing by id', async () => {
    const listing = await getMarketplaceListing('mkt-1');
    expect(listing).toBeDefined();
  });

  it('fetches my purchases', async () => {
    const purchases = await getMyMarketplacePurchases();
    expect(Array.isArray(purchases)).toBe(true);
  });
});
