import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import AdminHp from './AdminHp';
import { liveApi as mockApi } from '@/lib/liveApi';
import { Card, Pill, SectionHeader } from './AdminShared';
import { toast } from '@/components/ui/use-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

// Unified "HP & Multipliers" page — everything HP-multiplier related in one
// place instead of spread across the HP panel and the Menu page:
//   1. The HP report + bulk/manual grants (reused from AdminHp).
//   2. Per-item HP multiplier controls (per-item, with ½× / 1× / 2× toggles).
//   3. The global HP multiplier system setting.
// "Rewards multiplier" and "flash-order multiplier" are intentionally absent —
// they don't exist on the backend, so we don't surface them.
export default function AdminHpMultipliers() {
  return (
    <div className="space-y-6">
      <AdminHp />
      <PerItemMultipliers />
      <GlobalMultiplier />
    </div>
  );
}

function PerItemMultipliers() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);

  const load = async () => {
    setLoading(true);
    try { setItems(await mockApi.admin.getMenuItems()); } catch { setItems([]); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const setMultiplier = async (id, multiplier, name) => {
    setBusy(id);
    try {
      await mockApi.admin.updateMenuItemHpMultiplier(id, { multiplier });
      toast({ title: '✅ HP multiplier updated', description: `${multiplier === 2 ? 'Double' : multiplier === 0.5 ? 'Half' : 'Normal'} HP earning for "${name}".` });
      await load();
    } catch (e) { toast({ title: 'Failed', description: e.message, variant: 'destructive' }); }
    setBusy(null);
  };

  if (loading) return <LoadingSpinner label="Loading menu items..." />;

  const OPTS = [{ m: 0.5, l: '½×' }, { m: 1, l: '1×' }, { m: 2, l: '2×' }];

  return (
    <Card>
      <SectionHeader title="Per-Item HP Multipliers" action={<Pill tone="flame">menu</Pill>} />
      <p className="text-[11px] text-cocoa-400 mb-3">Set how much HP each menu item earns. 2× doubles, ½ halves, 1× is normal.</p>
      <div className="space-y-2">
        {items.map((it) => (
          <div key={it.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-cocoa-50">
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm text-cocoa-800 truncate">{it.name}</div>
              <div className="text-[11px] text-cocoa-400">{it.hp_earn_value} HP base · {it.menu_categories?.name || ''}</div>
            </div>
            <div className="flex gap-1">
              {OPTS.map((opt) => (
                <button
                  key={opt.m}
                  onClick={() => setMultiplier(it.id, opt.m, it.name)}
                  disabled={busy === it.id}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold disabled:opacity-50 ${it.hp_multiplier === opt.m ? 'bg-flame-600 text-white' : 'bg-white border border-cocoa-200 text-cocoa-600'}`}
                >
                  {opt.l}
                </button>
              ))}
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-xs text-cocoa-400 text-center py-4">No menu items yet.</p>}
      </div>
    </Card>
  );
}

function GlobalMultiplier() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editKey, setEditKey] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [busy, setBusy] = useState(null);

  const load = async () => {
    setLoading(true);
    try { setSettings(await mockApi.admin.getSystemSettings()); } catch { setSettings([]); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const multiplierSettings = settings.filter((s) => /hp[_-]?multiplier/i.test(s.key || ''));

  const save = async (key) => {
    setBusy(key);
    let val = editValue;
    if (!isNaN(val) && val !== '') val = Number(val);
    try {
      await mockApi.admin.updateSystemSetting(key, { value: val });
      toast({ title: 'Global multiplier saved' });
      setEditKey(null);
      await load();
    } catch (e) { toast({ title: 'Failed', description: e.message, variant: 'destructive' }); }
    setBusy(null);
  };

  if (loading) return <LoadingSpinner label="Loading settings..." />;

  return (
    <Card>
      <SectionHeader title="Global HP Multiplier" action={<Pill tone="cocoa">system</Pill>} />
      <p className="text-[11px] text-cocoa-400 mb-3">Site-wide HP multiplier from system settings. Edit here or under Settings → System Settings.</p>
      {multiplierSettings.length === 0 ? (
        <div className="text-xs text-cocoa-400">No global HP multiplier setting found on the backend yet. Manage all settings under Settings → System Settings.</div>
      ) : multiplierSettings.map((s) => (
        <div key={s.key} className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-cocoa-50">
          <div className="min-w-0">
            <div className="font-mono text-xs font-bold text-cocoa-800">{s.key}</div>
            <div className="text-[11px] text-cocoa-400 truncate">{s.description || ''}</div>
          </div>
          {editKey === s.key ? (
            <div className="flex gap-1.5 shrink-0">
              <input value={editValue} onChange={(e) => setEditValue(e.target.value)} autoFocus className="w-24 p-2 rounded-lg border border-flame-300 text-sm font-bold" />
              <button onClick={() => save(s.key)} disabled={busy === s.key} className="px-3 py-1 rounded-lg bg-flame-600 text-white text-xs font-bold disabled:opacity-50"><Save className="w-3 h-3" /></button>
              <button onClick={() => setEditKey(null)} className="px-3 py-1 rounded-lg bg-cocoa-100 text-cocoa-500 text-xs font-bold">Cancel</button>
            </div>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-bold text-sm text-cocoa-800">{String(s.value)}</span>
              <button onClick={() => { setEditKey(s.key); setEditValue(String(s.value)); }} className="px-3 py-1 rounded-lg bg-cocoa-100 text-cocoa-500 text-xs font-bold">Edit</button>
            </div>
          )}
        </div>
      ))}
    </Card>
  );
}