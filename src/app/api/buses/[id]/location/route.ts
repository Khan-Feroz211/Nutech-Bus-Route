import { NextRequest, NextResponse } from 'next/server';
import { mockBuses } from '@/lib/db';
import type { ApiResponse, LatLng } from '@/types';

// In-memory location store
const locationStore = new Map<string, { location: LatLng; speed?: number; heading?: number; timestamp: number }>();

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const bus = mockBuses.find((b) => b.id === params.id);
  if (!bus) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Bus not found' }, { status: 404 });
  }

  const stored = locationStore.get(params.id);
  const location = stored ?? {
    location: bus.currentLocation ?? { lat: 33.6502, lng: 73.1201 },
    speed: bus.speed,
    heading: bus.heading,
    timestamp: Date.now(),
  };

  return NextResponse.json<ApiResponse>({ success: true, data: location });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const body = await req.json() as { location: LatLng; speed?: number; heading?: number };
    locationStore.set(params.id, { ...body, timestamp: Date.now() });

    return NextResponse.json<ApiResponse>({ success: true, message: 'Location updated.' });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Invalid request.' }, { status: 400 });
  }
}
