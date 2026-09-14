import apiClient from '@/lib/api/client';
import type {
  RewardChallenge,
  RewardRedemption,
  RewardTier,
  RewardTransaction,
} from '@/types';
import {
  HP_TRANSACTIONS,
  REWARD_CHALLENGES,
  REWARD_REDEMPTIONS,
  REWARD_TIERS,
} from '@/services/mocks/platform';

export interface RewardsSnapshot {
  balance: number;
  tier: RewardTier;
  tiers: RewardTier[];
  redemptions: RewardRedemption[];
  challenges: RewardChallenge[];
  transactions: RewardTransaction[];
}

function unwrapData<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data;
  }

  return payload as T;
}

function asNumber(value: unknown, fallback = 0): number {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asOptionalNumber(value: unknown): number | undefined {
  const next = Number(value);
  return Number.isFinite(next) ? next : undefined;
}

function mapTier(raw: unknown, index: number): RewardTier {
  const source = (raw ?? {}) as Record<string, unknown>;

  return {
    name: asString(source.name, `Tier ${index + 1}`),
    minHP: asNumber(source.minHP ?? source.min_hp),
    maxHP:
      source.maxHP === null || source.max_hp === null
        ? undefined
        : asOptionalNumber(source.maxHP ?? source.max_hp),
    perk: asString(source.perk ?? source.description, ''),
    badge: asString(source.badge ?? source.label, ''),
  };
}

function mapChallenges(raw: unknown): RewardChallenge[] {
  if (!Array.isArray(raw)) return REWARD_CHALLENGES;

  return raw.map((entry, index) => {
    const source = (entry ?? {}) as Record<string, unknown>;

    return {
      id: asString(source.id, `challenge-${index}`),
      title: asString(source.title ?? source.name, 'Challenge'),
      description: asString(source.description, ''),
      current: asNumber(source.current ?? source.progress),
      target: asNumber(source.target ?? source.goal, 1),
      rewardHP: asNumber(source.rewardHP ?? source.reward_hp),
    };
  });
}

function mapRedemptions(raw: unknown): RewardRedemption[] {
  if (!Array.isArray(raw)) return REWARD_REDEMPTIONS;

  return raw.map((entry, index) => {
    const source = (entry ?? {}) as Record<string, unknown>;

    return {
      id: asString(source.id, `reward-${index}`),
      title: asString(source.title ?? source.name, 'Reward'),
      description: asString(source.description, ''),
      hpCost: asNumber(source.hpCost ?? source.hp_cost),
      locked: Boolean(source.locked),
    };
  });
}

function mapTransactions(raw: unknown): RewardTransaction[] {
  if (!Array.isArray(raw)) return HP_TRANSACTIONS;

  return raw.map((entry, index) => {
    const source = (entry ?? {}) as Record<string, unknown>;

    return {
      id: asString(source.id, `tx-${index}`),
      label: asString(source.label ?? source.description ?? source.type, 'HP transaction'),
      type:
        source.type === 'redeemed' || source.type === 'bonus' || source.type === 'earned'
          ? source.type
          : 'earned',
      hp: asNumber(source.hp ?? source.amount),
      date: asString(source.date ?? source.created_at, ''),
    };
  });
}

export async function getRewardsSnapshot(): Promise<RewardsSnapshot> {
  try {
    const response = await apiClient.get('/rewards');
    const payload = unwrapData<Record<string, unknown>>(response.data);

    const tiers = Array.isArray(payload.tiers)
      ? payload.tiers.map(mapTier)
      : REWARD_TIERS;
    const currentTier = payload.tier ? mapTier(payload.tier, 0) : tiers[0];

    return {
      balance: asNumber(payload.balance ?? payload.hp_balance),
      tier: currentTier,
      tiers,
      redemptions: mapRedemptions(payload.redemptions),
      challenges: mapChallenges(payload.challenges),
      transactions: mapTransactions(payload.transactions),
    };
  } catch {
    return {
      balance: 248,
      tier: REWARD_TIERS[2],
      tiers: REWARD_TIERS,
      redemptions: REWARD_REDEMPTIONS,
      challenges: REWARD_CHALLENGES,
      transactions: HP_TRANSACTIONS,
    };
  }
}

export async function transferHpApi(recipientId: string, amount: number, notes?: string): Promise<void> {
  await apiClient.post('/hp/transfer', { recipient_id: recipientId, amount, notes });
}

export async function spinExclusiveWheelApi(): Promise<{ prize_name: string; hp_awarded?: number }> {
  const response = await apiClient.post('/exclusive-spin/spin');
  const payload = unwrapData<Record<string, unknown>>(response.data);
  return {
    prize_name: asString(payload.prize_name ?? payload.name ?? payload.prize, 'Bonus Reward'),
    hp_awarded: asOptionalNumber(payload.hp_awarded ?? payload.amount),
  };
}

export async function redeemRewardApi(rewardId: string): Promise<void> {
  await apiClient.post(`/rewards/${rewardId}/redeem`);
}

export async function flashRedeemRewardApi(rewardId: string): Promise<void> {
  await apiClient.post(`/hp/flash-redeem/${rewardId}`);
}

export async function claimGraduationHpApi(): Promise<void> {
  await apiClient.post('/graduation/claim');
}
