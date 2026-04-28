import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';
import { createEmailVerificationOtp, enforceOtpSendRateLimit } from '@/lib/accountService';
import { getEmailTransportStatus, sendEmailVerificationOtp } from '@/lib/email';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Email is required.',
      }, { status: 400 });
    }

    const emailStatus = getEmailTransportStatus();
    if (!emailStatus.ready) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: `Email service is not configured: ${emailStatus.reason}`,
      }, { status: 503 });
    }

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('x-real-ip')
      || 'unknown';

    const limit = enforceOtpSendRateLimit(email, ipAddress);
    if (!limit.allowed) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: `Too many OTP requests. Try again in ${limit.retryAfterSeconds} seconds.`,
      }, {
        status: 429,
        headers: { 'Retry-After': String(limit.retryAfterSeconds ?? 900) },
      });
    }

    const otpResult = await createEmailVerificationOtp({ email });
    if (otpResult.email && otpResult.name && otpResult.otp) {
      await sendEmailVerificationOtp({
        to: otpResult.email,
        name: otpResult.name,
        otp: otpResult.otp,
      });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'If the account exists and is pending verification, an OTP has been sent.',
    });
  } catch {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error.',
    }, { status: 500 });
  }
}
