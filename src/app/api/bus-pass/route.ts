import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiAuth } from '@/lib/apiAuth';
import { sendBusPassStatusEmail } from '@/lib/email';
import type { ApiResponse } from '@/types';
import { PrismaClient } from '@/generated/prisma/client';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const authz = await requireApiAuth(['student', 'admin']);
  if (!authz.ok) return authz.response;

  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    const status = searchParams.get('status');

    if (authz.user.role === 'student') {
      if (!studentId || studentId !== authz.user.id) {
        return NextResponse.json<ApiResponse>({ success: false, error: 'Forbidden' }, { status: 403 });
      }
    }

    const apps = await prisma.busPassApplication.findMany({
      where: {
        ...(studentId ? { studentId } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        student: {
          select: { id: true, name: true, rollNumber: true, email: true, phoneNumber: true },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });

    return NextResponse.json<ApiResponse>({ success: true, data: apps });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: 'DB error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const authz = await requireApiAuth(['student', 'admin']);
  if (!authz.ok) return authz.response;

  try {
    const body = await req.json() as {
      studentId: string;
      routeId: string;
      semester: string;
      feeAmount?: number;
    };

    if (!body.studentId || !body.routeId || !body.semester) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'studentId, routeId, and semester are required.' }, { status: 400 });
    }

    if (authz.user.role === 'student' && body.studentId !== authz.user.id) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    // Check if student already has a pending/approved pass for this semester
    const existing = await prisma.busPassApplication.findFirst({
      where: {
        studentId: body.studentId,
        semester: body.semester,
        status: { in: ['pending', 'approved'] },
      },
    });

    if (existing) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'You already have an active or pending application for this semester.' }, { status: 409 });
    }

    const app = await prisma.busPassApplication.create({
      data: {
        studentId: body.studentId,
        routeId: body.routeId,
        semester: body.semester,
        feeAmount: body.feeAmount ?? 5000,
        status: 'pending',
        feeStatus: 'unpaid',
      },
    });

    return NextResponse.json<ApiResponse>({ success: true, data: app }, { status: 201 });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to submit application.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const authz = await requireApiAuth(['admin']);
  if (!authz.ok) return authz.response;

  try {
    const body = await req.json() as {
      id: string;
      status?: 'pending' | 'approved' | 'rejected';
      feeStatus?: 'unpaid' | 'paid';
      validFrom?: string;
      validTo?: string;
      notes?: string;
    };

    const { id, ...updates } = body;

    const data: Record<string, unknown> = { ...updates, reviewedAt: new Date() };
    if (updates.validFrom) data.validFrom = new Date(updates.validFrom);
    if (updates.validTo) data.validTo = new Date(updates.validTo);

    // Update app and student route in a transaction to ensure consistency
    const app = await prisma.$transaction(async (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$use' | '$extends'>) => {
      const updated = await tx.busPassApplication.update({
        where: { id },
        data,
        include: {
          student: { select: { id: true, name: true, email: true, rollNumber: true } },
        },
      });

      if (updates.status === 'approved') {
        await tx.user.update({
          where: { id: updated.studentId },
          data: { assignedRouteId: updated.routeId },
        });
      }

      return updated;
    });

    // Send email notification only for final decisions.
    if ((updates.status === 'approved' || updates.status === 'rejected') && app.student.email) {
      const route = await prisma.busRoute.findUnique({ where: { id: app.routeId } });
      await sendBusPassStatusEmail({
        to: app.student.email,
        name: app.student.name,
        status: updates.status,
        routeName: route?.label,
        reason: updates.notes,
      });
    }

    return NextResponse.json<ApiResponse>({ success: true, data: app });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Update failed.' }, { status: 400 });
  }
}
