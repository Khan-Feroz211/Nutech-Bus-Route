import { NextResponse } from 'next/server';
import { mockRoutes } from '@/lib/db';
import { requireApiAuth } from '@/lib/apiAuth';
import type { ApiResponse } from '@/types';

export async function GET(): Promise<NextResponse> {
  const authz = await requireApiAuth(['student', 'driver', 'admin']);
  if (!authz.ok) return authz.response;

  return NextResponse.json<ApiResponse>({
    success: true,
    data: mockRoutes,
  });
}
