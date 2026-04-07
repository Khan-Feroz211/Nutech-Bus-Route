import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@/types';

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') ?? '';
    const routeId = searchParams.get('routeId') ?? '';
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const limit = parseInt(searchParams.get('limit') ?? '20', 10);

    const where = {
      role: 'student',
      ...(search ? {
        OR: [
          { name: { contains: search } },
          { rollNumber: { contains: search } },
          { email: { contains: search } },
        ],
      } : {}),
      ...(routeId ? { assignedRouteId: routeId } : {}),
    };

    const [students, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: { id: true, name: true, email: true, rollNumber: true, assignedRouteId: true, phoneNumber: true, address: true, createdAt: true },
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json<ApiResponse>({ success: true, data: { students, total, page, limit } });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: 'DB error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json() as {
      name: string;
      rollNumber: string;
      email?: string;
      phoneNumber?: string;
      address?: string;
      assignedRouteId: string;
      password?: string;
    };

    if (!body.name || !body.rollNumber || !body.assignedRouteId) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Name, roll number, and route are required.' }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({ where: { rollNumber: body.rollNumber } });
    if (existing) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Roll number already registered.' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(body.password ?? 'student123', 10);

    const student = await prisma.user.create({
      data: {
        name: body.name,
        rollNumber: body.rollNumber,
        email: body.email ?? null,
        phoneNumber: body.phoneNumber ?? null,
        address: body.address ?? null,
        assignedRouteId: body.assignedRouteId,
        role: 'student',
        passwordHash,
      },
    });

    return NextResponse.json<ApiResponse>({ success: true, data: { id: student.id } }, { status: 201 });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to create student.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json() as {
      id: string;
      name?: string;
      email?: string;
      phoneNumber?: string;
      address?: string;
      assignedRouteId?: string;
    };

    const { id, ...data } = body;
    const updated = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, rollNumber: true, assignedRouteId: true, phoneNumber: true, address: true },
    });

    return NextResponse.json<ApiResponse>({ success: true, data: updated });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Update failed.' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const { id } = await req.json() as { id: string };

    // Delete related records first
    await prisma.report.deleteMany({ where: { studentId: id } });
    await prisma.busPassApplication.deleteMany({ where: { studentId: id } });
    await prisma.boardingLog.deleteMany({ where: { studentId: id } });
    await prisma.user.delete({ where: { id } });

    return NextResponse.json<ApiResponse>({ success: true });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Delete failed.' }, { status: 400 });
  }
}
