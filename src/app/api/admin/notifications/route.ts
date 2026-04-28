import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { broadcastToRoute, broadcastToAll, sendPushNotification } from '@/lib/notificationService';
import type { ApiResponse } from '@/types';

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  if (user?.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Admin only' }, { status: 403 });
  }

  try {
    const { type, routeId, title, body, targetUserId } = await req.json();

    if (!title || !body) {
      return NextResponse.json({ success: false, error: 'Title and body required' }, { status: 400 });
    }

    let result: { success: boolean; count?: number };

    if (type === 'broadcast_all') {
      const count = await broadcastToAll({ title, body });
      result = { success: true, count };
    } else if (type === 'broadcast_route' && routeId) {
      const count = await broadcastToRoute(routeId, { title, body });
      result = { success: true, count };
    } else if (type === 'single' && targetUserId) {
      const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { fcmToken: true },
      });
      if (!targetUser?.fcmToken) {
        return NextResponse.json({ success: false, error: 'User has no FCM token' }, { status: 400 });
      }
      const success = await sendPushNotification(targetUser.fcmToken, { title, body });
      result = { success, count: success ? 1 : 0 };
    } else {
      return NextResponse.json({ success: false, error: 'Invalid notification type' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Push notification error:', error);
    return NextResponse.json({ success: false, error: 'Failed to send notification' }, { status: 500 });
  }
}
