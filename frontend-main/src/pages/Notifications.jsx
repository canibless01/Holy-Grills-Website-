import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, Settings } from 'lucide-react';
import { useHolyGrill } from '@/lib/HolyGrillContext';
import { timeAgo, NOTIFICATION_ICONS } from '@/lib/hgUtils';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Notifications() {
  const navigate = useNavigate();
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead, refreshNotifications } = useHolyGrill();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshNotifications().then(() => setLoading(false));
  }, []);

  const handleClick = async (notif) => {
    const isRead = !!(notif.read_at || notif.is_read);
    if (!isRead) await markNotificationRead(notif.id);
  };

  if (loading) return <LoadingSpinner label="Loading notifications..." />;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-heading font-extrabold text-2xl text-cocoa-800">Notifications</h1>
        <div className="flex gap-1">
          {unreadCount > 0 && (
            <button onClick={markAllNotificationsRead} className="flex items-center gap-1 px-3 py-2 rounded-lg bg-cocoa-800 text-white text-xs font-bold">
              <CheckCheck className="w-3.5 h-3.5" /> Mark all
            </button>
          )}
          <button onClick={() => navigate('/notification-preferences')} className="p-2 rounded-lg bg-white border border-amber-700/20" aria-label="Notification settings">
            <Settings className="w-4 h-4 text-cocoa-400" />
          </button>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="w-12 h-12 text-cocoa-200 mx-auto mb-2" />
          <p className="text-sm text-cocoa-400">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(notif => (
            <button
              key={notif.id}
              onClick={() => handleClick(notif)}
              className={`w-full text-left rounded-xl border p-3 transition-all hover:shadow-sm ${
                (notif.read_at || notif.is_read) ? 'bg-cocoa-50 border-amber-700/15' : 'bg-cocoa-50 border-amber-700/40'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl flex-shrink-0">{NOTIFICATION_ICONS[notif.type] || '🔔'}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-sm text-cocoa-800 truncate">{notif.title}</h3>
                    <span className="text-xs text-cocoa-400 flex-shrink-0">{timeAgo(notif.created_at)}</span>
                  </div>
                  <p className="text-xs text-cocoa-500 mt-0.5">{notif.body}</p>
                </div>
                {!(notif.read_at || notif.is_read) && <div className="w-2 h-2 rounded-full bg-flame-600 flex-shrink-0 mt-2" />}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}