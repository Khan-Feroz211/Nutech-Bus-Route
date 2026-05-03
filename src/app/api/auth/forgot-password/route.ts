import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';
import { createPasswordReset, enforceResetRateLimit } from '@/lib/accountService';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as { identifier?: string };
    const identifier = body.identifier?.trim();

    if (!identifier) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Roll number or email is required.' },
        { status: 400 }
      );
    }

    const forwardedFor = req.headers.get('x-forwarded-for') ?? '';
    const ipAddress = forwardedFor.split(',')[0]?.trim() || 'unknown';
    const limit = await enforceResetRateLimit(identifier, ipAddress);

    if (!limit.allowed) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Too many reset attempts. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(limit.retryAfterSeconds ?? 900),
          },
        }
      );
    }

    const reset = await createPasswordReset({ identifier });

    if (reset.email && reset.name && reset.token) {
      const baseUrl = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
      const resetLink = `${baseUrl}/reset-password?token=${encodeURIComponent(reset.token)}`;
      await sendPasswordResetEmail({
        to: reset.email,
        name: reset.name,
        resetLink,
      });
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: 'If the account exists, a password reset link has been sent to the registered email.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[auth/forgot-password] unexpected error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
