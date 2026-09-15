import React, { useState, useEffect } from 'react';
import { Search, Flame, Wallet, Ban, Check, X, Package, Plus, Users as UsersIcon, Send } from 'lucide-react';
import { liveApi as mockApi } from '@/lib/liveApi';
import { formatNaira, timeAgo, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/hgUtils';
import { TIERS } from '@/lib/mockData';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toast } from '@/components/ui/use-toast';
import { Modal, Field, TextInput, Pill } from './AdminShared';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [updating, setUpdating] = useState(null);
  const [selected, setSelected] = useState(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkMode, setBulkMode] = useState(false);

  useEffect(() => { load(); }, [search, roleFilter]);

  const load = async () => {
    setLoading(true);
    setUsers(await mockApi.admin.getUsers({ q: search, role: roleFilter }));
    setLoading(false);
  };

  const handleRole = async (id, role) => {
    setUpdating(id);
    await mockApi.admin.updateRole(id, { role });
    await load();
    setUpdating(null);
  };

  const handleToggle = async (id, currentlyActive) => {
    setUpdating(id);
    if (currentlyActive) await mockApi.admin.deactivateUser(id);
    else await mockApi.admin.activateUser(id);
    await load();
    setUpdating(null);
  };

  const toggleSelect = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cocoa-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cocoa-200 text-sm focus:outline-none focus:border-flame-400" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-cocoa-200 text-sm font-semibold text-cocoa-700 focus:outline-none focus:border-flame-400">
          <option value="">All Roles</option>
          <option value="student">Student</option>
          <option value="kitchen">Kitchen</option>
          <option value="rider">Rider</option>
          <option value="admin">Admin</option>
          <option value="super_admin">Super Admin</option>
        </select>
        <button onClick={() => { setBulkMode(!bulkMode); setSelectedIds(new Set()); }} className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold ${bulkMode ? 'bg-flame-600 text-white' : 'bg-white border border-cocoa-200 text-cocoa-600'}`}>
          <UsersIcon className="w-4 h-4" /> Bulk
        </button>
        {bulkMode && selectedIds.size > 0 && (
          <button onClick={() => setBulkOpen(true)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-flame-600 text-white text-sm font-bold">
            <Send className="w-4 h-4" /> Grant HP ({selectedIds.size})
          </button>
        )}
      </div>

      {loading ? <LoadingSpinner label="Loading users..." /> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {users.map((u) => {
            const tier = TIERS.find((t) => t.id === u.current_tier_id);
            return (
              <div key={u.id} className={`rounded-2xl bg-white border p-4 ${selectedIds.has(u.id) ? 'border-flame-400 ring-2 ring-flame-200' : 'border-cocoa-100'}`}>
                <div className="flex items-start gap-2">
                  {bulkMode && (
                    <button onClick={() => toggleSelect(u.id)} className={`mt-1 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${selectedIds.has(u.id) ? 'bg-flame-600 border-flame-600' : 'border-cocoa-300'}`}>
                      {selectedIds.has(u.id) && <Check className="w-3 h-3 text-white" />}
                    </button>
                  )}
                  <button onClick={() => !bulkMode && setSelected(u)} className="w-full text-left flex-1">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${u.is_active ? 'flame-gradient text-white' : 'bg-cocoa-100 text-cocoa-400'}`}>{(u.full_name || '?').charAt(0)}</div>
                      <div className="flex-1 min-0">
                        <div className="font-bold text-sm text-cocoa-800 truncate">{u.full_name}</div>
                        <div className="text-xs text-cocoa-400 truncate">{u.phone}</div>
                      </div>
                    </div>
                  </button>
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-600' : u.role === 'kitchen' ? 'bg-amber-100 text-amber-600' : u.role === 'rider' ? 'bg-blue-100 text-blue-600' : 'bg-cocoa-100 text-cocoa-600'}`}>{u.role}</span>
                  {tier && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-flame-50 text-flame-600">{tier.icon} {tier.name}</span>}
                  {!u.is_active && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">INACTIVE</span>}
                </div>
                <div className="flex items-center gap-3 mt-3 text-xs">
                  <span className="flex items-center gap-0.5 text-flame-600 font-bold"><Flame className="w-3 h-3" />{u.hp_balance}</span>
                  <span className="flex items-center gap-0.5 text-green-600 font-bold"><Wallet className="w-3 h-3" />{formatNaira(u.wallet_balance)}</span>
                </div>
                <div className="flex gap-1.5 mt-3">
                  <select value={u.role} onChange={(e) => handleRole(u.id, e.target.value)} disabled={updating === u.id}
                    className="flex-1 text-xs px-2 py-1.5 rounded-lg border border-cocoa-200 text-cocoa-600 font-semibold disabled:opacity-50">
                    <option value="student">Student</option><option value="kitchen">Kitchen</option><option value="rider">Rider</option><option value="admin">Admin</option><option value="super_admin">Super Admin</option>
                  </select>
                  <button onClick={() => handleToggle(u.id, u.is_active)} disabled={updating === u.id}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50 ${u.is_active ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-600 border border-green-200'}`}>
                    {u.is_active ? <Ban className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected && <UserDrawer user={selected} onClose={() => setSelected(null)} />}
      {bulkOpen && <BulkGrantModal userIds={[...selectedIds]} users={users.filter(u => selectedIds.has(u.id))} onClose={() => setBulkOpen(false)} onDone={() => { setBulkOpen(false); setSelectedIds(new Set()); load(); }} />}
    </div>
  );
}

function UserDrawer({ user, onClose }) {
  const [tab, setTab] = useState('hp');
  const [hp, setHp] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [orders, setOrders] = useState([]);
  const [grantOpen, setGrantOpen] = useState(false);
  const [tabLoading, setTabLoading] = useState(false);

  // Lazy fetch only the active tab's data on tab activation — the wallet/HP
  // panels are separate tabs that fetch on demand, not pre-loaded (admin spec).
  const loadTab = async (t) => {
    setTabLoading(true);
    try {
      if (t === 'hp') setHp(await mockApi.admin.getUserHp(user.id));
      else if (t === 'wallet') setWallet(await mockApi.admin.getUserWallet(user.id));
      else if (t === 'orders') setOrders(await mockApi.admin.getUserOrders(user.id));
    } catch { /* leave null */ }
    setTabLoading(false);
  };

  useEffect(() => {
    setHp(null); setWallet(null); setOrders([]);
    loadTab('hp');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-black/50" onClick={onClose}>
      <div className="w-full sm:max-w-md bg-cocoa-50 h-full overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-cocoa-100 px-5 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flame-gradient text-white flex items-center justify-center font-bold">{(user.full_name || '?').charAt(0)}</div>
            <div><div className="font-bold text-sm text-cocoa-800">{user.full_name}</div><div className="text-xs text-cocoa-400">{user.phone}</div></div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-cocoa-100"><X className="w-4 h-4 text-cocoa-500" /></button>
        </div>

        <div className="p-4 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <Stat icon={Flame} label="HP" value={hp ? (hp.total ?? 0).toLocaleString() : '—'} color="text-flame-600" />
            <Stat icon={Wallet} label="Wallet" value={wallet ? formatNaira(wallet.wallet_balance ?? wallet.balance ?? 0) : '—'} color="text-green-600" />
            <Stat icon={Package} label="Orders" value={orders.length} color="text-blue-600" />
          </div>

          <button onClick={() => setGrantOpen(true)} className="flex items-center gap-1.5 w-full py-2.5 rounded-full flame-gradient text-white text-sm font-bold">
            <Plus className="w-4 h-4" /> Adjust HP
          </button>

          <div className="flex gap-1 p-1 rounded-full bg-cocoa-100">
            {[{ id: 'hp', label: 'HP History' }, { id: 'wallet', label: 'Wallet' }, { id: 'orders', label: 'Orders' }].map((t) => (
              <button key={t.id} onClick={() => { setTab(t.id); loadTab(t.id); }} className={`flex-1 py-1.5 rounded-full text-xs font-bold ${tab === t.id ? 'bg-white text-flame-600 shadow-sm' : 'text-cocoa-500'}`}>{t.label}</button>
            ))}
          </div>

          {tabLoading ? <LoadingSpinner label="Loading..." /> : tab === 'hp' ? (
            <div className="space-y-2">
              {hp && <div className="flex gap-2 mb-1"><Pill tone="flame">{(hp.active ?? 0).toLocaleString()} active</Pill><Pill tone="amber">{(hp.pending ?? 0).toLocaleString()} pending</Pill></div>}
              {hp?.transactions.map((t) => (
                <div key={t.id} className="rounded-xl bg-white border border-cocoa-100 p-3 flex items-center justify-between">
                  <div><div className="text-xs font-bold text-cocoa-700 capitalize">{(t.source || t.reference_type || 'hp').replace(/_/g, ' ')}</div><div className="text-[11px] text-cocoa-400 truncate max-w-[10rem]">{t.metadata?.notes || timeAgo(t.created_at)}</div></div>
                  <span className={`text-sm font-bold ${t.amount >= 0 ? 'text-green-600' : 'text-red-500'}`}>{t.amount >= 0 ? '+' : '−'}{Math.abs(t.amount)}</span>
                </div>
              ))}
            </div>
          ) : tab === 'wallet' ? (
            <div className="space-y-2">
              {wallet?.transactions.map((t) => (
                <div key={t.id} className="rounded-xl bg-white border border-cocoa-100 p-3 flex items-center justify-between">
                  <div><div className="text-xs font-bold text-cocoa-700">{t.reason}</div><div className="text-[11px] text-cocoa-400">{timeAgo(t.created_at)}</div></div>
                  <span className={`text-sm font-bold ${t.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>{t.type === 'credit' ? '+' : '−'}{formatNaira(t.amount)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {orders.map((o) => (
                <div key={o.id} className="rounded-xl bg-white border border-cocoa-100 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ORDER_STATUS_COLORS[o.status]}`}>{ORDER_STATUS_LABELS[o.status]}</span>
                    <span className="text-xs text-cocoa-400">{timeAgo(o.created_at)}</span>
                  </div>
                  <div className="text-xs text-cocoa-600">{o.order_items.map((it) => `${it.quantity}× ${it.name_snapshot}`).join(', ')}</div>
                  <div className="text-sm font-bold text-cocoa-800 mt-1">{formatNaira(o.total_amount)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {grantOpen && <GrantModal user={user} onClose={() => setGrantOpen(false)} onDone={() => loadTab('hp')} />}
    </div>
  );
}

function GrantModal({ user, onClose, onDone }) {
  const [amount, setAmount] = useState(50);
  const [notes, setNotes] = useState('Manual grant');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);

  const submit = async () => {
    setSubmitting(true);
    try {
      const res = await mockApi.admin.grantHpToUser(user.id, { amount: Number(amount), notes });
      // Spec response: { awarded: 50 }. Some backends may also return
      // { amount, new_balance } — handle both so the success message always shows.
      const awarded = res?.awarded ?? res?.amount ?? Number(amount);
      setMsg({ awarded, new_balance: res?.new_balance ?? res?.balance_after });
      onDone();
    } catch (e) {
      toast({ title: 'Grant failed', description: e.message, variant: 'destructive' });
    }
    setSubmitting(false);
  };

  return (
    <Modal open onClose={onClose} title={`Adjust HP — ${user.full_name}`}>
      <div className="space-y-3">
        <p className="text-xs text-cocoa-500">Manually grant or deduct HP for this user (POST /admin/hp/grant — body: user_id, amount, notes).</p>
        <Field label="Amount (HP) — negative to deduct"><TextInput type="number" value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
        <Field label="Notes"><TextInput value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Reason for this grant" /></Field>
        <button onClick={submit} disabled={submitting} className="w-full py-3 rounded-full flame-gradient text-white font-bold disabled:opacity-50">{submitting ? 'Granting...' : 'Grant HP'}</button>
        {msg && <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-xs text-green-700">✓ {msg.awarded} HP granted{msg.new_balance != null ? `. New balance: ${Number(msg.new_balance).toLocaleString()} HP` : ''}</div>}
      </div>
    </Modal>
  );
}

function BulkGrantModal({ userIds, users, onClose, onDone }) {
  const [amount, setAmount] = useState(50);
  const [reason, setReason] = useState('Bulk HP grant');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const submit = async () => {
    setSubmitting(true);
    const res = await mockApi.admin.bulkGrantHp({ user_ids: userIds, amount: Number(amount), reason });
    setResult(res); setSubmitting(false);
    setTimeout(() => { onDone(); }, 1500);
  };

  return (
    <Modal open onClose={onClose} title="Bulk HP Grant">
      <div className="space-y-3">
        <div className="rounded-xl bg-flame-50 border border-flame-200 p-3 text-xs text-flame-700">
          <UsersIcon className="w-4 h-4 inline mr-1" /> Granting HP to <b>{userIds.length}</b> selected user(s)
        </div>
        <div className="max-h-32 overflow-y-auto rounded-xl bg-cocoa-50 p-2 space-y-1">
          {users.map(u => <div key={u.id} className="text-xs text-cocoa-600 font-semibold">{u.full_name} · {u.hp_balance} HP</div>)}
        </div>
        <Field label="Amount per user (HP)"><TextInput type="number" value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
        <Field label="Reason"><TextInput value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
        <button onClick={submit} disabled={submitting || !amount} className="w-full py-3 rounded-full flame-gradient text-white font-bold disabled:opacity-50">{submitting ? 'Granting...' : `Grant ${amount} HP to ${userIds.length} users`}</button>
        {result && <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-xs text-green-700">✓ {result.awarded_count} users granted {result.amount_per_user} HP each. Total: {result.total_hp_awarded} HP</div>}
      </div>
    </Modal>
  );
}

function Stat({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-xl bg-white border border-cocoa-100 p-2.5 text-center">
      <Icon className={`w-4 h-4 ${color} mx-auto mb-1`} />
      <div className="font-bold text-sm text-cocoa-800">{value}</div>
      <div className="text-[10px] text-cocoa-400">{label}</div>
    </div>
  );
}