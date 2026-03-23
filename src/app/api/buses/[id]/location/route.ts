import { NextRequest, NextResponse } from 'next/server';
import { mockBuses } from '@/lib/db';
import type { ApiResponse, LatLng } from '@/types';

// In-memory location store (demo only – lost on restart; use a real DB in production)
const locationStore = new Map<string, { location: LatLng; speed?: number; heading?: number; timestamp: number }>();

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  const bus = mockBuses.find((b) => b.id === id);
  if (!bus) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Bus not found' }, { status: 404 });
  }

  const stored = locationStore.get(id);
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
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = await req.json() as { location: LatLng; speed?: number; heading?: number };
    locationStore.set(id, { ...body, timestamp: Date.now() });

    return NextResponse.json<ApiResponse>({ success: true, message: 'Location updated.' });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Invalid request.' }, { status: 400 });
  }
}
