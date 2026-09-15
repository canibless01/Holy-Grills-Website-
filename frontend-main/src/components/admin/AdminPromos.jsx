import React, { useState, useEffect } from 'react';
import { Plus, X, Pencil, BarChart3, Power } from 'lucide-react';
import { liveApi as mockApi } from '@/lib/liveApi';
import { formatNaira, formatDate } from '@/lib/hgUtils';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Modal, Field, TextInput } from './AdminShared';
import { toast } from '@/components/ui/use-toast';

export default function AdminPromos() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null);
  const [usesFor, setUsesFor] = useState(null);

  const load = async () => {
    setLoading(true);
    setPromos(await mockApi.admin.getPromoCodes());
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  if (loading) return <LoadingSpinner label="Loading promos..." />;

  return (
    <div className="space-y-4">
      <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-full flame-gradient text-white text-sm font-bold shadow-md">
        <Plus className="w-4 h-4" /> Create Promo Code
      </button>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {promos.map((p) => (
          <div key={p.id} className="rounded-2xl bg-white border border-cocoa-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm font-mono text-cocoa-800 bg-cocoa-50 px-2 py-0.5 rounded">{p.code}</span>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${p.is_active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{p.is_active ? 'ACTIVE' : 'EXPIRED'}</span>
            </div>
            <div className="text-sm font-bold text-flame-600 mb-1">
              {p.discount_type === 'percentage' ? `${p.discount_value}% off` : `${formatNaira(p.discount_value)} off`}
            </div>
            <div className="text-xs text-cocoa-400">Min order: {formatNaira(p.min_order_amount)}</div>
            <div className="flex items-center justify-between text-xs text-cocoa-500 mt-1">
              <span>Used: {p.uses_count}/{p.max_uses}</span>
              {p.ends_at && <span className="text-cocoa-400">ends {formatDate(p.ends_at)}</span>}
            </div>
            <div className="w-full h-1.5 rounded-full bg-cocoa-100 mt-2">
              <div className="h-full rounded-full flame-gradient" style={{ width: `${Math.min(100, (p.uses_count / p.max_uses) * 100)}%` }} />
            </div>
            <div className="flex gap-1.5 mt-3">
              <button onClick={() => setEditing(p)} className="flex items-center gap-1 flex-1 justify-center px-2 py-1.5 rounded-lg bg-cocoa-50 text-cocoa-600 text-xs font-bold border border-cocoa-200"><Pencil className="w-3 h-3" /> Edit</button>
              <button onClick={() => setUsesFor(p)} className="flex items-center gap-1 flex-1 justify-center px-2 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold border border-blue-200"><BarChart3 className="w-3 h-3" /> Uses</button>
              <button onClick={async () => { await mockApi.admin.togglePromoCode(p.id); await load(); }} className="flex items-center justify-center px-2 py-1.5 rounded-lg bg-cocoa-50 text-cocoa-600 border border-cocoa-200"><Power className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>

      {showCreate && <PromoModal onClose={() => setShowCreate(false)} onSaved={load} />}
      {editing && <PromoModal promo={editing} onClose={() => setEditing(null)} onSaved={load} />}
      {usesFor && <UsesModal promo={usesFor} onClose={() => setUsesFor(null)} />}
    </div>
  );
}

function PromoModal({ promo, onClose, onSaved }) {
  const [form, setForm] = useState(promo ? { ...promo } : { code: '', discount_type: 'percentage', discount_value: 10, min_order_amount: 1000, max_uses: 100, max_uses_per_user: 1, expires_at: '' });
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    const dv = Number(form.discount_value);
    if (!form.code) { toast({ title: 'Code required', variant: 'destructive' }); return; }
    if (form.discount_type === 'percentage' && dv > 100) { toast({ title: 'Invalid discount', description: 'Percentage discount cannot exceed 100%.', variant: 'destructive' }); return; }
    if (Number(form.max_uses) <= 0) { toast({ title: 'Invalid max uses', description: 'Max uses must be greater than 0.', variant: 'destructive' }); return; }
    if (Number(form.max_uses_per_user) <= 0) { toast({ title: 'Invalid max uses/user', description: 'Max uses per user must be greater than 0.', variant: 'destructive' }); return; }
    if (Number(form.min_order_amount) < 0) { toast({ title: 'Invalid min order', description: 'Minimum order amount cannot be negative.', variant: 'destructive' }); return; }
    setSubmitting(true);
    try {
      const body = {
        ...form,
        code: form.code.toUpperCase(),
        discount_value: dv,
        min_order_amount: Number(form.min_order_amount),
        max_uses: Number(form.max_uses),
        max_uses_per_user: Number(form.max_uses_per_user),
        ends_at: form.expires_at ? new Date(form.expires_at).toISOString() : (promo ? promo.ends_at : null),
      };
      if (promo) await mockApi.admin.updatePromoCode(promo.id, body);
      else await mockApi.admin.createPromoCode(body);
      onClose(); onSaved();
    } catch (e) { toast({ title: 'Failed to save', description: e.message, variant: 'destructive' }); }
    setSubmitting(false);
  };

  return (
    <Modal open onClose={onClose} title={promo ? 'Edit Promo Code' : 'Create Promo Code'}>
      <div className="space-y-3">
        <Field label="Code"><TextInput value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="SAVE10" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Type">
            <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })} className="w-full mt-1 p-2.5 rounded-xl border border-cocoa-200 text-sm">
              <option value="percentage">Percentage</option>
              <option value="flat">Flat ₦</option>
            </select>
          </Field>
          <Field label="Value"><TextInput type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Min Order ₦"><TextInput type="number" value={form.min_order_amount} onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })} /></Field>
          <Field label="Max Uses"><TextInput type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Max Uses / User"><TextInput type="number" value={form.max_uses_per_user} onChange={(e) => setForm({ ...form, max_uses_per_user: e.target.value })} /></Field>
          <Field label="Expires At"><TextInput type="date" value={form.expires_at ? form.expires_at.slice(0, 10) : ''} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} /></Field>
        </div>
        <button onClick={submit} disabled={submitting || !form.code} className="w-full py-3 rounded-full flame-gradient text-white font-bold disabled:opacity-50">{submitting ? 'Saving...' : (promo ? 'Save Changes' : 'Create Promo')}</button>
      </div>
    </Modal>
  );
}

function UsesModal({ promo, onClose }) {
  const [uses, setUses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => { setUses(await mockApi.admin.getPromoCodeUses(promo.id)); setLoading(false); })();
  }, [promo.id]);

  return (
    <Modal open onClose={onClose} title={`Usage — ${promo.code}`}>
      <div className="text-xs text-cocoa-500 mb-3">{promo.uses_count} total uses · {formatNaira(promo.discount_value * promo.uses_count)} total discount</div>
      {loading ? <LoadingSpinner label="Loading uses..." /> : (
        <div className="space-y-2">
          {uses.map((u) => (
            <div key={u.id} className="rounded-xl bg-cocoa-50 border border-cocoa-100 p-3 flex items-center justify-between">
              <div>
                <div className="font-bold text-sm text-cocoa-800">{u.user_name}</div>
                <div className="text-[11px] text-cocoa-400">Order #{u.order_id.toUpperCase()} · {formatDate(u.used_at)}</div>
              </div>
              <span className="font-bold text-flame-600 text-sm">−{formatNaira(u.discount_applied)}</span>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}