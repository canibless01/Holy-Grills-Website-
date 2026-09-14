'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Flame,
  Wallet2,
  Plus,
  Send,
  Building2,
  CreditCard,
  Copy,
  Check,
  Loader2,
  X,
  Receipt,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { walletService, WalletTransactionItem } from '@/services/api/wallet.service';
import { transferHpApi, getRewardsSnapshot } from '@/services/api/reward.service';
import { toast } from 'sonner';

function formatNaira(value: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(value);
}

const PRESET_AMOUNTS = [1000, 2000, 5000, 10000];

const WalletPage = () => {
  const { user, setUser, isAuthenticated } = useAuthStore();

  // Queries
  const {
    data: walletInfo,
    isLoading: isWalletLoading,
    refetch: refetchWallet,
  } = useQuery({
    queryKey: ['wallet-balance'],
    queryFn: walletService.getWalletBalance,
  });

  const {
    data: transactions = [],
    isLoading: isTxLoading,
    refetch: refetchTxs,
  } = useQuery({
    queryKey: ['wallet-transactions'],
    queryFn: () => walletService.getWalletTransactions(),
  });

  const { data: rewardsSnapshot, refetch: refetchRewards } = useQuery({
    queryKey: ['rewards-snapshot'],
    queryFn: getRewardsSnapshot,
  });

  // Balances
  const walletBalance = walletInfo?.wallet_balance ?? user?.wallet_balance ?? 0;
  const hpBalance = isAuthenticated ? (user?.hp_balance ?? rewardsSnapshot?.balance ?? 0) : (rewardsSnapshot?.balance ?? 0);

  // Top Up Modal State
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpMethod, setTopUpMethod] = useState<'card' | 'bank'>('card');
  const [topUpAmount, setTopUpAmount] = useState<string>('');
  const [isTopUpLoading, setIsTopUpLoading] = useState(false);
  const [virtualAccount, setVirtualAccount] = useState<WalletPageVirtualAccount | null>(null);
  const [copiedAccount, setCopiedAccount] = useState(false);

  // HP Transfer Modal State
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferTarget, setTransferTarget] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [showTransferConfirm, setShowTransferConfirm] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);

  // Transaction Ledger State
  const [activeTab, setActiveTab] = useState<'all' | 'cash' | 'hp'>('all');
  const [selectedTx, setSelectedTx] = useState<CombinedTransaction | null>(null);

  interface WalletPageVirtualAccount {
    account_number: string;
    account_name: string;
    bank_name: string;
    provider?: string;
  }

  interface CombinedTransaction {
    id: string;
    label: string;
    category: 'cash' | 'hp';
    type: 'credit' | 'debit';
    amount: number;
    currency?: string;
    date: string;
    reason?: string;
    reference_type?: string;
    reference_id?: string;
    provider?: string;
  }

  // Combine Cash and HP transactions for the ledger
  const hpTxs: CombinedTransaction[] = (rewardsSnapshot?.transactions ?? []).map((tx) => ({
    id: tx.id,
    label: tx.label,
    category: 'hp',
    type: tx.type === 'redeemed' ? 'debit' : 'credit',
    amount: tx.hp,
    currency: 'HP',
    date: tx.date || new Date().toISOString(),
    reason: tx.type,
  }));

  const cashTxs: CombinedTransaction[] = transactions.map((tx: WalletTransactionItem) => {
    const isCredit = tx.type === 'topup' || tx.type === 'refund' || tx.type === 'bank_transfer' || (tx.amount > 0 && !tx.type.includes('payment') && !tx.type.includes('withdrawal'));
    let label = 'Wallet Transaction';
    if (tx.type === 'topup') label = 'Wallet Top Up';
    else if (tx.type === 'order_payment') label = 'Order Payment';
    else if (tx.type === 'refund') label = 'Order Refund';
    else if (tx.type === 'withdrawal') label = 'Wallet Withdrawal';
    else if (tx.type === 'bank_transfer') label = 'Bank Transfer Top Up';
    else if (tx.reason) label = tx.reason;

    return {
      id: tx.id,
      label,
      category: 'cash',
      type: isCredit ? 'credit' : 'debit',
      amount: Math.abs(tx.amount),
      currency: 'NGN',
      date: tx.created_at,
      reason: tx.reason || tx.type,
      reference_type: tx.reference_type,
      reference_id: tx.reference_id,
      provider: tx.provider,
    };
  });

  const allLedgerTxs: CombinedTransaction[] = [...cashTxs, ...hpTxs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const filteredLedgerTxs = allLedgerTxs.filter((tx) => {
    if (activeTab === 'cash') return tx.category === 'cash';
    if (activeTab === 'hp') return tx.category === 'hp';
    return true;
  });

  // Top Up Actions
  const handleFundCard = async () => {
    const parsedAmount = Number(topUpAmount);
    if (!Number.isFinite(parsedAmount) || parsedAmount < 100) {
      toast.error('Please enter a valid top-up amount (minimum ₦100).');
      return;
    }

    setIsTopUpLoading(true);
    try {
      const res = await walletService.fundViaCard({
        amount: parsedAmount,
        callback_url: typeof window !== 'undefined' ? `${window.location.origin}/wallet` : undefined,
      });

      if (res.authorization_url) {
        toast.info('Redirecting to payment gateway...');
        window.location.href = res.authorization_url;
      } else {
        toast.success('Wallet top up successful!');
        if (user) {
          setUser({ ...user, wallet_balance: walletBalance + parsedAmount });
        }
        refetchWallet();
        refetchTxs();
        setShowTopUpModal(false);
        setTopUpAmount('');
      }
    } catch (err: unknown) {
      const errMsg = (err as { response?: { data?: { message?: string; error?: string } } })?.response?.data?.message ||
        (err as { response?: { data?: { message?: string; error?: string } } })?.response?.data?.error;

      if (errMsg?.includes('not configured')) {
        toast.error('Card payments are not configured on this server.');
      } else if (errMsg?.includes('unavailable')) {
        toast.error('Payment gateway unavailable. Please try again later.');
      } else {
        toast.error(errMsg || 'Top up failed. Please try again.');
      }
    } finally {
      setIsTopUpLoading(false);
    }
  };

  const handleRequestVirtualAccount = async () => {
    setIsTopUpLoading(true);
    try {
      const res = await walletService.requestVirtualAccount();
      if (res.account_number && res.bank_name) {
        setVirtualAccount({
          account_number: res.account_number,
          account_name: res.account_name || user?.full_name || 'Holy Grills Account',
          bank_name: res.bank_name,
          provider: res.provider,
        });
        toast.success('Virtual bank account provisioned successfully!');
      } else if (walletInfo?.virtual_account) {
        setVirtualAccount(walletInfo.virtual_account);
      } else {
        toast.error('Could not provision virtual account. Please try card funding.');
      }
    } catch {
      toast.error('Failed to request bank transfer details.');
    } finally {
      setIsTopUpLoading(false);
    }
  };

  const copyAccountNumber = () => {
    const acc = virtualAccount?.account_number || walletInfo?.virtual_account?.account_number;
    if (acc) {
      navigator.clipboard.writeText(acc);
      setCopiedAccount(true);
      toast.success('Account number copied to clipboard!');
      setTimeout(() => setCopiedAccount(false), 2000);
    }
  };

  // HP Transfer Actions
  const handleInitiateTransfer = () => {
    const amount = Number(transferAmount);
    if (!transferTarget.trim()) {
      toast.error('User not found with provided phone/email.');
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('Please enter a valid amount of HP to transfer.');
      return;
    }
    if (amount > hpBalance) {
      toast.error('Insufficient HP balance for transfer.');
      return;
    }
    setShowTransferConfirm(true);
  };

  const handleExecuteTransfer = async () => {
    const amount = Number(transferAmount);
    setIsTransferring(true);
    try {
      await transferHpApi(transferTarget.trim(), amount);
      toast.success(`Successfully transferred ${amount} HP to ${transferTarget}!`);
      if (user) {
        setUser({ ...user, hp_balance: user.hp_balance - amount });
      }
      setShowTransferConfirm(false);
      setShowTransferModal(false);
      setTransferTarget('');
      setTransferAmount('');
      refetchRewards();
      refetchTxs();
    } catch (err: unknown) {
      const errMsg = (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.error ||
        (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.message;

      if (errMsg?.toLowerCase().includes('not found')) {
        toast.error('User not found with provided phone/email.');
      } else {
        toast.error('Insufficient HP balance for transfer.');
      }
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <main className="flex-1 pb-12 pt-4 md:pt-24">
      <div className="container mx-auto max-w-4xl space-y-6 px-4">
        {/* Header & Balance Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Cash Wallet Card */}
          <section className="relative overflow-hidden rounded-[2rem] bg-gradient-dark p-6 text-brand-brown-foreground shadow-lg md:p-8">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] opacity-80">Cash Wallet</span>
              <Wallet2 className="h-6 w-6 text-primary" />
            </div>
            <h1 className="mt-3 font-display text-4xl font-bold">
              {isWalletLoading ? '...' : formatNaira(walletBalance)}
            </h1>
            <p className="mt-2 text-xs opacity-80">Use your wallet balance for fast one-click checkout.</p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowTopUpModal(true);
                  if (walletInfo?.virtual_account) {
                    setVirtualAccount(walletInfo.virtual_account);
                  }
                }}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-all hover:opacity-90"
              >
                <Plus size={16} /> Top Up Wallet
              </button>
            </div>
          </section>

          {/* HP Points Card */}
          <section className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-sm md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">HP Points</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                  <Flame size={14} /> Rewards
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-display text-4xl font-black text-foreground">{hpBalance}</span>
                <span className="text-sm font-semibold text-muted-foreground">HP</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Earn HP on every order and transfer or redeem for food perks.
              </p>
            </div>
            <div className="mt-6">
              <button
                onClick={() => setShowTransferModal(true)}
                disabled={hpBalance <= 0}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-secondary/80 px-5 py-2.5 text-sm font-bold text-foreground transition-all hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={15} /> Transfer HP
              </button>
            </div>
          </section>
        </div>

        {/* Transaction History Ledger */}
        <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">Transaction History</h2>
              <p className="text-xs text-muted-foreground">Ledger of all cash wallet activity and HP points transfers</p>
            </div>
            {/* Filter Tabs */}
            <div className="flex rounded-full bg-secondary p-1">
              {(['all', 'cash', 'hp'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition-all ${
                    activeTab === tab
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab === 'all' ? 'All' : tab === 'cash' ? 'Cash Wallet' : 'HP Points'}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {isTxLoading ? (
              // Skeleton rows
              <div className="space-y-3 py-4">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="h-16 animate-pulse rounded-2xl bg-secondary/40" />
                ))}
              </div>
            ) : filteredLedgerTxs.length === 0 ? (
              <div className="py-12 text-center">
                <Receipt size={36} className="mx-auto text-muted-foreground opacity-50" />
                <p className="mt-2 text-sm font-medium text-foreground">No transactions found</p>
                <p className="text-xs text-muted-foreground">
                  {activeTab === 'cash'
                    ? 'Top up your wallet to start spending.'
                    : activeTab === 'hp'
                    ? 'Earn HP points on orders to see your rewards history.'
                    : 'Your transaction history will appear here.'}
                </p>
              </div>
            ) : (
              filteredLedgerTxs.map((tx) => (
                <div
                  key={tx.id}
                  onClick={() => setSelectedTx(tx)}
                  className="flex items-center gap-3 rounded-2xl bg-secondary/30 p-3.5 transition-colors hover:bg-secondary/60 cursor-pointer"
                >
                  <div
                    className={`rounded-full p-2.5 ${
                      tx.type === 'credit'
                        ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                    }`}
                  >
                    {tx.type === 'credit' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{tx.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.date).toLocaleDateString('en-NG', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-bold ${
                        tx.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-foreground'
                      }`}
                    >
                      {tx.type === 'credit' ? '+' : '-'}
                      {tx.category === 'cash' ? formatNaira(tx.amount) : `${tx.amount} HP`}
                    </p>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                      {tx.category === 'cash' ? 'Cash' : 'HP'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Top Up Wallet Modal */}
      {showTopUpModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setShowTopUpModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-card p-6 shadow-xl space-y-5 border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Wallet2 className="text-primary" size={20} />
                <h3 className="font-display text-xl font-bold text-foreground">Top Up Cash Wallet</h3>
              </div>
              <button
                onClick={() => setShowTopUpModal(false)}
                className="rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            {/* Method Toggle */}
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-secondary p-1">
              <button
                onClick={() => setTopUpMethod('card')}
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all ${
                  topUpMethod === 'card'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <CreditCard size={15} /> Card Payment
              </button>
              <button
                onClick={() => {
                  setTopUpMethod('bank');
                  if (!virtualAccount && !walletInfo?.virtual_account) {
                    handleRequestVirtualAccount();
                  }
                }}
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all ${
                  topUpMethod === 'bank'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Building2 size={15} /> Bank Transfer
              </button>
            </div>

            {topUpMethod === 'card' ? (
              <div className="space-y-4 pt-1">
                <div>
                  <label className="text-xs font-semibold text-foreground">Select Preset Amount</label>
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {PRESET_AMOUNTS.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setTopUpAmount(amt.toString())}
                        className={`rounded-xl border py-2.5 text-xs font-bold transition-all ${
                          topUpAmount === amt.toString()
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-background text-foreground hover:bg-secondary'
                        }`}
                      >
                        {formatNaira(amt)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground">Custom Amount (NGN)</label>
                  <input
                    type="number"
                    min={100}
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    placeholder="Enter amount (min ₦100)"
                    className="mt-1 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
                  />
                </div>

                <button
                  onClick={handleFundCard}
                  disabled={isTopUpLoading || !topUpAmount}
                  className="w-full rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground shadow-md transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isTopUpLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    `Pay ${topUpAmount ? formatNaira(Number(topUpAmount)) : ''} via Paystack`
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4 pt-1">
                {isTopUpLoading ? (
                  <div className="py-8 text-center space-y-2">
                    <Loader2 size={24} className="animate-spin mx-auto text-primary" />
                    <p className="text-xs text-muted-foreground">Provisioning dedicated virtual account...</p>
                  </div>
                ) : (virtualAccount || walletInfo?.virtual_account) ? (
                  <div className="rounded-2xl border border-border bg-secondary/30 p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <span className="text-xs font-semibold text-muted-foreground">Bank Name</span>
                      <span className="text-sm font-bold text-foreground">
                        {virtualAccount?.bank_name || walletInfo?.virtual_account?.bank_name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <span className="text-xs font-semibold text-muted-foreground">Account Number</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-bold text-primary">
                          {virtualAccount?.account_number || walletInfo?.virtual_account?.account_number}
                        </span>
                        <button
                          onClick={copyAccountNumber}
                          className="rounded-lg bg-background p-1.5 text-muted-foreground hover:text-foreground border border-border"
                        >
                          {copiedAccount ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">Account Name</span>
                      <span className="text-xs font-medium text-foreground">
                        {virtualAccount?.account_name || walletInfo?.virtual_account?.account_name}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Building2 size={32} className="mx-auto text-muted-foreground mb-2" />
                    <p className="text-xs text-muted-foreground mb-3">
                      Generate a Dedicated Virtual Account for instant bank transfer top-ups.
                    </p>
                    <button
                      onClick={handleRequestVirtualAccount}
                      className="rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground"
                    >
                      Generate Account Details
                    </button>
                  </div>
                )}
                <p className="text-[11px] text-muted-foreground text-center">
                  Transfers to this dedicated account automatically credit your wallet balance instantly.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* HP Transfer Modal */}
      {showTransferModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => {
            setShowTransferModal(false);
            setShowTransferConfirm(false);
          }}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-card p-6 shadow-xl space-y-4 border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Flame className="text-primary" size={20} />
                <h3 className="font-display text-xl font-bold text-foreground">Transfer HP to Friend</h3>
              </div>
              <button
                onClick={() => {
                  setShowTransferModal(false);
                  setShowTransferConfirm(false);
                }}
                className="rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            {!showTransferConfirm ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-foreground">Recipient Email or Phone Number</label>
                  <input
                    type="text"
                    value={transferTarget}
                    onChange={(e) => setTransferTarget(e.target.value)}
                    placeholder="e.g. friend@example.com or 08012345678"
                    className="mt-1 w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-foreground">Amount (HP)</label>
                    <span className="text-[11px] text-muted-foreground">Available: {hpBalance} HP</span>
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={hpBalance}
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder="e.g. 50"
                    className="mt-1 w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
                  />
                </div>
                <button
                  onClick={handleInitiateTransfer}
                  disabled={hpBalance <= 0 || !transferTarget || !transferAmount}
                  className="w-full rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground shadow-md transition-all hover:opacity-90 disabled:opacity-50"
                >
                  Continue to Transfer
                </button>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <div className="rounded-2xl bg-secondary/50 p-4 space-y-2 text-center">
                  <Sparkles size={24} className="mx-auto text-primary" />
                  <p className="text-sm font-bold text-foreground">Confirm HP Transfer</p>
                  <p className="text-xs text-muted-foreground">
                    Transfer <span className="font-bold text-primary">{transferAmount} HP</span> to{' '}
                    <span className="font-bold text-foreground">{transferTarget}</span>?
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowTransferConfirm(false)}
                    className="flex-1 rounded-full border border-border bg-background py-2.5 text-xs font-bold text-foreground hover:bg-secondary"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleExecuteTransfer}
                    disabled={isTransferring}
                    className="flex-1 rounded-full bg-primary py-2.5 text-xs font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isTransferring ? <Loader2 size={16} className="animate-spin" /> : 'Confirm Transfer'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transaction Detail Receipt Modal */}
      {selectedTx && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setSelectedTx(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-card p-6 shadow-xl space-y-4 border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display text-lg font-bold text-foreground">Transaction Receipt</h3>
              <button
                onClick={() => setSelectedTx(null)}
                className="rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>
            <div className="text-center py-2 space-y-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Amount</p>
              <p
                className={`text-3xl font-black ${
                  selectedTx.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-foreground'
                }`}
              >
                {selectedTx.type === 'credit' ? '+' : '-'}
                {selectedTx.category === 'cash' ? formatNaira(selectedTx.amount) : `${selectedTx.amount} HP`}
              </p>
            </div>
            <div className="rounded-2xl bg-secondary/30 p-4 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Description</span>
                <span className="font-semibold text-foreground text-right">{selectedTx.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="font-semibold text-foreground capitalize">{selectedTx.type} ({selectedTx.category})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-semibold text-foreground">
                  {new Date(selectedTx.date).toLocaleString('en-NG')}
                </span>
              </div>
              {selectedTx.reference_id && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reference ID</span>
                  <span className="font-mono text-[11px] text-foreground">{selectedTx.reference_id}</span>
                </div>
              )}
            </div>
            <button
              onClick={() => setSelectedTx(null)}
              className="w-full rounded-full bg-secondary py-2.5 text-xs font-bold text-foreground hover:bg-border"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default WalletPage;
