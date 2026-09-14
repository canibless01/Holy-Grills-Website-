import { describe, it, expect, vi, beforeEach } from 'vitest';
import { referralService } from '@/services/api/referral.service';
import apiClient from '@/lib/api/client';

describe('referralService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('getReferrals should fetch referral stats and referral list', async () => {
    const mockPayload = {
      stats: {
        referral_code: 'REF123',
        referral_link: 'https://holygrills.app/signup?ref=REF123',
        total_referrals: 5,
        completed_referrals: 2,
        pending_referrals: 3,
        total_hp_earned: 150,
      },
      referrals: [
        { id: 'r1', status: 'completed', hp_awarded: 75, created_at: '2025-01-01T00:00:00Z' },
        { id: 'r2', status: 'pending', hp_awarded: 0, created_at: '2025-01-02T00:00:00Z' },
      ],
    };
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: mockPayload });

    const res = await referralService.getReferrals();

    expect(apiClient.get).toHaveBeenCalledWith('/api/referrals');
    expect(res.stats.referral_code).toBe('REF123');
    expect(res.stats.completed_referrals).toBe(2);
    expect(res.referrals.length).toBe(2);
  });

  it('getReferralStats should return lightweight stats object', async () => {
    const mockStats = {
      referral_code: 'MYCODE',
      referral_link: 'https://holygrills.app/signup?ref=MYCODE',
      total_referrals: 10,
      completed_referrals: 5,
      pending_referrals: 5,
      total_hp_earned: 375,
    };
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: mockStats });

    const res = await referralService.getReferralStats();

    expect(apiClient.get).toHaveBeenCalledWith('/api/referrals/stats');
    expect(res.referral_code).toBe('MYCODE');
    expect(res.total_hp_earned).toBe(375);
  });
});
