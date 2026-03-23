'use client';

import { useState, useCallback } from 'react';
import { mockNotifications } from '@/lib/db';
import type { Notification } from '@/types';

export function useNotifications(routeId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    if (routeId) {
      return mockNotifications.filter(
        (n) => !n.routeId || n.routeId === routeId || n.targetRole === 'all'
      );
    }
    return mockNotifications;
  });

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

  return { notifications, unreadCount, markAsRead, markAllAsRead, addNotification };
}
