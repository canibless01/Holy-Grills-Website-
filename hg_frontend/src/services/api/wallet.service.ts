import apiClient from '@/lib/api/client';

export interface WalletBalanceInfo {
  wallet_balance: number;
  currency: string;
  user_id: string;
  virtual_account?: {
    account_number: string;
    account_name: string;
    bank_name: string;
    provider?: string;
  } | null;
}

export interface WalletTransactionItem {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  balance_after?: number;
  reason?: string;
  reference_type?: string;
  reference_id?: string;
  provider?: string;
  provider_reference?: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}

export interface FundCardPayload {
  amount?: number;
  callback_url?: string;
}

export interface FundCardResponse {
  wallet_balance?: number;
  currency?: string;
  user_id?: string;
  authorization_url?: string;
  access_code?: string;
  reference?: string;
  [key: string]: unknown;
}

export interface VirtualAccountResponse {
  wallet_balance?: number;
  currency?: string;
  user_id?: string;
  account_number?: string;
  account_name?: string;
  bank_name?: string;
  provider?: string;
  [key: string]: unknown;
}

function unwrapData<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && payload !== null && 'data' in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

export const walletService = {
  /**
   * GET /api/wallet
   * Get wallet balance and virtual account info.
   */
  async getWalletBalance(): Promise<WalletBalanceInfo> {
    const res = await apiClient.get('/api/wallet');
    const data = unwrapData<WalletBalanceInfo>(res.data);
    return {
      wallet_balance: Number(data?.wallet_balance ?? 0),
      currency: data?.currency ?? 'NGN',
      user_id: data?.user_id ?? '',
      virtual_account: data?.virtual_account ?? null,
    };
  },

  /**
   * GET /api/wallet/transactions
   * Get wallet transaction history. Option filter by type.
   */
  async getWalletTransactions(type?: string): Promise<WalletTransactionItem[]> {
    const params: Record<string, string> = {};
    if (type && type !== 'all') {
      params.type = type;
    }
    const res = await apiClient.get('/api/wallet/transactions', { params });
    const data = unwrapData<unknown>(res.data);

    if (Array.isArray(data)) {
      return data as WalletTransactionItem[];
    }
    if (data && typeof data === 'object' && data !== null && 'transactions' in data && Array.isArray((data as { transactions: unknown[] }).transactions)) {
      return (data as { transactions: WalletTransactionItem[] }).transactions;
    }
    return [];
  },

  /**
   * POST /api/wallet/fund/card
   * Initialize a card payment to top up wallet.
   */
  async fundViaCard(payload: FundCardPayload): Promise<FundCardResponse> {
    const res = await apiClient.post('/api/wallet/fund/card', payload);
    return unwrapData<FundCardResponse>(res.data);
  },

  /**
   * POST /api/wallet/fund/bank
   * Provision a Paystack Dedicated Virtual Account for bank transfers.
   */
  async requestVirtualAccount(): Promise<VirtualAccountResponse> {
    const res = await apiClient.post('/api/wallet/fund/bank');
    return unwrapData<VirtualAccountResponse>(res.data);
  },

  /**
   * GET /api/wallet/admin/transactions
   * List wallet transactions (admin only).
   */
  async getAdminWalletTransactions(params?: {
    campus_id?: string;
    from_date?: string;
    to_date?: string;
    type?: string;
    user_id?: string;
  }): Promise<WalletTransactionItem[]> {
    const res = await apiClient.get('/api/wallet/admin/transactions', { params });
    const data = unwrapData<unknown>(res.data);
    if (Array.isArray(data)) {
      return data as WalletTransactionItem[];
    }
    if (data && typeof data === 'object' && data !== null && 'transactions' in data && Array.isArray((data as { transactions: unknown[] }).transactions)) {
      return (data as { transactions: WalletTransactionItem[] }).transactions;
    }
    return [];
  },
};

export default walletService;
