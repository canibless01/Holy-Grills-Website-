import { describe, it, expect, vi, beforeEach } from 'vitest';
import { walletService } from '@/services/api/wallet.service';
import apiClient from '@/lib/api/client';

describe('walletService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches wallet balance', async () => {
    const mockData = {
      wallet_balance: 5000,
      currency: 'NGN',
      user_id: 'usr_123',
    };
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: mockData });

    const res = await walletService.getWalletBalance();

    expect(apiClient.get).toHaveBeenCalledWith('/api/wallet');
    expect(res).toEqual({
      wallet_balance: 5000,
      currency: 'NGN',
      user_id: 'usr_123',
      virtual_account: null,
    });
  });

  it('fetches wallet transactions with optional filter', async () => {
    const mockTxs = [
      { id: 'tx_1', amount: 1000, type: 'topup', created_at: '2025-01-01' },
      { id: 'tx_2', amount: 500, type: 'order_payment', created_at: '2025-01-02' },
    ];
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: { transactions: mockTxs } });

    const res = await walletService.getWalletTransactions('topup');

    expect(apiClient.get).toHaveBeenCalledWith('/api/wallet/transactions', { params: { type: 'topup' } });
    expect(res).toEqual(mockTxs);
  });

  it('initializes card funding', async () => {
    const mockResponse = {
      authorization_url: 'https://checkout.paystack.com/xyz',
      reference: 'ref_123',
    };
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: mockResponse });

    const res = await walletService.fundViaCard({ amount: 2000, callback_url: 'https://app.com/wallet' });

    expect(apiClient.post).toHaveBeenCalledWith('/api/wallet/fund/card', {
      amount: 2000,
      callback_url: 'https://app.com/wallet',
    });
    expect(res).toEqual(mockResponse);
  });

  it('provisions virtual bank account', async () => {
    const mockVa = {
      account_number: '1234567890',
      account_name: 'HG Student - John Doe',
      bank_name: 'Wema Bank',
    };
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: mockVa });

    const res = await walletService.requestVirtualAccount();

    expect(apiClient.post).toHaveBeenCalledWith('/api/wallet/fund/bank');
    expect(res).toEqual(mockVa);
  });
});
