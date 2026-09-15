import React, { useState, useEffect } from 'react';
import { Save, Plus, X, Gift, Clock } from 'lucide-react';
import { liveApi as mockApi } from '@/lib/liveApi';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toast } from '@/components/ui/use-toast';
import { Card, Field, TextInput, Pill, SectionHeader } from './AdminShared';

export default function AdminFreeCredits() {
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sideOptions, setSideOptions] = useState([]);
  const [newOption, setNewOption] = useState('');
  const [validityDays, setValidityDays] = useState(60);
  const [savingOptions, setSavingOptions] = useState(false);
  const [savingValidity, setSavingValidity] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [creditsData, settings] = await Promise.all([
        mockApi.admin.getFreeSideCreditsAdmin().catch(() => []),
        mockApi.admin.getSystemSettings().catch(() => []),
      ]);
      setCredits(creditsData);
      const optsSetting = settings.find(s => s.key === 'free_side_options');
      const valSetting = settings.find(s => s.key === 'free_side_credits_validity_days');
      setSideOptions(Array.isArray(optsSetting?.value) ? optsSetting.value : []);
      setValidityDays(valSetting?.value || 60);
    } catch { /* empty state */ }
    setLoading(false);
  };

  const addOption = () => {
    if (!newOption.trim()) return;
    setSideOptions([...sideOptions, newOption.trim()]);
    setNewOption('');
  };

  const removeOption = (idx) => setSideOptions(sideOptions.filter((_, i) => i !== idx));

  const saveOptions = async () => {
    setSavingOptions(true);
    try {
      await mockApi.admin.updateFreeSideOptions({ value: sideOptions });
      toast({ title: '✅ Side options updated', description: `${sideOptions.length} sides are now available for free side credits.` });
    } catch (e) {
      toast({ title: 'Failed to save', description: e.message, variant: 'destructive' });
    }
    setSavingOptions(false);
  };

  const saveValidity = async () => {
    setSavingValidity(true);
    try {
      await mockApi.admin.updateFreeSideValidityDays({ value: Number(validityDays) });
      toast({ title: '✅ Validity updated', description: `Free side credits now expire after ${validityDays} days.` });
    } catch (e) {
      toast({ title: 'Failed to save', description: e.message, variant: 'destructive' });
    }
    setSavingValidity(false);
  };

  if (loading) return <LoadingSpinner label="Loading free credits..." />;

  return (
    <div className="space-y-5">
      <div>
        <SectionHeader title="User Free Side Credits" action={<Pill tone="flame">{credits.length} users</Pill>} />
        <p className="text-xs text-cocoa-400 mb-3">Students with active free side credits from leaderboard rewards. Credits decrement automatically when spent at checkout.</p>
        {credits.length === 0 ? (
          <Card><p className="text-xs text-cocoa-400 text-center py-4">No users with free side credits yet.</p></Card>
        ) : (
          <div className="space-y-2">
            {credits.map((c) => (
              <Card key={c.user_id || c.id}>
                <div className="flex items-center gap-3">
                  <Gift className="w-5 h-5 text-flame-500" />
                  <div className="flex-1">
                    <div className="font-bold text-sm text-cocoa-800">{c.user_name || c.full_name || 'User'}</div>
                    <div className="text-xs text-cocoa-400">{c.credits_remaining || c.count || 0} credits remaining</div>
                  </div>
                  {c.expires_at && (
                    <div className="text-right">
                      <div className="text-[10px] text-cocoa-400 flex items-center gap-0.5"><Clock className="w-3 h-3" /> Expires</div>
                      <div className="text-xs font-bold text-cocoa-700">{new Date(c.expires_at).toLocaleDateString()}</div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Card>
        <SectionHeader title="Available Side Options" action={<Pill tone="blue">config</Pill>} />
        <p className="text-xs text-cocoa-400 mb-3">These are the sides students can choose from when redeeming a free side credit.</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {sideOptions.map((opt, idx) => (
            <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cocoa-100 text-sm text-cocoa-700">
              {opt}
              <button onClick={() => removeOption(idx)} className="text-cocoa-400 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newOption} onChange={(e) => setNewOption(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addOption()} placeholder="e.g. Coleslaw, Fries, Plantain" className="flex-1 p-2.5 rounded-xl border border-cocoa-200 text-sm" />
          <button onClick={addOption} className="flex items-center gap-1 px-3 py-2 rounded-xl bg-cocoa-100 text-cocoa-700 text-sm font-bold"><Plus className="w-4 h-4" /> Add</button>
        </div>
        <button onClick={saveOptions} disabled={savingOptions} className="flex items-center gap-1.5 mt-3 px-4 py-2 rounded-full flame-gradient text-white text-xs font-bold disabled:opacity-50">
          <Save className="w-3.5 h-3.5" /> {savingOptions ? 'Saving...' : 'Save Side Options'}
        </button>
      </Card>

      <Card>
        <SectionHeader title="Credit Validity Period" action={<Pill tone="amber">expiry</Pill>} />
        <p className="text-xs text-cocoa-400 mb-3">How long free side credits remain valid before they expire. Default is 60 days.</p>
        <div className="flex items-end gap-3">
          <Field label="Validity (days)">
            <TextInput type="number" value={validityDays} onChange={(e) => setValidityDays(e.target.value)} className="w-32" />
          </Field>
          <button onClick={saveValidity} disabled={savingValidity} className="flex items-center gap-1.5 px-4 py-2.5 rounded-full flame-gradient text-white text-xs font-bold disabled:opacity-50">
            <Save className="w-3.5 h-3.5" /> {savingValidity ? 'Saving...' : 'Save Validity'}
          </button>
        </div>
      </Card>
    </div>
  );
}