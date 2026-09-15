import apiClient from '@/lib/api/client';

export interface HPBalanceResponse {
  balance: number;
  tier: {
    id: string;
    name: string;
    multiplier: number;
    badge_color?: string;
  };
  tier_grace_ends_at?: string | null;
  hp_earned_120day?: number;
  next_tier?: {
    name: string;
    threshold: number;
    hp_needed: number;
  } | null;
}

export interface HPTransaction {
  id: string;
  amount: number;
  type: 'earn' | 'spend' | 'expire' | 'transfer_in' | 'transfer_out' | 'bonus';
  description: string;
  created_at: string;
  reference_type?: string;
  reference_id?: string;
}

export interface ExclusiveSpinStatus {
  can_spin: boolean;
  spins_remaining: number;
  pool_prizes: Array<{
    id: string;
    title: string;
    type: string;
    value: number | string;
    probability: number;
  }>;
}

export interface FreeSidesResponse {
  available: boolean;
  free_side_items: Array<{
    id: string;
    name: string;
    image_url?: string;
    category?: string;
  }>;
}

export const hpService = {
  /**
   * GET /api/hp
   * Get user's current HP balance, tier details, and threshold progress.
   */
  async getHpDetails(): Promise<HPBalanceResponse> {
    const res = await apiClient.get<HPBalanceResponse | { data: HPBalanceResponse }>('/hp');
    return (res.data && 'data' in res.data ? res.data.data : res.data) as HPBalanceResponse;
  },

  /**
   * GET /api/hp/transactions
   * Get user HP history.
   */
  async getHpTransactions(page = 1, limit = 20): Promise<{ transactions: HPTransaction[]; total: number }> {
    const res = await apiClient.get<{ transactions: HPTransaction[]; total: number } | HPTransaction[]>('/hp/transactions', {
      params: { page, limit },
    });
    if (Array.isArray(res.data)) {
      return { transactions: res.data, total: res.data.length };
    }
    return {
      transactions: res.data?.transactions ?? [],
      total: res.data?.total ?? 0,
    };
  },

  /**
   * POST /api/hp/transfer
   * Transfer HP to another student.
   */
  async transferHp(recipientId: string, amount: number, notes?: string): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.post<{ message: string }>('/hp/transfer', {
      recipient_id: recipientId,
      amount,
      notes,
    });
    return {
      success: true,
      message: res.data?.message ?? 'HP transferred successfully!',
    };
  },

  /**
   * POST /api/hp/flash-redeem/:rewardId
   * Redeem a flash HP deal.
   */
  async flashRedeem(rewardId: string): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.post<{ message: string }>(`/hp/flash-redeem/${rewardId}`);
    return {
      success: true,
      message: res.data?.message ?? 'Flash deal redeemed!',
    };
  },

  /**
   * GET /api/exclusive-spin/status
   */
  async getSpinStatus(): Promise<ExclusiveSpinStatus> {
    const res = await apiClient.get<ExclusiveSpinStatus | { data: ExclusiveSpinStatus }>('/exclusive-spin/status');
    return (res.data && 'data' in res.data ? res.data.data : res.data) as ExclusiveSpinStatus;
  },

  /**
   * POST /api/exclusive-spin/spin
   */
  async triggerSpin(): Promise<{ prize: { id: string; title: string; type: string; value: number | string }; message: string }> {
    const res = await apiClient.post<{ prize: { id: string; title: string; type: string; value: number | string }; message: string }>('/exclusive-spin/spin');
    return res.data;
  },

  /**
   * GET /api/free-sides/available
   */
  async getFreeSides(): Promise<FreeSidesResponse> {
    const res = await apiClient.get<FreeSidesResponse | { data: FreeSidesResponse }>('/free-sides/available');
    return (res.data && 'data' in res.data ? res.data.data : res.data) as FreeSidesResponse;
  },

  /**
   * POST /api/free-sides/claim
   */
  async claimFreeSide(sideId: string, orderId?: string): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.post<{ message: string }>('/free-sides/claim', {
      side_id: sideId,
      order_id: orderId,
    });
    return {
      success: true,
      message: res.data?.message ?? 'Free side claimed!',
    };
  },
};
