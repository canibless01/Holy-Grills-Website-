import { describe, it, expect, vi, beforeEach } from 'vitest';
import { challengesService } from '@/services/api/challenges.service';
import apiClient from '@/lib/api/client';

describe('challengesService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('getChallenges should fetch milestones with time_window filter', async () => {
    const mockMilestones = [
      { id: 'm1', title: 'Squad Orders', trigger_type: 'squad_orders', trigger_value: 3, hp_awarded: 100, time_window: 'weekly' },
    ];
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: mockMilestones });

    const res = await challengesService.getChallenges('weekly');

    expect(apiClient.get).toHaveBeenCalledWith('/api/challenges', { params: { time_window: 'weekly' } });
    expect(res).toEqual(mockMilestones);
  });

  it('getMyChallenges should extract badges and challenges array', async () => {
    const mockData = {
      badges: [{ id: 'b1', title: 'First Order' }],
      challenges_available: [{ id: 'm1', title: 'Squad 3', trigger_type: 'squad_orders', trigger_value: 3, hp_awarded: 50 }],
      challenges_completed: [],
    };
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: mockData });

    const res = await challengesService.getMyChallenges();

    expect(apiClient.get).toHaveBeenCalledWith('/api/challenges/my');
    expect(res).toEqual(mockData);
  });

  it('completeChallenge should post to completion endpoint', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: { success: true, milestone: 'm1', hp_awarded: 50, already_completed: false },
    });

    const res = await challengesService.completeChallenge('m1');

    expect(apiClient.post).toHaveBeenCalledWith('/api/challenges/m1/complete');
    expect(res.success).toBe(true);
    expect(res.hp_awarded).toBe(50);
  });

  it('getPwaPushBonusStatus should parse boolean status flags', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: { pwa_install: true, push_subscribe: false, bonus_completed: false, eligible: true },
    });

    const res = await challengesService.getPwaPushBonusStatus();

    expect(apiClient.get).toHaveBeenCalledWith('/api/challenges/pwa-push-bonus-status');
    expect(res).toEqual({
      pwa_install: true,
      push_subscribe: false,
      bonus_completed: false,
      eligible: true,
    });
  });
});
