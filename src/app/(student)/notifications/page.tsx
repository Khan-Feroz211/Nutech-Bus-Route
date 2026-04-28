'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useNotifications } from '@/hooks/useNotifications';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatTime } from '@/lib/utils';
import type { NotificationPreferences } from '@/types';

const PREFS_STORAGE_KEY = 'nutech.notifications.preferences';

const DEFAULT_PREFS: NotificationPreferences = {
  busArrival: true,
  delays: true,
  announcements: true,
  tripStart: false,
};

export default function NotificationsPage() {
  const { data: session } = useSession();
  const assignedRouteId = (session?.user as Record<string, unknown>)?.assignedRouteId as string ?? 'route-a';

  const {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotifications(assignedRouteId);

  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_PREFS);
  const [prefsReady, setPrefsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PREFS_STORAGE_KEY);
      if (!raw) {
        setPrefsReady(true);
        return;
      }

      const parsed = JSON.parse(raw) as Partial<NotificationPreferences>;
      setPrefs((prev) => ({ ...prev, ...parsed }));
    } catch {
      // Ignore malformed localStorage values and continue with defaults.
    } finally {
      setPrefsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!prefsReady) return;
    window.localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs));
  }, [prefs, prefsReady]);

  function togglePref(key: keyof NotificationPreferences) {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  }

  const notifTypeConfig: Record<string, { icon: string; color: string }> = {
    arrival: { icon: '🚌', color: 'bg-green-50 border-green-200' },
    delay: { icon: '⏱️', color: 'bg-yellow-50 border-yellow-200' },
    warning: { icon: '⚠️', color: 'bg-orange-50 border-orange-200' },
    system: { icon: '📢', color: 'bg-blue-50 border-blue-200' },
    info: { icon: 'ℹ️', color: 'bg-gray-50 border-gray-200' },
  };

  const visibleNotifications = useMemo(
    () =>
      notifications.filter((notif) => {
        if (notif.type === 'arrival') return prefs.busArrival;
        if (notif.type === 'delay') return prefs.delays;
        if (notif.type === 'system' || notif.type === 'warning' || notif.type === 'info') {
          return prefs.announcements;
        }
        return true;
      }),
    [notifications, prefs]
  );

  const visibleUnreadCount = visibleNotifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {visibleUnreadCount > 0 ? `${visibleUnreadCount} unread` : 'All caught up!'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Mark all read
            </Button>
          )}
          {visibleNotifications.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearAllNotifications}>
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Notification list */}
      <div className="space-y-2">
        {loading ? (
          <Card className="text-center py-10">
            <div className="w-6 h-6 border-2 border-nutech-blue/30 border-t-nutech-blue rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-400">Loading notifications…</p>
          </Card>
        ) : visibleNotifications.length === 0 ? (
          <Card className="text-center py-10">
            <p className="text-4xl mb-2">🎉</p>
            <p className="font-medium text-gray-700">No notifications to show</p>
            <p className="text-sm text-gray-500 mt-1">Try enabling more notification categories below.</p>
          </Card>
        ) : (
          visibleNotifications.map((notif) => {
            const cfg = notifTypeConfig[notif.type] ?? notifTypeConfig.info;
            return (
              <div
                key={notif.id}
                className={`flex gap-3 p-3.5 rounded-xl border transition-all duration-200 hover:shadow-sm ${cfg.color} ${
                  notif.read ? 'opacity-70' : ''
                }`}
              >
                <span className="text-2xl flex-shrink-0">{cfg.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-medium ${notif.read ? 'text-gray-600' : 'text-gray-900'}`}>
                      {notif.title}
                    </p>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-nutech-blue flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatTime(notif.createdAt)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {!notif.read && (
                      <button
                        onClick={() => markAsRead(notif.id)}
                        className="text-xs text-nutech-blue hover:underline"
                      >
                        Mark as read
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notif.id)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Preferences */}
      <Card>
        <div className="flex items-center justify-between gap-3 mb-3">
          <h2 className="font-semibold text-gray-900">Notification Preferences</h2>
          <button
            onClick={() => setPrefs(DEFAULT_PREFS)}
            className="text-xs text-gray-600 hover:text-gray-900 hover:underline"
          >
            Reset defaults
          </button>
        </div>
        <div className="space-y-3">
          {(
            [
              { key: 'busArrival', label: 'Bus Arrival Alerts', desc: 'When bus is 5 min away' },
              { key: 'delays', label: 'Delay Notifications', desc: 'When route is delayed' },
              { key: 'announcements', label: 'Announcements', desc: 'Admin announcements' },
              { key: 'tripStart', label: 'Trip Started', desc: 'When driver starts trip' },
            ] as const
          ).map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">{label}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
              <button
                type="button"
                onClick={() => togglePref(key)}
                aria-label={`Toggle ${label}`}
                title={`Toggle ${label}`}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  prefs[key] ? 'bg-nutech-blue' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    prefs[key] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-gray-400 mt-3">Preferences are saved on this device.</p>
      </Card>
    </div>
  );
}
