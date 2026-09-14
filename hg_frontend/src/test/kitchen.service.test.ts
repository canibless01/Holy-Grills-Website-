import { describe, it, expect } from 'vitest';
import {
  getKitchenQueue,
  getScheduledOrders,
  getKitchenWindows,
  getBatchSummary,
  getKitchenMetrics,
  getKitchenSettings,
} from '../services/api/kitchen.service';

describe('Kitchen API Service', () => {
  it('fetches kitchen queue', async () => {
    const queue = await getKitchenQueue();
    expect(Array.isArray(queue)).toBe(true);
  });

  it('fetches scheduled orders', async () => {
    const scheduled = await getScheduledOrders();
    expect(Array.isArray(scheduled)).toBe(true);
  });

  it('fetches kitchen delivery windows', async () => {
    const windows = await getKitchenWindows();
    expect(Array.isArray(windows)).toBe(true);
    expect(windows.length).toBeGreaterThan(0);
  });

  it('fetches batch summary', async () => {
    const summary = await getBatchSummary('win-1');
    expect(summary).toBeDefined();
    expect(Array.isArray(summary.items)).toBe(true);
  });

  it('fetches kitchen metrics', async () => {
    const metrics = await getKitchenMetrics();
    expect(metrics).toBeDefined();
    expect(typeof metrics.avg_prep_time_minutes).toBe('number');
  });

  it('fetches kitchen settings', async () => {
    const settings = await getKitchenSettings();
    expect(settings).toBeDefined();
    expect(typeof settings).toBe('object');
  });
});
