import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ApiResponse, Report } from '@/types';

export async function GET(): Promise<NextResponse> {
  try {
    const reports = await prisma.report.findMany({
      include: { student: { select: { name: true, rollNumber: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json<ApiResponse>({ success: true, data: reports });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: 'DB error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json() as { type: string; description: string; studentId: string; busId?: string; routeId?: string };

    const newReport = await prisma.report.create({
      data: {
        studentId: body.studentId,
        busId: body.busId ?? null,
        routeId: body.routeId ?? null,
        type: body.type as Report['type'],
        description: body.description,
        status: 'pending',
      },
    });

    return NextResponse.json<ApiResponse>({ success: true, data: newReport }, { status: 201 });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Invalid request.' }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json() as { id: string; status: 'pending' | 'resolved' | 'dismissed' };
    const updated = await prisma.report.update({
      where: { id: body.id },
      data: { status: body.status },
    });
    return NextResponse.json<ApiResponse>({ success: true, data: updated });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Update failed.' }, { status: 400 });
  }
}

