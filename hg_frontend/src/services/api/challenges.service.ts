import apiClient from '@/lib/api/client';
import type {
  Milestone,
  ChallengesMyResponse,
  ChallengeCompleteResponse,
  PWAPushBonusStatus,
  PushSubscriptionPayload,
} from '@/types';

export const challengesService = {
  /**
   * GET /api/challenges
   * List active challenges / milestones.
   */
  async getChallenges(timeWindow?: 'weekly' | 'monthly'): Promise<Milestone[]> {
    const params: Record<string, string> = {};
    if (timeWindow) params.time_window = timeWindow;
    const res = await apiClient.get<Milestone[] | { data: Milestone[] }>('/api/challenges', { params });
    if (Array.isArray(res.data)) {
      return res.data;
    }
    if (res.data && Array.isArray((res.data as { data: Milestone[] }).data)) {
      return (res.data as { data: Milestone[] }).data;
    }
    return [];
  },

  /**
   * GET /api/challenges/my
   * Get caller's badges, available challenges, and completed challenges.
   */
  async getMyChallenges(): Promise<ChallengesMyResponse> {
    const res = await apiClient.get<ChallengesMyResponse | { data: ChallengesMyResponse }>('/api/challenges/my');
    const data = (res.data && 'data' in res.data ? res.data.data : res.data) as ChallengesMyResponse;
    return {
      badges: data?.badges ?? [],
      challenges_available: data?.challenges_available ?? [],
      challenges_completed: data?.challenges_completed ?? [],
    };
  },

  /**
   * POST /api/challenges/:id/complete
   * Claim/trigger completion for a recurring milestone.
   */
  async completeChallenge(milestoneId: string): Promise<ChallengeCompleteResponse> {
    const res = await apiClient.post<ChallengeCompleteResponse | { data: ChallengeCompleteResponse }>(
      `/api/challenges/${milestoneId}/complete`
    );
    return (res.data && 'data' in res.data ? res.data.data : res.data) as ChallengeCompleteResponse;
  },

  /**
   * POST /api/challenges/pwa-installed
   * Award PWA install milestone.
   */
  async recordPwaInstalled(): Promise<ChallengeCompleteResponse> {
    const res = await apiClient.post<ChallengeCompleteResponse | { data: ChallengeCompleteResponse }>(
      '/api/challenges/pwa-installed'
    );
    return (res.data && 'data' in res.data ? res.data.data : res.data) as ChallengeCompleteResponse;
  },

  /**
   * POST /api/challenges/push-subscribed
   * Register push subscription and award push subscribe milestone.
   */
  async recordPushSubscribed(payload: PushSubscriptionPayload): Promise<ChallengeCompleteResponse> {
    const res = await apiClient.post<ChallengeCompleteResponse | { data: ChallengeCompleteResponse }>(
      '/api/challenges/push-subscribed',
      payload
    );
    return (res.data && 'data' in res.data ? res.data.data : res.data) as ChallengeCompleteResponse;
  },

  /**
   * GET /api/challenges/pwa-push-bonus-status
   * Check PWA install + Push subscribe completion & bonus status.
   */
  async getPwaPushBonusStatus(): Promise<PWAPushBonusStatus> {
    const res = await apiClient.get<PWAPushBonusStatus | { data: PWAPushBonusStatus }>(
      '/api/challenges/pwa-push-bonus-status'
    );
    const data = (res.data && 'data' in res.data ? res.data.data : res.data) as PWAPushBonusStatus;
    return {
      pwa_install: Boolean(data?.pwa_install),
      push_subscribe: Boolean(data?.push_subscribe),
      bonus_completed: Boolean(data?.bonus_completed),
      eligible: Boolean(data?.eligible),
    };
  },
};
