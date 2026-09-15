import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Check, Zap, Clock, Flame } from 'lucide-react';
import { liveApi as mockApi } from '@/lib/liveApi';
import { TIERS } from '@/lib/mockData';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Modal, Field, TextInput, Pill, Toggle } from './AdminShared';
import ImageUploader from './ImageUploader';
import { toast } from '@/components/ui/use-toast';

const BLANK = {
  name: '',
  hp_cost: 100,
  reward_type: 'food',
  fulfillment_type: 'auto',
  stock_quantity: 50,
  min_tier_id: 'tier_ember',
  description: '',
  is_active: true,
  flash_enabled: false,
  flash_hp_cost: '',
  flash_max_qty: '',
  flash_starts_at: '',
  flash_ends_at: '',
  image_url: '',
};

const REWARD_TYPES = [
  { value: 'food', label: 'Food' },
  { value: 'merch', label: 'Merch' },
  { value: 'experience', label: 'Experience' },
  { value: 'marketplace', label: 'Marketplace' },
];

const FULFILLMENT_TYPES = [
  { value: 'auto', label: 'Auto (instant)' },
  { value: 'admin', label: 'Admin (manual)' },
];

// Compute flash status for display on the reward list.
// Returns 'live' | 'upcoming' | 'ended' | null
const flashStatus = (r) => {
  if (!r.flash_enabled) return null;
  const now = Date.now();
  const start = r.flash_starts_at ? new Date(r.flash_starts_at).getTime() : 0;
  const end = r.flash_ends_at ? new Date(r.flash_ends_at).getTime() : Infinity;
  const slots = r.flash_slots_remaining ?? r.flash_max_qty ?? 0;
  if (now < start) return 'upcoming';
  if (now > end || slots <= 0) return 'ended';
  return 'live';
};

const FLASH_BADGE = {
  live: { icon: Flame, label: '🔥 Live', tone: 'flame' },
  upcoming: { icon: Clock, label: '⏳ Upcoming', tone: 'amber' },
  ended: { icon: Clock, label: '⏰ Ended', tone: 'cocoa' },
};

// Convert a datetime-local value to ISO for the API.
const toISO = (val) => (val ? new Date(val).toISOString() : null);
// Convert an ISO string to a datetime-local value.
const toLocal = (iso) => (iso ? new Date(iso).toISOString().slice(0, 16) : '');

export default function AdminRewards() {
  const [tab, setTab] = useState('rewards');
  const [rewards, setRewards] = useState([]);
  const [redemptions, setRed] = useState([]);
  const [modal, setModal] = useState(null);

  const load = async () => {
    setRewards(await mockApi.admin.getRewards());
    setRed(await mockApi.admin.getRedemptions());
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    const item = { ...modal.item };
    const body = {
      ...item,
      hp_cost: Number(item.hp_cost),
      stock_quantity: Number(item.stock_quantity),
      fulfillment_type: item.fulfillment_type || 'auto',
      is_active: item.is_active !== false,
      flash_enabled: !!item.flash_enabled,
      flash_hp_cost: item.flash_hp_cost ? Number(item.flash_hp_cost) : null,
      flash_max_qty: item.flash_max_qty ? Number(item.flash_max_qty) : null,
      flash_starts_at: toISO(item.flash_starts_at),
      flash_ends_at: toISO(item.flash_ends_at),
    };
    try {
      if (modal.isNew) await mockApi.admin.createReward(body);
      else await mockApi.admin.updateReward(modal.item.id, body);
      setModal(null);
      await load();
      toast({ title: modal.isNew ? 'Reward created' : 'Reward updated' });
    } catch (e) {
      toast({ title: modal.isNew ? 'Create failed' : 'Save failed', description: e.message, variant: 'destructive' });
    }
  };
  const remove = async (id) => { await mockApi.admin.deleteReward(id); await load(); };
  const fulfill = async (id) => { await mockApi.admin.fulfillRedemption(id); await load(); };

  if (!rewards.length && !redemptions.length) return <LoadingSpinner label="Loading rewards..." />;

  return (
    <div className="space-y-4">
      <div className="flex gap-1 p-1 rounded-full bg-cocoa-100">
        {[{ id: 'rewards', label: 'Rewards' }, { id: 'redemptions', label: 'Redemptions' }].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 py-2 rounded-full text-xs font-bold ${tab === t.id ? 'bg-white text-flame-600 shadow-sm' : 'text-cocoa-500'}`}>{t.label}</button>
        ))}
      </div>
      {tab === 'rewards' ? (
        <div className="space-y-2">
          <div className="flex justify-end"><button onClick={() => setModal({ item: { ...BLANK }, isNew: true })} className="flex items-center gap-1 px-3 py-2 rounded-full bg-flame-600 text-white text-xs font-bold"><Plus className="w-4 h-4" /> Add Reward</button></div>
          {rewards.map((r) => {
            const fs = flashStatus(r);
            const badge = fs ? FLASH_BADGE[fs] : null;
            return (
              <div key={r.id} className="rounded-2xl bg-white border border-cocoa-100 p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-bold text-sm text-cocoa-800">{r.name}</div>
                    {badge && <Pill tone={badge.tone}>{badge.label}</Pill>}
                  </div>
                  <div className="text-xs text-cocoa-400">
                    {r.flash_enabled && r.flash_hp_cost ? (
                      <><span className="line-through text-cocoa-300">{r.hp_cost}</span> <span className="text-flame-600 font-bold">{r.flash_hp_cost}</span> HP · </>
                    ) : `${r.hp_cost} HP · `}
                    {REWARD_TYPES.find(t => t.value === r.reward_type)?.label || r.reward_type} · stock {r.stock_quantity} · {TIERS.find((t) => t.id === r.min_tier_id)?.name || 'Ember'} tier
                  </div>
                  {r.flash_enabled && (
                    <div className="text-[10px] text-cocoa-400 mt-0.5">
                      Flash: {r.flash_slots_remaining ?? r.flash_max_qty ?? 0}/{r.flash_max_qty ?? 0} slots
                      {r.flash_starts_at && ` · ${new Date(r.flash_starts_at).toLocaleString()}`}
                      {r.flash_ends_at && ` → ${new Date(r.flash_ends_at).toLocaleString()}`}
                    </div>
                  )}
                </div>
                <button onClick={() => setModal({ item: { ...r, flash_starts_at: toLocal(r.flash_starts_at), flash_ends_at: toLocal(r.flash_ends_at) }, isNew: false })} className="p-2 rounded-lg hover:bg-cocoa-50"><Pencil className="w-4 h-4 text-cocoa-500" /></button>
                <button onClick={() => remove(r.id)} className="p-2 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-500" /></button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {redemptions.map((r) => (
            <div key={r.id} className="rounded-2xl bg-white border border-cocoa-100 p-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="font-bold text-sm text-cocoa-800">{r.rewards?.name}</div>
                  {r.is_flash && <Pill tone="flame"><Zap className="w-2.5 h-2.5 inline" /> Flash</Pill>}
                </div>
                <div className="text-xs text-cocoa-400">{r.hp_cost_snapshot} HP{r.is_flash ? ' (flash price)' : ''}</div>
              </div>
              {r.status === 'pending' ? <button onClick={() => fulfill(r.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-600 text-white text-xs font-bold"><Check className="w-3.5 h-3.5" /> Fulfill</button> : <Pill tone="green">Fulfilled</Pill>}
            </div>
          ))}
        </div>
      )}
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.isNew ? 'New Reward' : 'Edit Reward'}>
        {modal && (
          <div className="space-y-3">
            <Field label="Name"><TextInput value={modal.item.name} onChange={(e) => setModal({ item: { ...modal.item, name: e.target.value }, isNew: modal.isNew })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="HP cost"><TextInput type="number" value={modal.item.hp_cost} onChange={(e) => setModal({ item: { ...modal.item, hp_cost: e.target.value }, isNew: modal.isNew })} /></Field>
              <Field label="Stock"><TextInput type="number" value={modal.item.stock_quantity} onChange={(e) => setModal({ item: { ...modal.item, stock_quantity: e.target.value }, isNew: modal.isNew })} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Type"><select value={modal.item.reward_type} onChange={(e) => setModal({ item: { ...modal.item, reward_type: e.target.value }, isNew: modal.isNew })} className="w-full mt-1 p-2.5 rounded-xl border border-cocoa-200 text-sm">{REWARD_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select></Field>
              <Field label="Min Tier"><select value={modal.item.min_tier_id} onChange={(e) => setModal({ item: { ...modal.item, min_tier_id: e.target.value }, isNew: modal.isNew })} className="w-full mt-1 p-2.5 rounded-xl border border-cocoa-200 text-sm">{TIERS.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Fulfillment"><select value={modal.item.fulfillment_type} onChange={(e) => setModal({ item: { ...modal.item, fulfillment_type: e.target.value }, isNew: modal.isNew })} className="w-full mt-1 p-2.5 rounded-xl border border-cocoa-200 text-sm">{FULFILLMENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select></Field>
              <Field label="Active"><div className="mt-2"><Toggle checked={!!modal.item.is_active} onChange={(v) => setModal({ item: { ...modal.item, is_active: v }, isNew: modal.isNew })} /></div></Field>
            </div>
            <Field label="Description"><textarea value={modal.item.description || ''} onChange={(e) => setModal({ item: { ...modal.item, description: e.target.value }, isNew: modal.isNew })} rows={2} className="w-full p-2.5 rounded-xl border border-cocoa-200 text-sm" placeholder="Reward description (optional)" /></Field>
            <Field label="Image"><ImageUploader value={modal.item.image_url} onChange={(url) => setModal({ item: { ...modal.item, image_url: url }, isNew: modal.isNew })} folder="rewards" /></Field>

            {/* Flash Sale section */}
            <div className="rounded-2xl border border-cocoa-200 p-3 space-y-3 bg-cocoa-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-flame-600" />
                  <span className="text-sm font-bold text-cocoa-800">Flash Sale</span>
                </div>
                <Toggle checked={!!modal.item.flash_enabled} onChange={(v) => setModal({ item: { ...modal.item, flash_enabled: v }, isNew: modal.isNew })} />
              </div>
              {modal.item.flash_enabled && (
                <div className="space-y-3 animate-fade-in">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Flash HP cost"><TextInput type="number" value={modal.item.flash_hp_cost} onChange={(e) => setModal({ item: { ...modal.item, flash_hp_cost: e.target.value }, isNew: modal.isNew })} /></Field>
                    <Field label="Max slots"><TextInput type="number" value={modal.item.flash_max_qty} onChange={(e) => setModal({ item: { ...modal.item, flash_max_qty: e.target.value }, isNew: modal.isNew })} /></Field>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Starts at"><TextInput type="datetime-local" value={modal.item.flash_starts_at} onChange={(e) => setModal({ item: { ...modal.item, flash_starts_at: e.target.value }, isNew: modal.isNew })} /></Field>
                    <Field label="Ends at"><TextInput type="datetime-local" value={modal.item.flash_ends_at} onChange={(e) => setModal({ item: { ...modal.item, flash_ends_at: e.target.value }, isNew: modal.isNew })} /></Field>
                  </div>
                  <p className="text-[11px] text-cocoa-400">When enabled, students see a 🔥 Flash badge, countdown timer, and a strikethrough normal price. Slots decrement on each redemption.</p>
                </div>
              )}
            </div>

            <button onClick={save} className="w-full py-3 rounded-full flame-gradient text-white font-bold text-sm">{modal.isNew ? 'Create Reward' : 'Save Changes'}</button>
          </div>
        )}
      </Modal>
    </div>
  );
}