import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { mockBuses } from '@/lib/db';
import type { ApiResponse } from '@/types';

export async function GET(): Promise<NextResponse> {
  try {
    const buses = await prisma.bus.findMany({ orderBy: { createdAt: 'asc' } });
    return NextResponse.json<ApiResponse>({ success: true, data: buses });
  } catch {
    // Fallback to mock data if DB is unavailable during build
    return NextResponse.json<ApiResponse>({ success: true, data: mockBuses });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json() as {
      plateNumber: string;
      model: string;
      capacity: number;
      routeId?: string;
      driverId?: string;
    };

    if (!body.plateNumber || !body.model || !body.capacity) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'plateNumber, model, and capacity are required.' }, { status: 400 });
    }

    const bus = await prisma.bus.create({
      data: {
        plateNumber: body.plateNumber,
        model: body.model,
        capacity: body.capacity,
        routeId: body.routeId ?? null,
        driverId: body.driverId ?? null,
        status: 'idle',
      },
    });

    return NextResponse.json<ApiResponse>({ success: true, data: bus }, { status: 201 });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to create bus.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json() as { id: string; status?: string; routeId?: string; driverId?: string; model?: string; capacity?: number };
    const { id, ...data } = body;

    const updated = await prisma.bus.update({
      where: { id },
      data: { ...data, lastUpdated: new Date() },
    });

    return NextResponse.json<ApiResponse>({ success: true, data: updated });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Update failed.' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const { id } = await req.json() as { id: string };
    await prisma.bus.delete({ where: { id } });
    return NextResponse.json<ApiResponse>({ success: true });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Delete failed.' }, { status: 400 });
  }
}

