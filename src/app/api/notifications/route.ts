import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@/types';

export async function GET(): Promise<NextResponse> {
  try {
    const dbs = await prisma.notification.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json<ApiResponse>({ success: true, data: dbs });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: 'DB error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json() as { title: string; message: string; type: string; targetRole?: string; routeId?: string };

    const newNotif = await prisma.notification.create({
      data: {
        title: body.title,
        message: body.message,
        type: body.type,
        targetRole: body.targetRole ?? null,
        routeId: body.routeId ?? null,
        read: false,
      },
    });

    return NextResponse.json<ApiResponse>({ success: true, data: newNotif }, { status: 201 });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Invalid request.' }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json() as { id?: string; read?: boolean; markAll?: boolean };

    if (body.markAll) {
      await prisma.notification.updateMany({ data: { read: true } });
      return NextResponse.json<ApiResponse>({ success: true, message: 'All notifications marked as read.' });
    }

    if (!body.id) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Notification id is required.' }, { status: 400 });
    }

    const updated = await prisma.notification.update({
      where: { id: body.id },
      data: { read: body.read ?? true },
    });

    return NextResponse.json<ApiResponse>({ success: true, data: updated });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Unable to update notification.' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const all = searchParams.get('all');

    if (all === 'true') {
      await prisma.notification.deleteMany({});
      return NextResponse.json<ApiResponse>({ success: true, message: 'All notifications cleared.' });
    }

    if (!id) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Notification id is required.' }, { status: 400 });
    }

    await prisma.notification.delete({ where: { id } });
    return NextResponse.json<ApiResponse>({ success: true, message: 'Notification deleted.' });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Unable to delete notification.' }, { status: 400 });
  }
}

