'use client';

import { useMemo, useState } from 'react';
import { Calendar, Flame, Lock } from 'lucide-react';

interface OrderLockItem {
  id: string;
  date: string;
  rewardKind: 'discount' | 'hp';
  amount: number;
  status: 'active' | 'consumed' | 'expired';
}

interface OrderLockFormState {
  date: string;
  rewardKind: 'discount' | 'hp';
  amount: number;
}

const OrderLocksPage = () => {
  const [locks, setLocks] = useState<OrderLockItem[]>([]);
  const [form, setForm] = useState<OrderLockFormState>({ date: '', rewardKind: 'discount', amount: 10 });

  const activeLock = useMemo(() => locks.find((lock) => lock.status === 'active'), [locks]);

  const createLock = () => {
    if (!form.date || activeLock) return;
    setLocks((prev) => [...prev, { id: `lock-${Date.now()}`, date: form.date, rewardKind: form.rewardKind, amount: form.amount, status: 'active' }]);
    setForm({ date: '', rewardKind: 'discount', amount: 10 });
  };

  return (
    <main className="flex-1 pb-12 pt-4 md:pt-24">
      <div className="container mx-auto max-w-3xl space-y-5 px-4">
        <section className="rounded-[2rem] border border-border bg-card p-5">
          <h1 className="font-display text-3xl font-bold text-foreground">Order Locks</h1>
          <p className="mt-1 text-sm text-muted-foreground">Reserve a future order reward and redeem it automatically on that date.</p>
        </section>

        <section className="rounded-[2rem] border border-border bg-card p-5">
          <h2 className="font-display text-xl font-bold text-foreground">Create lock</h2>
          <div className="mt-3 space-y-2">
            <input type="date" value={form.date} onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" />
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setForm((prev) => ({ ...prev, rewardKind: 'discount', amount: 10 }))} className={`rounded-xl border px-3 py-2 text-sm ${form.rewardKind === 'discount' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}>Discount %</button>
              <button onClick={() => setForm((prev) => ({ ...prev, rewardKind: 'hp', amount: 50 }))} className={`rounded-xl border px-3 py-2 text-sm ${form.rewardKind === 'hp' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}>HP Reward</button>
            </div>
            <button onClick={createLock} disabled={Boolean(activeLock)} className="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">{activeLock ? 'Active lock already exists' : 'Create lock'}</button>
          </div>
        </section>

        <section className="space-y-2">
          {locks.length === 0 ? <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">No order locks yet.</div> : locks.map((lock) => (
            <div key={lock.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="inline-flex items-center gap-1 text-sm font-semibold text-foreground"><Lock size={14} className="text-primary" /> {lock.status}</p>
                <span className="text-xs text-muted-foreground inline-flex items-center gap-1"><Calendar size={12} /> {new Date(lock.date).toLocaleDateString()}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground inline-flex items-center gap-1"><Flame size={13} className="text-primary" /> {lock.rewardKind === 'discount' ? `${lock.amount}% discount` : `${lock.amount} HP reward`}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
};

export default OrderLocksPage;
