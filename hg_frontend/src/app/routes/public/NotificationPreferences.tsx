'use client';

import { useEffect, useState } from 'react';
import { Bell, Flame, Mail, Package, Tag, Truck } from 'lucide-react';
import {
  getNotificationPreferences,
  subscribePush,
  unsubscribePush,
  updateNotificationPreferences,
  type NotificationPreferences,
} from '@/services/api/notifications.service';
import { toast } from 'sonner';

const PREF_CONFIG: Array<{
  key: keyof NotificationPreferences;
  label: string;
  desc: string;
  icon: typeof Bell;
}> = [
  { key: 'push_enabled', label: 'Push notifications', desc: 'Receive updates on this device', icon: Bell },
  { key: 'email_enabled', label: 'Email notifications', desc: 'Receive updates in your inbox', icon: Mail },
  { key: 'order_updates', label: 'Order updates', desc: 'Status changes, confirmations, and delivery progress', icon: Package },
  { key: 'delivery_updates', label: 'Delivery updates', desc: 'Rider assignment and ETA nudges', icon: Truck },
  { key: 'hp_updates', label: 'HP updates', desc: 'Earned and redeemed HP notices', icon: Flame },
  { key: 'promotions', label: 'Promotions', desc: 'Deals and campaign messages', icon: Tag },
];

const NotificationPreferencesPage = () => {
  const [prefs, setPrefs] = useState<NotificationPreferences>({
    push_enabled: true,
    email_enabled: true,
    order_updates: true,
    delivery_updates: true,
    hp_updates: true,
    promotions: true,
  });
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  useEffect(() => {
    getNotificationPreferences()
      .then((data) => {
        if (data) setPrefs(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (key: keyof NotificationPreferences) => {
    const newValue = !prefs[key];
    const updated = { ...prefs, [key]: newValue };
    setPrefs(updated);
    setSavingKey(key);

    try {
      await updateNotificationPreferences({ [key]: newValue });
      if (key === 'push_enabled') {
        if (newValue) {
          await subscribePush({ device_label: typeof navigator !== 'undefined' ? navigator.userAgent : 'Web' });
        } else {
          await unsubscribePush();
        }
      }
      toast.success('Notification settings updated.');
    } catch {
      setPrefs(prefs); // rollback
      toast.error('Failed to update notification preferences.');
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <main className="flex-1 pb-12 pt-4 md:pt-24">
      <div className="container mx-auto max-w-3xl space-y-5 px-4">
        <section className="rounded-[2rem] border border-border bg-card p-5">
          <h1 className="font-display text-3xl font-bold text-foreground">Notification Preferences</h1>
          <p className="mt-1 text-sm text-muted-foreground">Control which updates you receive.</p>
        </section>
        <section className="space-y-2">
          {loading ? (
            <div className="text-center py-8 text-sm text-muted-foreground">Loading preferences...</div>
          ) : (
            PREF_CONFIG.map((pref) => {
              const Icon = pref.icon;
              const enabled = Boolean(prefs[pref.key]);
              const isSaving = savingKey === pref.key;

              return (
                <div key={pref.key} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
                  <Icon size={16} className={enabled ? 'text-primary' : 'text-muted-foreground'} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{pref.label}</p>
                    <p className="text-xs text-muted-foreground">{pref.desc}</p>
                  </div>
                  <button
                    disabled={isSaving}
                    onClick={() => handleToggle(pref.key)}
                    className={`h-7 w-12 rounded-full p-1 transition-colors ${enabled ? 'bg-primary' : 'bg-secondary'} ${isSaving ? 'opacity-50' : ''}`}
                  >
                    <span className={`block h-5 w-5 rounded-full bg-white transition-transform ${enabled ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
              );
            })
          )}
        </section>
      </div>
    </main>
  );
};

export default NotificationPreferencesPage;
