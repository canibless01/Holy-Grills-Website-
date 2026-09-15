import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Save, Zap, Clock, Coins } from 'lucide-react';
import { liveApi as mockApi } from '@/lib/liveApi';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toast } from '@/components/ui/use-toast';
import { Card, Field, TextInput, Pill, SectionHeader, Modal } from './AdminShared';

export default function AdminExclusiveSpin() {
  const [template, setTemplate] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [extraCost, setExtraCost] = useState(0);
  const [validityDays, setValidityDays] = useState(30);
  const [editItem, setEditItem] = useState(null);
  const [adding, setAdding] = useState(false);
  const [savingCost, setSavingCost] = useState(false);
  const [savingValidity, setSavingValidity] = useState(false);
  const [busy, setBusy] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [tmpl, hist, settings] = await Promise.all([
        mockApi.admin.getExclusiveSpinTemplate().catch(() => []),
        mockApi.admin.getExclusiveSpinHistoryAdmin().catch(() => []),
        mockApi.admin.getSystemSettings().catch(() => []),
      ]);
      setTemplate(tmpl);
      setHistory(hist);
      const costSetting = settings.find(s => s.key === 'exclusive_spin_extra_cost');
      const valSetting = settings.find(s => s.key === 'exclusive_spin_validity_days');
      setExtraCost(costSetting?.value || 0);
      setValidityDays(valSetting?.value || 30);
    } catch { /* empty state */ }
    setLoading(false);
  };

  const totalWeight = template.reduce((sum, t) => sum + (t.weight || 0), 0);

  const saveItem = async (item) => {
    setBusy('item');
    try {
      if (item.id && !item.id.startsWith('new_')) {
        await mockApi.admin.updateExclusiveSpinTemplateItem(item.id, { name: item.name, weight: Number(item.weight) });
      } else {
        await mockApi.admin.createExclusiveSpinTemplateItem({ name: item.name, weight: Number(item.weight) });
      }
      toast({ title: '✅ Prize saved', description: `"${item.name}" updated in the exclusive spin template.` });
      setEditItem(null); setAdding(false);
      await load();
    } catch (e) {
      toast({ title: 'Failed to save prize', description: e.message, variant: 'destructive' });
    }
    setBusy(null);
  };

  const deleteItem = async (id, name) => {
    if (!confirm(`Delete "${name}" from the spin template?`)) return;
    setBusy(id);
    try {
      await mockApi.admin.deleteExclusiveSpinTemplateItem(id);
      toast({ title: 'Prize removed', description: `"${name}" removed from the exclusive spin.` });
      await load();
    } catch (e) {
      toast({ title: 'Failed to delete', description: e.message, variant: 'destructive' });
    }
    setBusy(null);
  };

  const saveExtraCost = async () => {
    setSavingCost(true);
    try {
      await mockApi.admin.updateExclusiveSpinExtraCost({ value: Number(extraCost) });
      toast({ title: '✅ Extra spin cost updated', description: `Extra spins now cost ${extraCost} HP.` });
    } catch (e) {
      toast({ title: 'Failed to save', description: e.message, variant: 'destructive' });
    }
    setSavingCost(false);
  };

  const saveValidity = async () => {
    setSavingValidity(true);
    try {
      await mockApi.admin.updateExclusiveSpinValidityDays({ value: Number(validityDays) });
      toast({ title: '✅ Validity updated', description: `Exclusive spin rewards now expire after ${validityDays} days.` });
    } catch (e) {
      toast({ title: 'Failed to save', description: e.message, variant: 'destructive' });
    }
    setSavingValidity(false);
  };

  if (loading) return <LoadingSpinner label="Loading exclusive spin..." />;

  return (
    <div className="space-y-5">
      <div>
        <SectionHeader
          title="Exclusive Spin Prizes"
          action={<button onClick={() => setAdding(true)} className="flex items-center gap-1 px-3 py-2 rounded-full bg-flame-600 text-white text-xs font-bold"><Plus className="w-4 h-4" /> Add Prize</button>}
        />
        <p className="text-xs text-cocoa-400 mb-3">Prizes that appear on the exclusive spin wheel for top leaderboard earners. Weights determine probability — total should add up to 100.</p>

        {template.length === 0 ? (
          <Card><p className="text-xs text-cocoa-400 text-center py-4">No prizes configured yet. Add prizes to build the spin wheel.</p></Card>
        ) : (
          <div className="space-y-2">
            {template.map((t) => (
              <Card key={t.id}>
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-flame-500 shrink-0" />
                  <div className="flex-1">
                    <div className="font-bold text-sm text-cocoa-800">{t.name || t.label}</div>
                    <div className="text-xs text-cocoa-400">Weight: {t.weight}% {totalWeight > 0 && `(${((t.weight / totalWeight) * 100).toFixed(1)}% chance)`}</div>
                  </div>
                  <button onClick={() => setEditItem(t)} className="p-2 rounded-lg hover:bg-cocoa-50"><Pencil className="w-4 h-4 text-cocoa-500" /></button>
                  <button onClick={() => deleteItem(t.id, t.name || t.label)} disabled={busy === t.id} className="p-2 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-500" /></button>
                </div>
              </Card>
            ))}
          </div>
        )}
        {totalWeight > 0 && totalWeight !== 100 && (
          <div className="mt-2 rounded-xl bg-amber-50 border border-amber-200 p-2 text-xs text-amber-700">
            ⚠️ Total weight is {totalWeight} (should be 100). Probabilities will be normalized automatically.
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <SectionHeader title="Extra Spin Cost" action={<Pill tone="flame"><Coins className="w-3 h-3 inline" /> HP</Pill>} />
          <p className="text-xs text-cocoa-400 mb-3">HP cost for a student to buy an additional spin after using their free one.</p>
          <div className="flex items-end gap-2">
            <Field label="Cost (HP)"><TextInput type="number" value={extraCost} onChange={(e) => setExtraCost(e.target.value)} className="w-28" /></Field>
            <button onClick={saveExtraCost} disabled={savingCost} className="flex items-center gap-1.5 px-4 py-2.5 rounded-full flame-gradient text-white text-xs font-bold disabled:opacity-50">
              <Save className="w-3.5 h-3.5" /> {savingCost ? '...' : 'Save'}
            </button>
          </div>
        </Card>

        <Card>
          <SectionHeader title="Reward Validity" action={<Pill tone="amber"><Clock className="w-3 h-3 inline" /> days</Pill>} />
          <p className="text-xs text-cocoa-400 mb-3">How long exclusive spin rewards remain valid before expiry.</p>
          <div className="flex items-end gap-2">
            <Field label="Validity (days)"><TextInput type="number" value={validityDays} onChange={(e) => setValidityDays(e.target.value)} className="w-28" /></Field>
            <button onClick={saveValidity} disabled={savingValidity} className="flex items-center gap-1.5 px-4 py-2.5 rounded-full flame-gradient text-white text-xs font-bold disabled:opacity-50">
              <Save className="w-3.5 h-3.5" /> {savingValidity ? '...' : 'Save'}
            </button>
          </div>
        </Card>
      </div>

      <div>
        <SectionHeader title="Spin History" action={<Pill tone="cocoa">{history.length} spins</Pill>} />
        {history.length === 0 ? (
          <Card><p className="text-xs text-cocoa-400 text-center py-4">No spins yet.</p></Card>
        ) : (
          <div className="space-y-2">
            {history.slice(0, 20).map((h) => (
              <div key={h.id} className="rounded-xl bg-white border border-cocoa-100 p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flame-gradient text-white flex items-center justify-center text-xs font-bold">{(h.user_name || 'U').charAt(0)}</div>
                <div className="flex-1">
                  <div className="font-semibold text-sm text-cocoa-800">{h.user_name || 'User'}</div>
                  <div className="text-xs text-cocoa-400">Won: <span className="font-bold text-flame-600">{h.prize_name || h.prize || '—'}</span></div>
                </div>
                {h.spun_at && <span className="text-[10px] text-cocoa-400">{new Date(h.spun_at).toLocaleDateString()}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {(editItem || adding) && (
        <PrizeModal item={editItem} onClose={() => { setEditItem(null); setAdding(false); }} onSave={saveItem} busy={busy === 'item'} />
      )}
    </div>
  );
}

function PrizeModal({ item, onClose, onSave, busy }) {
  const [form, setForm] = useState(item ? { ...item } : { name: '', weight: 10 });
  return (
    <Modal open onClose={onClose} title={item ? 'Edit Prize' : 'Add Prize'}>
      <div className="space-y-3">
        <Field label="Prize Name"><TextInput value={form.name || form.label || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Free Sausage ×2, HP Jackpot +750" /></Field>
        <Field label="Weight (%)" hint="Higher weight = more likely to land on this prize. Total should add up to 100."><TextInput type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} /></Field>
        <button onClick={() => onSave({ ...form, name: form.name || form.label })} disabled={busy || !form.name} className="w-full py-3 rounded-full flame-gradient text-white font-bold text-sm disabled:opacity-50">{busy ? 'Saving...' : 'Save Prize'}</button>
      </div>
    </Modal>
  );
}