import React, { useState, useEffect } from 'react';
import { Clock, ScrollText, Play, Server } from 'lucide-react';
import { liveApi as mockApi } from '@/lib/liveApi';
import { timeAgo } from '@/lib/hgUtils';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toast } from '@/components/ui/use-toast';

export default function AdminSystem() {
  const [tab, setTab] = useState('cron');
  return (
    <div className="space-y-4">
      <div className="flex gap-1 p-1 rounded-full bg-cocoa-100">
        {[
          { id: 'cron', label: 'Cron Jobs', icon: Clock },
          { id: 'audit', label: 'Audit Log', icon: ScrollText },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-bold transition-all ${tab === t.id ? 'bg-white text-flame-600 shadow-sm' : 'text-cocoa-500'}`}>
            <t.icon className="w-3.5 h-3.5" />{t.label}
          </button>
        ))}
      </div>
      {tab === 'cron' ? <CronJobs /> : <AuditLog />}
    </div>
  );
}

function CronJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await mockApi.admin.getCronStatus();
      // getCronStatus normalizes the live { jobs: { "birthday-hp": {...}, ... } } shape into
      // an array of real triggerable jobs — no assumed names.
      setJobs(Array.isArray(res) ? res : []);
    } catch { setJobs([]); }
    setLoading(false);
  };

  const run = async (job) => {
    setBusy(job);
    try {
      await mockApi.admin.triggerCron(job);
      toast({ title: '✅ Cron job triggered', description: `${job} ran successfully.` });
      await load();
    } catch (e) {
      toast({ title: 'Cron trigger failed', description: e.message, variant: 'destructive' });
    }
    setBusy(null);
  };

  if (loading) return <LoadingSpinner label="Loading cron..." />;

  return (
    <div className="space-y-2">
      <div className="rounded-xl bg-cocoa-50 border border-cocoa-100 p-3 text-xs text-cocoa-500 flex items-center gap-1.5">
        <Server className="w-3.5 h-3.5" /> Scheduled jobs run automatically. Trigger manually below for testing/operations.
      </div>
      {jobs.map((j) => {
        const ok = j.status === 'ok' || j.status === 'success';
        const never = j.status === 'never_run' || !j.status;
        return (
        <div key={j.job} className="rounded-2xl bg-white border border-cocoa-100 p-3 flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${ok ? 'bg-green-500' : never ? 'bg-cocoa-300' : 'bg-red-500'}`} />
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm text-cocoa-800 font-mono truncate">{j.job}</div>
            <div className="text-xs text-cocoa-400">Last run: {j.last_triggered ? timeAgo(j.last_triggered) : 'Never'} · {j.cadence || '—'}</div>
          </div>
          <span className={`text-[10px] font-bold hidden sm:inline ${ok ? 'text-green-600' : never ? 'text-cocoa-400' : 'text-red-600'}`}>{never ? 'never run' : j.status}</span>
          <button onClick={() => run(j.job)} disabled={busy === j.job}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-cocoa-800 text-white text-xs font-bold disabled:opacity-50">
            {busy === j.job ? <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Play className="w-3 h-3" />}
            Run
          </button>
        </div>
        );
      })}
      {jobs.length === 0 && <p className="text-xs text-cocoa-400 text-center py-6">No cron status available.</p>}
    </div>
  );
}

function AuditLog() {
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setLog(await mockApi.admin.getAuditLog()); }
      catch { setLog([]); }
      setLoading(false);
    })();
  }, []);

  if (loading) return <LoadingSpinner label="Loading log..." />;

  return (
    <div className="space-y-2">
      {log.map((e) => (
        <div key={e.id} className="rounded-2xl bg-white border border-cocoa-100 p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-xs text-cocoa-800 font-mono">{e.action}</span>
            <span className="text-xs text-cocoa-400">{timeAgo(e.created_at)}</span>
          </div>
          <div className="text-xs text-cocoa-500 space-y-0.5">
            {e.entity_type && <div><span className="text-cocoa-400">entity:</span> {e.entity_type}{e.entity_id ? ` · ${String(e.entity_id).slice(0,8)}` : ''}</div>}
            {(e.before_value != null || e.after_value != null) && <div><span className="text-cocoa-400">change:</span> {e.before_value != null ? JSON.stringify(e.before_value) : '∅'} → {e.after_value != null ? JSON.stringify(e.after_value) : '∅'}</div>}
            {e.metadata && Object.keys(e.metadata).length > 0 && <div><span className="text-cocoa-400">meta:</span> {JSON.stringify(e.metadata)}</div>}
            {e.actor_role && <div><span className="text-cocoa-400">by:</span> {e.actor_role}{e.actor_id ? ` · ${String(e.actor_id).slice(0,8)}` : ''}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}