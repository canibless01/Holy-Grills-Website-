'use client';

import { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Flame, Wallet2 } from 'lucide-react';
import { WALLET_TRANSACTIONS } from '@/services/mocks/platform';
import { useAuthStore } from '@/stores/authStore';

function formatNaira(value: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value);
}

const WalletPage = () => {
  const { user, setUser } = useAuthStore();
  const [amount, setAmount] = useState('');

  const fundWallet = () => {
    if (!user) return;
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed < 1000) return;
    setUser({ ...user, wallet_balance: user.wallet_balance + parsed });
    setAmount('');
  };

  return (
    <main className="flex-1 pb-12 pt-4 md:pt-24">
      <div className="container mx-auto max-w-3xl space-y-6 px-4">
        <section className="rounded-[2rem] bg-gradient-dark p-6 text-brand-brown-foreground">
          <p className="text-xs uppercase tracking-[0.2em] opacity-80">Wallet</p>
          <h1 className="mt-2 font-display text-3xl font-bold">{formatNaira(user?.wallet_balance ?? 0)}</h1>
          <p className="mt-1 text-sm opacity-80">Fund wallet and use it across checkout, rewards, and marketplace.</p>
          <div className="mt-4 flex gap-2">
            <input type="number" min={1000} value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Amount (min ₦1,000)" className="w-full rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white placeholder:text-white/70 outline-none" />
            <button onClick={fundWallet} disabled={!user} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-foreground disabled:opacity-50">Fund</button>
          </div>
        </section>

        <section className="rounded-[2rem] border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-foreground">HP transfer</h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary"><Flame size={12} /> {user?.hp_balance ?? 0} HP</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Transfer HP to other users is available from this wallet module in the source implementation.</p>
        </section>

        <section className="rounded-[2rem] border border-border bg-card p-5">
          <h2 className="font-display text-xl font-bold text-foreground">Transactions</h2>
          <div className="mt-4 space-y-2">
            {WALLET_TRANSACTIONS.map((transaction) => (
              <div key={transaction.id} className="flex items-center gap-3 rounded-2xl bg-secondary/50 p-3">
                <div className={`rounded-full p-2 ${transaction.type === 'credit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {transaction.type === 'credit' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{transaction.label}</p>
                  <p className="text-xs text-muted-foreground">{transaction.date}</p>
                </div>
                <p className={`text-sm font-semibold ${transaction.type === 'credit' ? 'text-green-700' : 'text-red-700'}`}>{transaction.type === 'credit' ? '+' : ''}{formatNaira(transaction.amount)}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};

export default WalletPage;
