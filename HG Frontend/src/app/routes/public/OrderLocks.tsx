'use client';

import { useEffect, useMemo, useState } from 'react';
import { Calendar, Flame, Lock, Users, Plus, Trash2 } from 'lucide-react';
import apiClient from '@/lib/api/client';
import { toast } from 'sonner';

interface Squad {
  id: string;
  name: string;
  campus_id?: string;
  roster?: Array<{ id: string; email: string; display_name?: string }>;
}

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

  const [squads, setSquads] = useState<Squad[]>([]);
  const [newSquadName, setNewSquadName] = useState('');
  const [memberEmailInput, setMemberEmailInput] = useState<{ [squadId: string]: string }>({});

  const fetchSquads = async () => {
    try {
      const res = await apiClient.get('/squads');
      const list = res.data?.data ?? res.data ?? [];
      setSquads(Array.isArray(list) ? list : []);
    } catch {
      setSquads([]);
    }
  };

  useEffect(() => {
    fetchSquads();
  }, []);

  const createSquad = async () => {
    if (!newSquadName.trim()) return;
    try {
      await apiClient.post('/squads', { name: newSquadName.trim() });
      toast.success('Squad created!');
      setNewSquadName('');
      fetchSquads();
    } catch {
      toast.error('Failed to create squad.');
    }
  };

  const addSquadMember = async (squadId: string) => {
    const email = memberEmailInput[squadId]?.trim();
    if (!email) return;
    try {
      await apiClient.post(`/squads/${squadId}/members`, { email });
      toast.success('Member added!');
      setMemberEmailInput((prev) => ({ ...prev, [squadId]: '' }));
      fetchSquads();
    } catch {
      toast.error('Failed to add member.');
    }
  };

  const removeSquadMember = async (squadId: string, memberId: string) => {
    try {
      await apiClient.delete(`/squads/${squadId}/members/${memberId}`);
      toast.success('Member removed');
      fetchSquads();
    } catch {
      toast.error('Failed to remove member');
    }
  };

  const createLock = () => {
    if (!form.date || activeLock) return;
    setLocks((prev) => [...prev, { id: `lock-${Date.now()}`, date: form.date, rewardKind: form.rewardKind, amount: form.amount, status: 'active' }]);
    setForm({ date: '', rewardKind: 'discount', amount: 10 });
  };

  return (
    <main className="flex-1 pb-12 pt-4 md:pt-24">
      <div className="container mx-auto max-w-3xl space-y-5 px-4">
        <section className="rounded-[2rem] border border-border bg-card p-5">
          <h1 className="font-display text-3xl font-bold text-foreground">Squads & Order Locks</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage persistent squads for split HP & discounts, and reserve future order lock rewards.</p>
        </section>

        {/* Squads Management */}
        <section className="rounded-[2rem] border border-border bg-card p-5 space-y-4">
          <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2"><Users size={18} className="text-primary" /> Persistent Squads</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={newSquadName}
              onChange={(e) => setNewSquadName(e.target.value)}
              placeholder="New Squad Name (e.g. Coders Crew)"
              className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
            <button onClick={createSquad} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground inline-flex items-center gap-1"><Plus size={14} /> Create</button>
          </div>

          <div className="space-y-3 pt-2">
            {squads.map((squad) => (
              <div key={squad.id} className="rounded-2xl border border-border bg-secondary/30 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground text-sm">{squad.name}</span>
                  <span className="text-xs text-muted-foreground">{squad.roster?.length ?? 0} members</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={memberEmailInput[squad.id] || ''}
                    onChange={(e) => setMemberEmailInput((prev) => ({ ...prev, [squad.id]: e.target.value }))}
                    placeholder="Member email"
                    className="flex-1 rounded-lg border border-border bg-background px-2.5 py-1 text-xs"
                  />
                  <button onClick={() => addSquadMember(squad.id)} className="rounded-lg bg-secondary px-3 py-1 text-xs font-semibold text-foreground">Add</button>
                </div>
                {squad.roster && squad.roster.length > 0 ? (
                  <div className="space-y-1 pt-1">
                    {squad.roster.map((m) => (
                      <div key={m.id} className="flex items-center justify-between text-xs text-muted-foreground bg-background/50 rounded-lg px-2.5 py-1">
                        <span>{m.display_name || m.email}</span>
                        <button onClick={() => removeSquadMember(squad.id, m.id)} className="text-destructive hover:opacity-80"><Trash2 size={12} /></button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
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
