'use client';

import { useState } from 'react';
import { AdminPage } from '@/app/layouts/AdminPage';
import { AdminModulePage } from '@/components/admin/AdminModulePage';
import { ADMIN_MODULE_ROWS } from '@/services/mocks/platform';
import { createBlast } from '@/services/api/notifications.service';
import { Send, Repeat } from 'lucide-react';
import { toast } from 'sonner';

export default function Page() {
  const [emailProvider, setEmailProvider] = useState<'default' | 'resend' | 'onesignal'>('default');
  const [notifyNewMatchesOnly, setNotifyNewMatchesOnly] = useState(false);
  const [blastTitle, setBlastTitle] = useState('');
  const [blastBody, setBlastBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleCreateBlast = async () => {
    if (!blastTitle.trim() || !blastBody.trim()) {
      toast.error('Title and message body are required.');
      return;
    }
    setIsSending(true);
    try {
      await createBlast({
        title: blastTitle.trim(),
        body: blastBody.trim(),
        email_provider: emailProvider === 'default' ? null : emailProvider,
        status: 'draft',
      });
      toast.success('Notification blast created successfully.');
      setBlastTitle('');
      setBlastBody('');
    } catch {
      toast.error('Unable to create blast for the specified campaign');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AdminPage title="Notification Centre" subtitle="Campaigns, transactional alerts, and lifecycle nudges">
      <div className="space-y-6">
        {/* Blast & Campaign Composer */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="font-display font-bold text-foreground text-lg flex items-center gap-2">
                <Send size={18} className="text-primary" /> Campaign & Blast Composer
              </h3>
              <p className="text-xs text-muted-foreground">Configure email provider and delivery settings for broadcasts.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Campaign Title</label>
              <input
                type="text"
                value={blastTitle}
                onChange={(e) => setBlastTitle(e.target.value)}
                placeholder="e.g. Midnight Crave Special 20% Off"
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Email Provider</label>
              <select
                value={emailProvider}
                onChange={(e) => setEmailProvider(e.target.value as 'default' | 'resend' | 'onesignal')}
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="default">Use default</option>
                <option value="resend">Resend</option>
                <option value="onesignal">OneSignal</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Message Body</label>
            <textarea
              rows={3}
              value={blastBody}
              onChange={(e) => setBlastBody(e.target.value)}
              placeholder="Enter message content..."
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          </div>

          {/* Recurring Campaign Toggle */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/40 p-4">
            <div className="flex items-center gap-3">
              <Repeat size={18} className="text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">Only notify new matches</p>
                <p className="text-xs text-muted-foreground">For recurring campaigns, skip users who were already notified in previous cycles.</p>
              </div>
            </div>
            <button
              onClick={() => setNotifyNewMatchesOnly(!notifyNewMatchesOnly)}
              className={`h-7 w-12 rounded-full p-1 transition-colors ${notifyNewMatchesOnly ? 'bg-primary' : 'bg-muted'}`}
            >
              <span className={`block h-5 w-5 rounded-full bg-white transition-transform ${notifyNewMatchesOnly ? 'translate-x-5' : ''}`} />
            </button>
          </div>

          <button
            onClick={handleCreateBlast}
            disabled={isSending}
            className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSending ? 'Creating Blast...' : 'Create & Schedule Blast'}
          </button>
        </div>

        <AdminModulePage title="Notification Log & Scheduled Triggers" description="Prepare push, SMS, and in-app notification flows with reusable table and modal patterns." rows={ADMIN_MODULE_ROWS.notifications} />
      </div>
    </AdminPage>
  );
}
