import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse, Report } from '@/types';

const reports: Report[] = [];

export async function GET(): Promise<NextResponse> {
  return NextResponse.json<ApiResponse>({ success: true, data: reports });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json() as { type: string; description: string; studentId: string; busId?: string; routeId?: string };

    const newReport: Report = {
      id: `rpt-${Date.now()}`,
      studentId: body.studentId,
      busId: body.busId,
      routeId: body.routeId,
      type: body.type as Report['type'],
      description: body.description,
      createdAt: new Date(),
      status: 'pending',
    };
    reports.push(newReport);

    return NextResponse.json<ApiResponse>({ success: true, data: newReport }, { status: 201 });
  } catch {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Invalid request.' }, { status: 400 });
  }
}
