'use client';

import { useEffect, useState } from 'react';
import { Bell, CheckCheck, Settings } from 'lucide-react';
import { Link, useNavigate } from '@/lib/router';
import { getNotifications, markAllNotificationsRead, markNotificationRead, type NotificationItem } from '@/services/api/notifications.service';
import { toast } from 'sonner';

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  { id: 'n1', title: 'Order update', body: 'ORD-002 is now preparing.', created_at: '5m ago', read: false, read_at: null },
  { id: 'n2', title: 'HP bonus', body: 'You earned 15 bonus HP from streak activity.', created_at: '2h ago', read: false, read_at: null },
  { id: 'n3', title: 'New marketplace drop', body: 'Holy Merch Pack is now live.', created_at: '1d ago', read: true, read_at: new Date().toISOString() },
];

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>(DEFAULT_NOTIFICATIONS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNotifications()
      .then((data) => {
        if (data && data.length > 0) {
          setNotifications(data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const unreadCount = notifications.filter((item) => !item.read).length;

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((entry) => ({ ...entry, read: true, read_at: new Date().toISOString() })));
      toast.success('All notifications marked as read.');
    } catch {
      toast.error('Failed to mark all notifications as read.');
    }
  };

  const handleNotificationClick = async (item: NotificationItem) => {
    if (!item.read) {
      try {
        await markNotificationRead(item.id);
      } catch {
        // ignore failure on UI click fallback
      }
      setNotifications((prev) => prev.map((entry) => entry.id === item.id ? { ...entry, read: true, read_at: new Date().toISOString() } : entry));
    }
    if (item.action_url) {
      navigate(item.action_url);
    }
  };

  return (
    <main className="flex-1 pb-12 pt-4 md:pt-24">
      <div className="container mx-auto max-w-3xl space-y-5 px-4">
        <section className="flex items-center justify-between rounded-[2rem] border border-border bg-card p-5">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Notifications</h1>
            <p className="text-sm text-muted-foreground">{unreadCount} unread update(s)</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleMarkAllRead} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground"><CheckCheck size={13} /> Mark all</button>
            <Link to="/notification-preferences" className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"><Settings size={13} /> Preferences</Link>
          </div>
        </section>

        <section className="space-y-2">
          {loading ? (
            <div className="text-center py-8 text-sm text-muted-foreground">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border border-dashed border-border p-6 text-muted-foreground">
              <Bell size={24} className="mx-auto mb-2 text-muted-foreground/60" />
              <p className="text-sm font-semibold">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <button key={notification.id} onClick={() => handleNotificationClick(notification)} className={`w-full rounded-2xl border p-4 text-left transition-colors ${notification.read ? 'border-border bg-card' : 'border-primary/35 bg-primary/5'}`}>
                <div className="flex items-start gap-3">
                  <Bell size={15} className={notification.read ? 'text-muted-foreground' : 'text-primary'} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">{notification.body}</p>
                  </div>
                  <span className="text-[11px] text-muted-foreground">{notification.created_at}</span>
                </div>
              </button>
            ))
          )}
        </section>
      </div>
    </main>
  );
};

export default NotificationsPage;
