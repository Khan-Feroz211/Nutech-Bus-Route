import { NextRequest, NextResponse } from 'next/server';
import { mockNotifications } from '@/lib/db';
import type { ApiResponse, Notification } from '@/types';

const notifications = [...mockNotifications];

export async function GET(): Promise<NextResponse> {
  return NextResponse.json<ApiResponse>({ success: true, data: notifications });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json() as Omit<Notification, 'id' | 'createdAt' | 'read'>;

    const newNotif: Notification = {
      ...body,
      id: `notif-${Date.now()}`,
      createdAt: new Date(),
      read: false,
    };
    notifications.unshift(newNotif);

    return NextResponse.json<ApiResponse>({ success: true, data: newNotif }, { status: 201 });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Invalid request.' }, { status: 400 });
  }
}
