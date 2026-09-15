import React, { useState, useEffect } from 'react';
import { Building2, Clock, Save, Plus } from 'lucide-react';
import { liveApi as mockApi } from '@/lib/liveApi';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toast } from '@/components/ui/use-toast';
import { Toggle, Card, Pill, Field, TextInput, Modal } from './AdminShared';

// Flag metadata — admin guidance only. Actual enabled/disabled values come from the backend.
const FLAG_META = {
  leaderboard_prizes: { label: 'Leaderboard Prizes', flipWhen: 'After first month of data', impact: 'Shows/hides prize indicators on the leaderboard' },
  free_side_credits: { label: 'Free Side Credits', flipWhen: 'After first month of data', impact: 'Shows/hides free side UI in rewards' },
  exclusive_spin: { label: 'Exclusive Spin', flipWhen: 'After first month of data', impact: 'Shows/hides exclusive spin wheel for top earners' },
  hall_of_fame: { label: 'Hall of Fame', flipWhen: 'After 3 months of data', impact: 'Shows/hides the Hall of Fame page' },
  badge_system: { label: 'Badge System', flipWhen: '200+ active users', impact: 'Shows/hides badges on profiles and challenges' },
  spin_and_win: { label: 'Spin & Win', flipWhen: '200+ active users', impact: 'Shows/hides the daily spin wheel' },
  marketplace_general: { label: 'Marketplace', flipWhen: '500+ active users', impact: 'Shows/hides the marketplace' },
  hp_transfer: { label: 'HP Transfer', flipWhen: 'Phase 3', impact: 'Shows/hides HP transfer between users' },
};

export function FeatureFlags() {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [campusScope, setCampusScope] = useState(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [draft, setDraft] = useState({ feature_name: '', is_active: false, description: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => { load(); }, []);

  // Create a new flag (POST /admin/feature-flags). New flags default OFF so
  // admins can verify before going live. The name must be a lowercase slug
  // (matches the featureConfig keys students read on the other side).
  const createFlag = async () => {
    const name = draft.feature_name.trim();
    if (!/^[a-z][a-z0-9_]{2,}$/.test(name)) {
      toast({ title: 'Invalid flag name', description: 'Use lowercase letters, numbers and underscores (min 3 chars).', variant: 'destructive' });
      return;
    }
    setCreating(true);
    try {
      await mockApi.admin.createFeatureFlag({ feature_name: name, is_active: !!draft.is_active, description: draft.description.trim() });
      setCreateOpen(false);
      setDraft({ feature_name: '', is_active: false, description: '' });
      await load();
      toast({ title: 'Feature flag created', description: `${name} is now visible in the flag list.` });
    } catch (e) {
      toast({ title: 'Failed to create flag', description: e.message, variant: 'destructive' });
    }
    setCreating(false);
  };

  const load = async () => {
    setLoading(true);
    try { setFlags(await mockApi.admin.getFeatureFlags()); } catch { setFlags([]); }
    setLoading(false);
  };

  const toggle = async (name, current) => {
    setBusy(name);
    const meta = FLAG_META[name] || { label: name };
    try {
      await mockApi.admin.toggleFeatureFlag(name, { is_active: !current, campus_id: campusScope });
      toast({
        title: `${meta.label} ${!current ? 'enabled' : 'disabled'}`,
        description: campusScope
          ? `Override applied for this campus. Students will ${!current ? 'now see' : 'no longer see'} this feature.`
          : `Applied globally. All students will ${!current ? 'now see' : 'no longer see'} this feature.`,
      });
      await load();
    } catch (e) {
      toast({ title: 'Failed to update flag', description: e.message, variant: 'destructive' });
    }
    setBusy(null);
  };

  if (loading) return <LoadingSpinner label="Loading flags..." />;
  if (!flags.length) return (
    <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-700">
      Feature flags are not available on your backend yet — the <code>/admin/feature-flags</code> endpoint returns 404.
    </div>
  );

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center gap-3">
          <Building2 className="w-5 h-5 text-cocoa-400" />
          <div className="flex-1">
            <div className="font-bold text-sm text-cocoa-800">Campus Scope</div>
            <div className="text-xs text-cocoa-400">Apply flag overrides to a specific campus, or leave at Global for all campuses.</div>
          </div>
          <select value={campusScope || ''} onChange={(e) => setCampusScope(e.target.value || null)} className="p-2.5 rounded-xl border border-cocoa-200 text-sm">
            <option value="">🌐 Global (all campuses)</option>
            <option value="campus_a">Campus A</option>
            <option value="campus_b">Campus B</option>
          </select>
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-base text-cocoa-800">Feature Flags</h2>
        <button onClick={() => setCreateOpen(true)} className="flex items-center gap-1 px-3 py-2 rounded-full bg-flame-600 text-white text-xs font-bold"><Plus className="w-4 h-4" /> Create Flag</button>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {flags.map((f) => {
          const name = f.feature_name || f.name;
          const meta = FLAG_META[name] || { label: name, flipWhen: '—', impact: f.description || '' };
          const isActive = f.is_active ?? f.enabled ?? false;
          return (
            <Card key={name}>
              <div className="flex items-start gap-3">
                <Toggle checked={isActive} onChange={() => toggle(name, isActive)} disabled={busy === name} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-cocoa-800">{meta.label}</span>
                    {isActive ? <Pill tone="green">Active</Pill> : <Pill tone="cocoa">Off</Pill>}
                  </div>
                  <div className="text-[11px] text-cocoa-400 space-y-0.5">
                    <div>📌 Flip when: <span className="text-cocoa-600 font-semibold">{meta.flipWhen}</span></div>
                    <div>👁 {meta.impact}</div>
                    {f.updated_at && <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> Updated {new Date(f.updated_at).toLocaleString()}</div>}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Feature Flag">
        <div className="space-y-3">
          <p className="text-xs text-cocoa-500">Add a new toggle the student app can read via <code>/admin/feature-flags</code>. New flags default OFF so you can verify before going live.</p>
          <Field label="Flag name (lowercase, numbers, underscores)">
            <TextInput value={draft.feature_name} onChange={(e) => setDraft({ ...draft, feature_name: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })} placeholder="new_checkout_flow" />
          </Field>
          <Field label="What it controls">
            <TextInput value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Shows the new checkout flow to students" />
          </Field>
          <div className="flex items-center gap-2">
            <Toggle checked={draft.is_active} onChange={(v) => setDraft({ ...draft, is_active: v })} />
            <span className="text-xs text-cocoa-600">Enable immediately (default OFF)</span>
          </div>
          <button onClick={createFlag} disabled={creating || !draft.feature_name.trim()} className="w-full py-3 rounded-full flame-gradient text-white font-bold text-sm disabled:opacity-50">{creating ? 'Creating...' : 'Create Flag'}</button>
        </div>
      </Modal>
    </div>
  );
}

export function SystemSettings() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editKey, setEditKey] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [busy, setBusy] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try { setSettings(await mockApi.admin.getSystemSettings()); } catch { setSettings([]); }
    setLoading(false);
  };

  const save = async (key) => {
    setBusy(key);
    const orig = settings.find((s) => s.key === key);
    let val = editValue;
    if (Array.isArray(orig?.value)) {
      val = editValue.split(',').map((s) => s.trim()).filter(Boolean);
    } else if (!isNaN(val) && val !== '') {
      val = Number(val);
    } else if (val === 'true') {
      val = true;
    } else if (val === 'false') {
      val = false;
    }
    try {
      await mockApi.admin.updateSystemSetting(key, { value: val });
      toast({ title: 'Setting updated', description: `${key} saved successfully.` });
      setEditKey(null);
      await load();
    } catch (e) {
      toast({ title: 'Failed to save', description: e.message, variant: 'destructive' });
    }
    setBusy(null);
  };

  const toggleBool = async (key, current) => {
    setBusy(key);
    try {
      await mockApi.admin.updateSystemSetting(key, { value: !current });
      toast({ title: `${key} ${!current ? 'enabled' : 'disabled'}` });
      await load();
    } catch (e) {
      toast({ title: 'Failed to update', description: e.message, variant: 'destructive' });
    }
    setBusy(null);
  };

  if (loading) return <LoadingSpinner label="Loading settings..." />;
  if (!settings.length) return (
    <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-700">
      System settings are not available on your backend yet.
    </div>
  );

  return (
    <div className="space-y-2">
      {settings.map((s) => {
        const isBool = typeof s.value === 'boolean';
        return (
          <div key={s.key} className="rounded-2xl bg-white border border-cocoa-100 p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs font-mono text-cocoa-800">{s.key}</span>
              {isBool ? (
                <Toggle checked={s.value} onChange={() => toggleBool(s.key, s.value)} disabled={busy === s.key} />
              ) : editKey === s.key ? (
                <div className="flex gap-1.5">
                  <button onClick={() => save(s.key)} disabled={busy === s.key} className="px-3 py-1 rounded-lg bg-flame-600 text-white text-xs font-bold disabled:opacity-50"><Save className="w-3 h-3" /></button>
                  <button onClick={() => setEditKey(null)} className="px-3 py-1 rounded-lg bg-cocoa-100 text-cocoa-500 text-xs font-bold">Cancel</button>
                </div>
              ) : (
                <button onClick={() => { setEditKey(s.key); setEditValue(Array.isArray(s.value) ? s.value.join(', ') : String(s.value)); }} className="px-3 py-1 rounded-lg bg-cocoa-50 text-cocoa-500 text-xs font-bold">Edit</button>
              )}
            </div>
            <div className="text-[11px] text-cocoa-400 mb-2">{s.description}</div>
            {isBool ? (
              <div className="font-bold text-sm text-cocoa-800">{s.value ? 'Enabled' : 'Disabled'}</div>
            ) : editKey === s.key ? (
              <input value={editValue} onChange={(e) => setEditValue(e.target.value)} autoFocus className="w-full p-2 rounded-lg border border-flame-300 text-sm font-bold" />
            ) : (
              <div className="font-bold text-sm text-cocoa-800">{Array.isArray(s.value) ? s.value.join(', ') : String(s.value)}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}