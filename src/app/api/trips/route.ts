import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';

interface TripRecord {
  id: string;
  busId: string;
  driverId: string;
  routeId: string;
  startTime: string;
  endTime?: string;
  status: 'active' | 'completed';
}

const trips: TripRecord[] = [];

export async function GET(): Promise<NextResponse> {
  return NextResponse.json<ApiResponse>({ success: true, data: trips });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json() as { busId: string; driverId: string; routeId: string; event: 'start' | 'end' };

    if (body.event === 'start') {
      const trip: TripRecord = {
        id: `trip-${Date.now()}`,
        busId: body.busId,
        driverId: body.driverId,
        routeId: body.routeId,
        startTime: new Date().toISOString(),
        status: 'active',
      };
      trips.push(trip);
      return NextResponse.json<ApiResponse>({ success: true, data: trip }, { status: 201 });
    }

    if (body.event === 'end') {
      const trip = trips.find((t) => t.busId === body.busId && t.status === 'active');
      if (trip) {
        trip.status = 'completed';
        trip.endTime = new Date().toISOString();
      }
      return NextResponse.json<ApiResponse>({ success: true, data: trip });
    }

    return NextResponse.json<ApiResponse>({ success: false, error: 'Invalid event.' }, { status: 400 });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Invalid request.' }, { status: 400 });
  }
}
