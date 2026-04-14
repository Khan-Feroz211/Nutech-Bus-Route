import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiAuth } from '@/lib/apiAuth';
import type { ApiResponse } from '@/types';

export async function GET(): Promise<NextResponse> {
  const authz = await requireApiAuth(['driver', 'admin']);
  if (!authz.ok) return authz.response;

  try {
    const where = authz.user.role === 'driver'
      ? { driverId: authz.user.id }
      : undefined;

    const trips = await prisma.trip.findMany({
      where,
      orderBy: { startTime: 'desc' },
      take: 100,
    });
    return NextResponse.json<ApiResponse>({ success: true, data: trips });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: 'DB error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const authz = await requireApiAuth(['driver', 'admin']);
  if (!authz.ok) return authz.response;

  try {
    const body = await req.json() as { busId: string; driverId: string; routeId: string; event: 'start' | 'end'; direction?: string };

    if (authz.user.role === 'driver' && body.driverId !== authz.user.id) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    if (body.event === 'start') {
      const hour = new Date().getHours();
      const direction = body.direction ?? (hour < 13 ? 'morning' : 'evening');

      const trip = await prisma.trip.create({
        data: {
          busId: body.busId,
          driverId: body.driverId,
          routeId: body.routeId,
          startTime: new Date(),
          status: 'active',
          direction,
        },
      });

      // Mark bus as active
      await prisma.bus.update({
        where: { id: body.busId },
        data: { status: 'active', lastUpdated: new Date() },
      });

      return NextResponse.json<ApiResponse>({ success: true, data: trip }, { status: 201 });
    }

    if (body.event === 'end') {
      const trip = await prisma.trip.findFirst({
        where: { busId: body.busId, status: 'active' },
      });

      if (trip) {
        const updated = await prisma.trip.update({
          where: { id: trip.id },
          data: { status: 'completed', endTime: new Date() },
        });

        await prisma.bus.update({
          where: { id: body.busId },
          data: { status: 'idle', lastUpdated: new Date() },
        });

        return NextResponse.json<ApiResponse>({ success: true, data: updated });
      }

      return NextResponse.json<ApiResponse>({ success: false, error: 'No active trip found.' }, { status: 404 });
    }

    return NextResponse.json<ApiResponse>({ success: false, error: 'Invalid event.' }, { status: 400 });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Invalid request.' }, { status: 400 });
  }
}

