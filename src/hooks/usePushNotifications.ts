'use client';

import { useEffect, useState } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let messaging: Messaging | null = null;

if (typeof window !== 'undefined' && firebaseConfig.apiKey) {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    messaging = getMessaging(app);
  } catch (error) {
    console.error('Firebase init error:', error);
  }
}

export function usePushNotifications() {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsSupported('Notification' in window && 'serviceWorker' in navigator);

    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  const requestPermission = async (): Promise<string | null> => {
    if (!messaging || !isSupported) {
      console.warn('Firebase messaging not available');
      return null;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);

      if (permission !== 'granted') {
        console.warn('Notification permission denied');
        return null;
      }

      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });

      if (token) {
        setFcmToken(token);
        
        // Save token to backend
        await fetch('/api/notifications/fcm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fcmToken: token }),
        });

        return token;
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
    }

    return null;
  };

  const onForegroundMessage = (callback: (payload: unknown) => void) => {
    if (!messaging) return () => {};

    return onMessage(messaging, (payload) => {
      callback(payload);
    });
  };

  const removeToken = async () => {
    try {
      await fetch('/api/notifications/fcm', { method: 'DELETE' });
      setFcmToken(null);
    } catch (error) {
      console.error('Error removing FCM token:', error);
    }
  };

  return {
    fcmToken,
    permissionStatus,
    isSupported: isSupported && !!messaging,
    requestPermission,
    onForegroundMessage,
    removeToken,
  };
}
