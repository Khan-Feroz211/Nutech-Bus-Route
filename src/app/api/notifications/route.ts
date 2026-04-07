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

