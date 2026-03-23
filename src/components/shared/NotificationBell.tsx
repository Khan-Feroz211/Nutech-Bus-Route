'use client';

import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { formatTime } from '@/lib/utils';

interface NotificationBellProps {
  light?: boolean;
}

export default function NotificationBell({ light }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const textColor = light ? 'text-white' : 'text-gray-700';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((o) => !o)}
        className={`relative p-2 rounded-lg hover:bg-white/10 transition-colors ${textColor}`}
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-nutech-blue hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-6">No notifications</p>
              ) : (
                notifications.slice(0, 6).map((notif) => (
                  <button
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                      !notif.read ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-base mt-0.5">{getNotifIcon(notif.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${!notif.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{notif.message}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatTime(notif.createdAt)}
                        </p>
                      </div>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-nutech-blue flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function getNotifIcon(type: string): string {
  switch (type) {
    case 'arrival': return '🚌';
    case 'delay': return '⏱️';
    case 'warning': return '⚠️';
    case 'system': return '📢';
    default: return 'ℹ️';
  }
}
