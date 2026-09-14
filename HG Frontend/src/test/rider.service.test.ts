import { describe, it, expect } from 'vitest';
import {
  getMyBatch,
  getRiderStats,
  getRiderEarnings,
  getRiderHistory,
  getCallLink,
} from '../services/api/rider.service';

describe('Rider API Service', () => {
  it('fetches my batch', async () => {
    const batch = await getMyBatch();
    expect(batch).toBeDefined();
    if (batch) {
      expect(Array.isArray(batch.orders)).toBe(true);
    }
  });

  it('fetches rider stats', async () => {
    const stats = await getRiderStats();
    expect(stats).toBeDefined();
    expect(typeof stats.total_deliveries).toBe('number');
  });

  it('fetches rider earnings', async () => {
    const earnings = await getRiderEarnings('today');
    expect(earnings).toBeDefined();
    expect(typeof earnings.total_earnings).toBe('number');
  });

  it('fetches rider history', async () => {
    const history = await getRiderHistory();
    expect(Array.isArray(history)).toBe(true);
  });

  it('fetches call link', async () => {
    const link = await getCallLink('order-1');
    expect(link.phone).toBeDefined();
    expect(link.call_url).toBeDefined();
  });
});
