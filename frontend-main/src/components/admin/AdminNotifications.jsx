import React, { useState, useEffect } from 'react';
import { Send, Bell } from 'lucide-react';
import { liveApi as mockApi } from '@/lib/liveApi';
import { timeAgo } from '@/lib/hgUtils';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Field, TextInput, Card } from './AdminShared';
import { toast } from '@/components/ui/use-toast';

// Map the visible segment dropdown to the object shape the backend expects
// (spec: "segment filter is optional but must be a valid object"). "All users"
// omits the segment key entirely.
const SEGMENT_OBJECT = {
  all: null,
  tier_ember: { tier: 'ember' },
  tier_flame: { tier: 'flame' },
  tier_blaze: { tier: 'blaze' },
  tier_holy: { tier: 'holy' },
  dormant: { status: 'dormant' },
  riders: { role: 'rider' },
};

export default function AdminNotifications() {
  const [segment, setSegment] = useState('all');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [channels, setChannels] = useState(['push', 'in_app']);
  const [sending, setSending] = useState(false);
  const [blasts, setBlasts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { setBlasts(await mockApi.admin.getNotificationBlasts()); }
    catch { setBlasts([]); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const toggleChannel = (id, checked) => setChannels(checked ? [...channels, id] : channels.filter((x) => x !== id));
  const valid = title.trim() && body.trim() && channels.length > 0;

  const send = async () => {
    if (!valid) { toast({ title: 'Missing fields', description: 'Title, body and at least one channel are required.', variant: 'destructive' }); return; }
    setSending(true);
    try {
      const payload = { title: title.trim(), body: body.trim(), channels };
      const seg = SEGMENT_OBJECT[segment];
      if (seg) payload.segment = seg;
      await mockApi.admin.sendNotificationBlast(payload);
      toast({ title: '🔔 Blast sent' });
      setTitle(''); setBody(''); await load();
    } catch (e) { toast({ title: 'Failed to send', description: e.message, variant: 'destructive' }); }
    setSending(false);
  };

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="font-bold text-sm text-cocoa-800 mb-3 flex items-center gap-2"><Bell className="w-4 h-4 text-flame-600" /> Send Notification Blast</h3>
        <div className="space-y-3">
          <Field label="Segment (optional)" hint="Filters who receives the blast. Leave as 'All users' to send to everyone.">
            <select value={segment} onChange={(e) => setSegment(e.target.value)} className="w-full mt-1 p-2.5 rounded-xl border border-cocoa-200 text-sm">
              <option value="all">All users</option>
              <option value="tier_ember">Ember tier</option>
              <option value="tier_flame">Flame tier</option>
              <option value="tier_blaze">Blaze tier</option>
              <option value="tier_holy">Holy tier</option>
              <option value="dormant">Dormant users (30d)</option>
              <option value="riders">Riders only</option>
            </select>
          </Field>
          <Field label="Title (required)"><TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. New menu drop is live 🔥" /></Field>
          <Field label="Body (required)"><textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} className="w-full mt-1 p-2.5 rounded-xl border border-cocoa-200 text-sm" placeholder="Write the notification message..." /></Field>
          <Field label="Channels (at least one required)" hint="Push = mobile notification, In-App = the notifications inbox, Email = email to registered users.">
            <div className="flex gap-4 mt-1 flex-wrap">
              {[{ id: 'push', label: 'Push' }, { id: 'in_app', label: 'In-App' }, { id: 'email', label: 'Email' }].map((c) => (
                <label key={c.id} className="flex items-center gap-1.5 text-sm text-cocoa-600 font-semibold">
                  <input type="checkbox" checked={channels.includes(c.id)} onChange={(e) => toggleChannel(c.id, e.target.checked)} />
                  {c.label}
                </label>
              ))}
            </div>
          </Field>
          <button onClick={send} disabled={sending || !valid} className="w-full py-3 rounded-full flame-gradient text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"><Send className="w-4 h-4" /> {sending ? 'Sending...' : 'Send Blast'}</button>
        </div>
      </Card>
      <div>
        <h3 className="font-bold text-sm text-cocoa-800 mb-2">Recent Blasts</h3>
        {loading ? <LoadingSpinner label="Loading..." /> : blasts.length === 0 ? (
          <p className="text-xs text-cocoa-400 text-center py-6">No blasts sent yet.</p>
        ) : blasts.map((b) => (
          <div key={b.id} className="rounded-2xl bg-white border border-cocoa-100 p-3 mb-2">
            <div className="flex items-center justify-between"><span className="font-bold text-sm text-cocoa-800">{b.title}</span><span className="text-xs text-cocoa-400">{timeAgo(b.sent_at)}</span></div>
            <p className="text-xs text-cocoa-500 mt-1">{b.body}</p>
            <div className="text-[10px] text-flame-600 font-bold mt-1">{Array.isArray(b.channels) ? b.channels.join(', ') : (b.segment || 'all')} · {b.recipients ?? '—'} recipients</div>
          </div>
        ))}
      </div>
    </div>
  );
}