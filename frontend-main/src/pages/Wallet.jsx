import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight, CreditCard, Building2, X, Copy, Check, Flame, Loader2, Send } from 'lucide-react';
import { mockApi } from '@/lib/mockApi';
import { useHolyGrill } from '@/lib/HolyGrillContext';
import { formatNaira, timeAgo } from '@/lib/hgUtils';
import { walletMinCardTopup, walletMinWithdrawal, walletTopupMin, walletTopupHp, hpTransferMinAmount, hpTransferMinOrders } from '@/lib/appConfig';
import { toast } from '@/components/ui/use-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import HpTransferModal from '@/components/HpTransferModal';

export default function Wallet() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { wallet, refreshWallet, refreshHp, hpBalance } = useHolyGrill();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFund, setShowFund] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const hpTransferMin = hpTransferMinAmount();
  const insufficientHp = (hpBalance?.active || 0) < hpTransferMin;
  const [fundMethod, setFundMethod] = useState('card');
  const [fundAmount, setFundAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [bankWaiting, setBankWaiting] = useState(false);
  const [copied, setCopied] = useState(false);
  const pollRef = useRef(null);

  // Load transactions + handle Paystack redirect-back (?reference=).
  useEffect(() => {
    const load = async () => {
      const reference = searchParams.get('reference');
      if (reference) {
        setVerifying(true);
        try { await mockApi.wallet.verify(reference); } catch (e) { /* webhook may confirm separately */ }
        try {
          await refreshWallet();
          await refreshHp();
          toast({ title: '✅ Payment confirmed', description: 'Your wallet has been funded.' });
        } catch (e) { /* ignore */ }
        setVerifying(false);
        searchParams.delete('reference');
        searchParams.delete('trxref');
        searchParams.delete('status');
        setSearchParams(searchParams, { replace: true });
      }
      try {
        const txns = await mockApi.wallet.getTransactions({ limit: 30 });
        setTransactions(txns);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Bank-transfer funding: poll the wallet until the balance moves (webhook
  // confirmation lands server-side), up to ~2 minutes.
  const startBankPoll = (startingBalance) => {
    setBankWaiting(true);
    let attempts = 0;
    pollRef.current = setInterval(async () => {
      attempts += 1;
      try {
        const w = await mockApi.wallet.get();
        if ((w.balance || 0) > (startingBalance || 0)) {
          clearInterval(pollRef.current);
          pollRef.current = null;
          setBankWaiting(false);
          await refreshWallet();
          await refreshHp();
          const txns = await mockApi.wallet.getTransactions({ limit: 30 });
          setTransactions(txns);
          toast({ title: '✅ Transfer received', description: 'Your wallet has been funded.' });
          setShowFund(false);
          setFundAmount('');
        }
      } catch { /* keep polling */ }
      if (attempts > 24) { clearInterval(pollRef.current); pollRef.current = null; setBankWaiting(false); }
    }, 5000);
  };

  const handleFund = async () => {
    const amount = parseFloat(fundAmount);
    const minTopup = walletMinCardTopup();
    if (!amount || amount < minTopup) { alert(`Minimum top-up is ₦${minTopup.toLocaleString()}`); return; }
    setProcessing(true);
    try {
      if (fundMethod === 'card') {
        const result = await mockApi.wallet.fundCard({ amount, callback_url: `${window.location.origin}/wallet` });
        // Redirect to Paystack checkout — Paystack redirects back here with ?reference=
        if (result.authorization_url) {
          window.location.href = result.authorization_url;
          return;
        }
        toast({ title: 'Payment initialized', description: result.reference || '' });
      } else {
        await mockApi.wallet.fundBank({ amount });
        startBankPoll(wallet?.balance || 0);
      }
    } catch (e) { toast({ title: 'Funding failed', description: e.message, variant: 'destructive' }); }
    setProcessing(false);
  };

  const copyAccountNumber = () => {
    navigator.clipboard?.writeText(wallet?.virtual_account?.account_number || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading || verifying) return <LoadingSpinner label={verifying ? 'Confirming payment...' : 'Loading wallet...'} />;

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="font-heading font-extrabold text-2xl text-cocoa-800">Wallet</h1>

      {/* Balance Card */}
      <div className="rounded-2xl bg-gradient-to-br from-green-600 to-green-800 p-5 text-white relative overflow-hidden">
        <div className="absolute -right-4 -top-4 text-6xl opacity-20">💰</div>
        <div className="relative">
          <div className="text-xs text-green-200 font-medium uppercase tracking-wide">Wallet Balance</div>
          <div className="font-heading font-extrabold text-3xl mt-1">{formatNaira(wallet?.balance || 0)}</div>
          <button
            onClick={() => setShowFund(true)}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-full bg-white text-green-700 font-bold text-sm shadow-md"
          >
            <ArrowDownLeft className="w-4 h-4" /> Fund Wallet
          </button>
        </div>
      </div>

      {/* HP Transfer — available to ALL authenticated users */}
      <div className="rounded-2xl bg-gradient-to-br from-cocoa-800 to-cocoa-900 p-5 text-white relative overflow-hidden">
        <div className="absolute -right-4 -top-4 text-6xl opacity-15">🔥</div>
        <div className="relative">
          <div className="text-xs text-cocoa-300 font-medium uppercase tracking-wide">Active Holy Points</div>
          <div className="font-heading font-extrabold text-3xl mt-1">{hpBalance?.active || 0} <span className="text-base font-normal text-cocoa-300">HP</span></div>
          <p className="text-[11px] text-cocoa-300 mt-1">Send HP to a fellow student. Min {hpTransferMin} HP, from your active balance.</p>
          <button
            onClick={() => !insufficientHp && setShowTransfer(true)}
            disabled={insufficientHp}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-full flame-gradient text-white font-bold text-sm shadow-md mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" /> {insufficientHp ? 'Insufficient HP to transfer' : 'Send HP'}
          </button>
        </div>
      </div>

      {/* Virtual Account */}
      {wallet?.virtual_account && (
        <div className="rounded-2xl bg-white border border-cocoa-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-4 h-4 text-cocoa-400" />
            <h3 className="font-bold text-sm text-cocoa-800">Virtual Account</h3>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-cocoa-50">
            <div>
              <div className="font-heading font-bold text-lg text-cocoa-800">{wallet.virtual_account.account_number}</div>
              <div className="text-xs text-cocoa-400">{wallet.virtual_account.bank_name} · {wallet.virtual_account.account_name}</div>
            </div>
            <button onClick={copyAccountNumber} className="p-2 rounded-full bg-white border border-cocoa-200">
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-cocoa-400" />}
            </button>
          </div>
          <p className="text-xs text-cocoa-400 mt-2">Transfer to this account to fund your wallet instantly. Top-ups of ₦{walletTopupMin().toLocaleString()}+ earn {walletTopupHp()} HP!</p>
        </div>
      )}

      {/* Transactions */}
      <div>
        <h3 className="font-bold text-sm text-cocoa-800 mb-2">Transaction History</h3>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-sm text-cocoa-400">No transactions yet</div>
        ) : (
          <div className="space-y-2">
            {transactions.map(txn => (
              <div key={txn.id} className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-cocoa-100">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${txn.type === 'credit' ? 'bg-green-50' : 'bg-red-50'}`}>
                  {txn.type === 'credit' ? <ArrowDownLeft className="w-5 h-5 text-green-600" /> : <ArrowUpRight className="w-5 h-5 text-red-500" />}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm text-cocoa-700">{txn.reason}</div>
                  <div className="text-xs text-cocoa-400">{timeAgo(txn.created_at)}</div>
                </div>
                <div className={`font-bold text-sm ${txn.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                  {txn.type === 'credit' ? '+' : '-'}{formatNaira(txn.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fund Modal */}
      {showFund && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4" onClick={() => !bankWaiting && !processing && setShowFund(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm animate-slide-up" onClick={e => e.stopPropagation()}>
            {bankWaiting ? (
              <div className="text-center py-4">
                <Loader2 className="w-10 h-10 text-green-600 mx-auto mb-3 animate-spin" />
                <h3 className="font-bold text-cocoa-800 mb-1">Waiting for transfer</h3>
                <p className="text-xs text-cocoa-400 mb-3">Send the exact amount to your virtual account. We'll confirm automatically once it lands.</p>
                <div className="p-3 rounded-xl bg-cocoa-50 mb-3">
                  <div className="font-heading font-bold text-xl text-cocoa-800">{wallet?.virtual_account?.account_number || '—'}</div>
                  <div className="text-xs text-cocoa-400">{wallet?.virtual_account?.bank_name || ''}</div>
                </div>
                <p className="text-xs text-green-600 font-semibold animate-pulse">⏳ Listening for confirmation...</p>
                <button onClick={() => { if (pollRef.current) clearInterval(pollRef.current); setBankWaiting(false); }} className="mt-3 text-xs text-cocoa-400 font-semibold">Cancel</button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-heading font-bold text-lg text-cocoa-800">Fund Wallet</h3>
                  <button onClick={() => setShowFund(false)}><X className="w-5 h-5 text-cocoa-400" /></button>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setFundMethod('card')} className={`p-3 rounded-xl border-2 text-center ${fundMethod === 'card' ? 'border-flame-400 bg-flame-50' : 'border-cocoa-200'}`}>
                      <CreditCard className="w-5 h-5 mx-auto mb-1 text-cocoa-600" />
                      <span className="text-xs font-bold">Card (Paystack)</span>
                    </button>
                    <button onClick={() => setFundMethod('bank')} className={`p-3 rounded-xl border-2 text-center ${fundMethod === 'bank' ? 'border-flame-400 bg-flame-50' : 'border-cocoa-200'}`}>
                      <Building2 className="w-5 h-5 mx-auto mb-1 text-cocoa-600" />
                      <span className="text-xs font-bold">Bank Transfer</span>
                    </button>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-cocoa-500 uppercase">Amount (min ₦{walletMinCardTopup().toLocaleString()})</label>
                    <input type="number" value={fundAmount} onChange={(e) => setFundAmount(e.target.value)} placeholder="₦0" className="w-full mt-1 p-3 rounded-xl border border-cocoa-200 text-lg font-bold focus:outline-none focus:border-flame-400" />
                    <div className="flex gap-2 mt-2">
                      {[1000, 3000, 5000, 10000].map(amt => (
                        <button key={amt} onClick={() => setFundAmount(amt.toString())} className="flex-1 py-1.5 rounded-lg bg-cocoa-50 text-xs font-bold text-cocoa-600">₦{amt.toLocaleString()}</button>
                      ))}
                    </div>
                    {parseFloat(fundAmount) >= walletTopupMin() && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-flame-600 font-semibold"><Flame className="w-3 h-3" /> You'll earn {walletTopupHp()} HP for topping up ₦{walletTopupMin().toLocaleString()}+!</div>
                    )}
                  </div>
                  <button onClick={handleFund} disabled={processing || !fundAmount} className="w-full py-3 rounded-full flame-gradient text-white font-bold disabled:opacity-50">
                    {processing ? 'Processing...' : `Fund ${fundAmount ? formatNaira(parseFloat(fundAmount)) : ''}`}
                  </button>
                  <p className="text-[10px] text-cocoa-400 text-center">{fundMethod === 'card' ? "You'll be redirected to Paystack to pay securely." : "We'll confirm your transfer automatically via webhook."}</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <HpTransferModal open={showTransfer} onClose={() => setShowTransfer(false)} />
    </div>
  );
}