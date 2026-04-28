import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiAuth } from '@/lib/apiAuth';
import type { ApiResponse, Report } from '@/types';

export async function GET(): Promise<NextResponse> {
  const authz = await requireApiAuth(['admin']);
  if (!authz.ok) return authz.response;

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
  const authz = await requireApiAuth(['student']);
  if (!authz.ok) return authz.response;

  try {
    const body = await req.json() as { type: string; description: string; studentId: string; busId?: string; routeId?: string };

    if (body.studentId !== authz.user.id) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Forbidden' }, { status: 403 });
    }

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
  const authz = await requireApiAuth(['admin']);
  if (!authz.ok) return authz.response;

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

