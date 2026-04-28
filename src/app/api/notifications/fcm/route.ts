import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@/types';

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { fcmToken } = await req.json();

    if (!fcmToken || typeof fcmToken !== 'string') {
      return NextResponse.json({ success: false, error: 'Invalid FCM token' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { fcmToken },
    });

    return NextResponse.json({ success: true, message: 'FCM token saved' });
  } catch (error) {
    console.error('FCM token save error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save token' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest): Promise<NextResponse<ApiResponse>> {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { fcmToken: null },
    });

    return NextResponse.json({ success: true, message: 'FCM token removed' });
  } catch (error) {
    console.error('FCM token remove error:', error);
    return NextResponse.json({ success: false, error: 'Failed to remove token' }, { status: 500 });
  }
}
