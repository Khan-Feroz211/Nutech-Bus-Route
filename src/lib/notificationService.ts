import admin from 'firebase-admin';
import { prisma } from './prisma';
import { createLogger, logDebug, logWarn, logError } from './logger';

const nsLogger = createLogger('notificationService');

function isProbablyValidPrivateKey(value: string): boolean {
  const normalized = value.replace(/\\n/g, '\n').trim();
  return (
    normalized.startsWith('-----BEGIN PRIVATE KEY-----') &&
    normalized.endsWith('-----END PRIVATE KEY-----') &&
    !normalized.includes('...') &&
    !normalized.includes('your_')
  );
}

if (!admin.apps.length) {
  const pid = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;

  // Only initialize Firebase admin if all required service account fields are present.
  if (pid && clientEmail && privateKeyRaw && isProbablyValidPrivateKey(privateKeyRaw)) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: pid,
          clientEmail,
          privateKey: privateKeyRaw.replace(/\\n/g, '\n'),
        }),
      });
      nsLogger.info({ message: 'Firebase admin initialized' });
    } catch (error) {
      logError(error as Error, { component: 'notificationService', stage: 'initialize' });
      // If strict mode is enabled, fail fast in non-dev environments
      const failFast = process.env.FAIL_FAST_ON_MISSING_FIREBASE === 'true';
      if (failFast && process.env.NODE_ENV !== 'development') {
        throw error;
      } else {
        logDebug('Firebase admin init skipped or failed in dev', { err: String(error) });
      }
    }
  } else {
    const msg = 'Firebase admin not initialized: missing service account environment variables.';
    const failFast = process.env.FAIL_FAST_ON_MISSING_FIREBASE === 'true';
    if (failFast && process.env.NODE_ENV !== 'development') {
      // In strict mode fail the process so CI/prod surfaces the missing config immediately
      logError(new Error(msg), { component: 'notificationService', stage: 'validate' });
      throw new Error(msg);
    }
    // Otherwise log a warning and continue (silent for dev to avoid noisy output during local builds)
    if (process.env.NODE_ENV === 'production') {
      logWarn(msg, { component: 'notificationService' });
    } else {
      logDebug(msg, { component: 'notificationService' });
    }
  }
}

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export async function sendPushNotification(
  fcmToken: string,
  payload: NotificationPayload
): Promise<boolean> {
  if (!admin.apps.length) {
    console.warn('Firebase not initialized');
    return false;
  }

  try {
    await admin.messaging().send({
      token: fcmToken,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data || {},
      android: {
        priority: 'high' as const,
        notification: {
          channelId: 'bus_updates',
          priority: 'high' as const,
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    });
    return true;
  } catch (error) {
    console.error('FCM send error:', error);
    return false;
  }
}

export async function notifyBusArrival(
  userId: string,
  routeName: string,
  stopName: string
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { fcmToken: true },
  });

  if (!user?.fcmToken) return false;

  return sendPushNotification(user.fcmToken, {
    title: '🚌 Bus Arriving',
    body: `Your bus on ${routeName} is arriving at ${stopName}`,
    data: { type: 'arrival', route: routeName },
  });
}

export async function notifyBusDelay(
  userId: string,
  routeName: string,
  delayMinutes: number
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { fcmToken: true },
  });

  if (!user?.fcmToken) return false;

  return sendPushNotification(user.fcmToken, {
    title: '⚠️ Bus Delay',
    body: `Your bus on ${routeName} is delayed by ${delayMinutes} minutes`,
    data: { type: 'delay', route: routeName, delay: String(delayMinutes) },
  });
}

export async function notifyRouteChange(
  userId: string,
  oldRoute: string,
  newRoute: string
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { fcmToken: true },
  });

  if (!user?.fcmToken) return false;

  return sendPushNotification(user.fcmToken, {
    title: '🔔 Route Update',
    body: `Your route has been changed from ${oldRoute} to ${newRoute}`,
    data: { type: 'route_change' },
  });
}

export async function notifyBusPassStatus(
  userId: string,
  status: 'approved' | 'rejected',
  routeName?: string
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { fcmToken: true },
  });

  if (!user?.fcmToken) return false;

  const title = status === 'approved' ? '✅ Bus Pass Approved' : '❌ Bus Pass Rejected';
  const body =
    status === 'approved'
      ? `Your bus pass for ${routeName} has been approved!`
      : 'Your bus pass application has been rejected.';

  return sendPushNotification(user.fcmToken, {
    title,
    body,
    data: { type: 'bus_pass', status },
  });
}

export async function broadcastToRoute(
  routeId: string,
  payload: NotificationPayload
): Promise<number> {
  const users = await prisma.user.findMany({
    where: { assignedRouteId: routeId, fcmToken: { not: null } },
    select: { fcmToken: true },
  });

  let successCount = 0;
  for (const user of users) {
    if (user.fcmToken) {
      const success = await sendPushNotification(user.fcmToken, payload);
      if (success) successCount++;
    }
  }

  return successCount;
}

export async function broadcastToAll(
  payload: NotificationPayload
): Promise<number> {
  const users = await prisma.user.findMany({
    where: { fcmToken: { not: null } },
    select: { fcmToken: true },
  });

  let successCount = 0;
  for (const user of users) {
    if (user.fcmToken) {
      const success = await sendPushNotification(user.fcmToken, payload);
      if (success) successCount++;
    }
  }

  return successCount;
}
