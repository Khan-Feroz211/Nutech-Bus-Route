'use client';

import { useState, useEffect, useCallback } from 'react';
import { mockNotifications } from '@/lib/db';
import type { Notification } from '@/types';

function filterByRoute(list: Notification[], routeId?: string): Notification[] {
  if (!routeId) return list;
  return list.filter(
    (n) => !n.routeId || n.routeId === routeId || n.targetRole === 'all'
  );
}

function normalise(n: Record<string, unknown>): Notification {
  return {
    ...(n as unknown as Notification),
    createdAt: new Date(n.createdAt as string),
    read: (n.read as boolean) ?? false,
  };
}

export function useNotifications(routeId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch('/api/notifications')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.success && Array.isArray(data.data)) {
          const all = (data.data as Record<string, unknown>[]).map(normalise);
          setNotifications(filterByRoute(all, routeId));
        } else {
          setNotifications(filterByRoute(mockNotifications, routeId));
        }
      })
      .catch(() => {
        if (!cancelled) setNotifications(filterByRoute(mockNotifications, routeId));
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeId]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const addNotification = useCallback((notif: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newNotif: Notification = {
      ...notif,
      id: `notif-${Date.now()}`,
      createdAt: new Date(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  }, []);

  return { notifications, loading, unreadCount, markAsRead, markAllAsRead, addNotification };
}
