import apiClient from '@/lib/api/client';
import type { ReferralStats, ReferredUser, ReferralDataResponse } from '@/types';

export const referralService = {
  /**
   * GET /api/referrals
   * Get authenticated user's referral stats and list of referred friends.
   */
  async getReferrals(): Promise<ReferralDataResponse> {
    const res = await apiClient.get<ReferralDataResponse | { data: ReferralDataResponse }>('/api/referrals');
    const data = (res.data && 'data' in res.data ? res.data.data : res.data) as Partial<ReferralDataResponse> & Record<string, unknown>;

    const stats = data?.stats ?? {
      referral_code: (data?.referral_code as string) ?? '',
      referral_link: (data?.referral_link as string) ?? '',
      total_referrals: (data?.total_referrals as number) ?? 0,
      completed_referrals: (data?.completed_referrals as number) ?? 0,
      pending_referrals: (data?.pending_referrals as number) ?? 0,
      total_hp_earned: (data?.total_hp_earned as number) ?? 0,
    };

    const referrals = Array.isArray(data?.referrals)
      ? data.referrals
      : Array.isArray(res.data)
      ? (res.data as ReferredUser[])
      : [];

    return { stats, referrals };
  },

  /**
   * GET /api/referrals/stats
   * Get lightweight referral stats summary.
   */
  async getReferralStats(): Promise<ReferralStats> {
    const res = await apiClient.get<ReferralStats | { data: ReferralStats }>('/api/referrals/stats');
    const data = (res.data && 'data' in res.data ? res.data.data : res.data) as ReferralStats;
    return {
      referral_code: data?.referral_code ?? '',
      referral_link: data?.referral_link ?? '',
      total_referrals: data?.total_referrals ?? 0,
      completed_referrals: data?.completed_referrals ?? 0,
      pending_referrals: data?.pending_referrals ?? 0,
      total_hp_earned: data?.total_hp_earned ?? 0,
    };
  },
};
