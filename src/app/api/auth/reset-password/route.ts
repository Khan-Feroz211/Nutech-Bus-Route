import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';
import { applyPasswordReset } from '@/lib/accountService';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as { token?: string; password?: string };
    const token = body.token?.trim();
    const password = body.password?.trim();

    if (!token || !password) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Reset token and new password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const result = await applyPasswordReset({ token, password });
    if (!result.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: result.error ?? 'Unable to reset password.' },
        { status: 400 }
      );
    }

    return NextResponse.json<ApiResponse>(
      { success: true, message: 'Password has been reset successfully.' },
      { status: 200 }
    );
  } catch {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
