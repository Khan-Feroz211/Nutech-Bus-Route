import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';
import { enforceOtpVerifyRateLimit, verifyEmailOtp } from '@/lib/accountService';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as { email?: string; otp?: string };
    const email = body.email?.trim().toLowerCase();
    const otp = body.otp?.trim();

    if (!email || !otp) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Email and OTP are required.',
      }, { status: 400 });
    }

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'OTP must be a 6-digit code.',
      }, { status: 400 });
    }

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('x-real-ip')
      || 'unknown';

    const limit = enforceOtpVerifyRateLimit(email, ipAddress);
    if (!limit.allowed) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: `Too many OTP attempts. Try again in ${limit.retryAfterSeconds} seconds.`,
      }, {
        status: 429,
        headers: { 'Retry-After': String(limit.retryAfterSeconds ?? 900) },
      });
    }

    const result = await verifyEmailOtp({ email, otp });
    if (!result.success) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: result.error ?? 'Invalid OTP.',
      }, { status: 400 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Email verified successfully. You can now sign in.',
    });
  } catch {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error.',
    }, { status: 500 });
  }
}
