import { NextResponse } from 'next/server';
import { mockBuses } from '@/lib/db';
import type { ApiResponse } from '@/types';

export async function GET(): Promise<NextResponse> {
  return NextResponse.json<ApiResponse>({
    success: true,
    data: mockBuses,
  });
}
