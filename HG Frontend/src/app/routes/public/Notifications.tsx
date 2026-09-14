'use client';

import { useState } from 'react';
import { Bell, CheckCheck, Settings } from 'lucide-react';
import { Link } from '@/lib/router';

const DEFAULT_NOTIFICATIONS = [
  { id: 'n1', title: 'Order update', body: 'ORD-002 is now preparing.', time: '5m ago', read: false },
  { id: 'n2', title: 'HP bonus', body: 'You earned 15 bonus HP from streak activity.', time: '2h ago', read: false },
  { id: 'n3', title: 'New marketplace drop', body: 'Holy Merch Pack is now live.', time: '1d ago', read: true },
];

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);
  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <main className="flex-1 pb-12 pt-4 md:pt-24">
      <div className="container mx-auto max-w-3xl space-y-5 px-4">
        <section className="flex items-center justify-between rounded-[2rem] border border-border bg-card p-5">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Notifications</h1>
            <p className="text-sm text-muted-foreground">{unreadCount} unread update(s)</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setNotifications((prev) => prev.map((entry) => ({ ...entry, read: true })))} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground"><CheckCheck size={13} /> Mark all</button>
            <Link to="/notification-preferences" className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"><Settings size={13} /> Preferences</Link>
          </div>
        </section>

        <section className="space-y-2">
          {notifications.map((notification) => (
            <button key={notification.id} onClick={() => setNotifications((prev) => prev.map((entry) => entry.id === notification.id ? { ...entry, read: true } : entry))} className={`w-full rounded-2xl border p-4 text-left ${notification.read ? 'border-border bg-card' : 'border-primary/35 bg-primary/5'}`}>
              <div className="flex items-start gap-3">
                <Bell size={15} className={notification.read ? 'text-muted-foreground' : 'text-primary'} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{notification.title}</p>
                  <p className="text-xs text-muted-foreground">{notification.body}</p>
                </div>
                <span className="text-[11px] text-muted-foreground">{notification.time}</span>
              </div>
            </button>
          ))}
        </section>
      </div>
    </main>
  );
};

export default NotificationsPage;
