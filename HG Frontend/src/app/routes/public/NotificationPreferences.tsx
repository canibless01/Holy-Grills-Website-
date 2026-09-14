'use client';

import { useState } from 'react';
import { Bell, Flame, Mail, Package, Tag, Truck } from 'lucide-react';

const NotificationPreferencesPage = () => {
  const [prefs, setPrefs] = useState([
    { key: 'push', label: 'Push notifications', desc: 'Receive updates on this device', icon: Bell, enabled: true },
    { key: 'email', label: 'Email notifications', desc: 'Receive updates in your inbox', icon: Mail, enabled: true },
    { key: 'order', label: 'Order updates', desc: 'Status changes, confirmations, and delivery progress', icon: Package, enabled: true },
    { key: 'delivery', label: 'Delivery updates', desc: 'Rider assignment and ETA nudges', icon: Truck, enabled: true },
    { key: 'hp', label: 'HP updates', desc: 'Earned and redeemed HP notices', icon: Flame, enabled: true },
    { key: 'promo', label: 'Promotions', desc: 'Deals and campaign messages', icon: Tag, enabled: false },
  ]);

  return (
    <main className="flex-1 pb-12 pt-4 md:pt-24">
      <div className="container mx-auto max-w-3xl space-y-5 px-4">
        <section className="rounded-[2rem] border border-border bg-card p-5">
          <h1 className="font-display text-3xl font-bold text-foreground">Notification Preferences</h1>
          <p className="mt-1 text-sm text-muted-foreground">Control which updates you receive.</p>
        </section>
        <section className="space-y-2">
          {prefs.map((pref) => (
            <div key={pref.key} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
              <pref.icon size={16} className={pref.enabled ? 'text-primary' : 'text-muted-foreground'} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{pref.label}</p>
                <p className="text-xs text-muted-foreground">{pref.desc}</p>
              </div>
              <button onClick={() => setPrefs((prev) => prev.map((entry) => entry.key === pref.key ? { ...entry, enabled: !entry.enabled } : entry))} className={`h-7 w-12 rounded-full p-1 ${pref.enabled ? 'bg-primary' : 'bg-secondary'}`}>
                <span className={`block h-5 w-5 rounded-full bg-white transition-transform ${pref.enabled ? 'translate-x-5' : ''}`} />
              </button>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
};

export default NotificationPreferencesPage;
