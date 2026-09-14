import { describe, expect, it } from 'bun:test';
import {
  getSavedItems,
} from '@/services/api/saved.service';

describe('Saved for Later API Service', () => {
  it('fetches saved items list', async () => {
    const items = await getSavedItems();
    expect(Array.isArray(items)).toBe(true);
  });
});
