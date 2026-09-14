import { describe, expect, it } from 'vitest';
import { DEFAULT_CAMPUSES } from '@/context/CampusContext';

describe('Campus Selector Context', () => {
  it('has valid default campuses', () => {
    expect(DEFAULT_CAMPUSES).toHaveLength(3);
    expect(DEFAULT_CAMPUSES[0].code).toBe('futa');
    expect(DEFAULT_CAMPUSES[1].code).toBe('unilag');
  });
});
