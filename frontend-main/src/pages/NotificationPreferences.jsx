import React, { useState, useEffect } from 'react';
import { Bell, Mail, Package, Tag, Flame, Truck } from 'lucide-react';
import { mockApi } from '@/lib/mockApi';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function NotificationPreferences() {
  const [prefs, setPrefs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await mockApi.notifications.getPreferences();
        setPrefs(result);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  const toggle = async (key) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    setSaving(true);
    try {
      await mockApi.notifications.updatePreferences({ [key]: updated[key] });
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  if (loading || !prefs) return <LoadingSpinner label="Loading preferences..." />;

  const toggles = [
    { key: 'push_enabled', label: 'Push Notifications', desc: 'Receive push notifications on your device', icon: Bell },
    { key: 'email_enabled', label: 'Email Notifications', desc: 'Receive notifications via email', icon: Mail },
    { key: 'order_updates', label: 'Order Updates', desc: 'Status changes, confirmations, deliveries', icon: Package },
    { key: 'delivery_updates', label: 'Delivery Updates', desc: 'Rider assigned, out for delivery, arrived', icon: Truck },
    { key: 'hp_updates', label: 'HP Updates', desc: 'HP earned, pending unlocked, tier changes', icon: Flame },
    { key: 'promotions', label: 'Promotions', desc: 'Flash redeems, special offers, event reminders', icon: Tag },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="font-heading font-extrabold text-2xl text-cocoa-800">Notification Preferences</h1>

      <div className="space-y-2">
        {toggles.map(t => {
          const Icon = t.icon;
          const enabled = prefs[t.key];
          return (
            <div key={t.key} className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-cocoa-100">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${enabled ? 'bg-flame-50' : 'bg-cocoa-50'}`}>
                <Icon className={`w-5 h-5 ${enabled ? 'text-flame-600' : 'text-cocoa-300'}`} />
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm text-cocoa-800">{t.label}</div>
                <div className="text-xs text-cocoa-400">{t.desc}</div>
              </div>
              <button
                onClick={() => toggle(t.key)}
                className={`w-12 h-7 rounded-full p-1 transition-colors ${enabled ? 'flame-gradient' : 'bg-cocoa-200'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${enabled ? 'translate-x-5' : ''}`} />
              </button>
            </div>
          );
        })}
      </div>

      {saving && <p className="text-xs text-center text-cocoa-400">Saving...</p>}

      <div className="rounded-2xl bg-cocoa-50 border border-cocoa-100 p-4 text-xs text-cocoa-500">
        💡 Transactional notifications (order status, delivery updates) always send regardless of preferences. Promotional and streak notifications are throttled: max 3/day with a 6-hour minimum gap.
      </div>
    </div>
  );
}