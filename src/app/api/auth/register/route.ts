import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import { ensureUserFcmTokenColumn } from '@/lib/dbSchemaCompat';
import { createEmailVerificationOtp, enforceRegistrationRateLimit } from '@/lib/accountService';
import { sendEmailVerificationOtp, sendWelcomeEmail } from '@/lib/email';
import { shouldSkipEmailVerification } from '@/lib/featureFlags';
import { validateEmailStructure, analyzePasswordStrength } from '@/lib/passwordSecurity';
import type { ApiResponse } from '@/types';

/**
 * Student Registration API
 * 
 * SECURITY MEASURES:
 * 1. Rate limiting: Max 5 accounts per IP, max 3 per email per 15-minute window
 * 2. Email validation: RFC5322 format check + disposable domain detection
 * 3. Password requirements: Min 6 chars, must contain uppercase, lowercase, numbers
 * 4. Input sanitization: All fields trimmed and normalized
 * 5. Bcrypt hashing: 12 salt rounds for password security
 * 6. Duplicate prevention: Check both rollNumber and email uniqueness
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await ensureUserFcmTokenColumn();

    const body = await req.json() as {
      name: string;
      rollNumber: string;
      email?: string;
      phoneNumber?: string;
      routeId: string;
      password: string;
    };

    const { name, rollNumber, email, phoneNumber, routeId, password } = body;

    // Get client IP for rate limiting (handles proxies)
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                      req.headers.get('x-real-ip') || 
                      'unknown';

    if (!name || !rollNumber || !routeId || !password) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Name, roll number, route, and password are required.',
      }, { status: 400 });
    }

    // SECURITY: Email validation before rate limiting
    const normalizedEmail = email?.trim().toLowerCase() || undefined;
    const skipVerification = shouldSkipEmailVerification();
    if (!normalizedEmail) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Email is required for account verification.',
      }, { status: 400 });
    }

    if (normalizedEmail) {
      const emailValidation = validateEmailStructure(normalizedEmail);
      if (!emailValidation.valid) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: `Invalid email: ${emailValidation.issues[0]}`,
        }, { status: 400 });
      }
    }

    // SECURITY: Rate limiting check (before database queries)
    const rateLimit = enforceRegistrationRateLimit(normalizedEmail || rollNumber, ipAddress);
    if (!rateLimit.allowed) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: `Too many registration attempts. Please try again in ${rateLimit.retryAfterSeconds} seconds.`,
      }, { status: 429 });
    }

    // SECURITY: Enhanced password validation
    const passwordAnalysis = analyzePasswordStrength(password);
    if (!passwordAnalysis.meetsMinimum) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: `Password must contain uppercase, lowercase, numbers, and be 6+ characters. Issues: ${passwordAnalysis.issues.join('; ')}`,
      }, { status: 400 });
    }

    if (password.trim().length < 6) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Password must be at least 6 characters long.',
      }, { status: 400 });
    }

    const existingRoll = await prisma.user.findFirst({ where: { rollNumber: rollNumber.trim(), role: 'student' } });
    if (existingRoll) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'This roll number is already registered.',
      }, { status: 409 });
    }

    const existingEmail = await prisma.user.findFirst({ where: { email: normalizedEmail, role: 'student' } });
    if (existingEmail) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'This email is already registered.',
      }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password.trim(), 12);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        rollNumber: rollNumber.trim(),
        email: normalizedEmail,
        isEmailVerified: skipVerification,
        emailVerifiedAt: skipVerification ? new Date() : undefined,
        phoneNumber: phoneNumber?.trim(),
        assignedRouteId: routeId,
        role: 'student',
        passwordHash,
      },
    });

    if (!skipVerification) {
      const otpResult = await createEmailVerificationOtp({ email: normalizedEmail });
      if (otpResult.email && otpResult.name && otpResult.otp) {
        await sendEmailVerificationOtp({
          to: otpResult.email,
          name: otpResult.name,
          otp: otpResult.otp,
        });
      }
    }

    // Send welcome email
    const route = await prisma.busRoute.findUnique({ where: { id: routeId } });
    await sendWelcomeEmail({
      to: normalizedEmail,
      name: name.trim(),
      role: 'student',
      routeName: route?.label,
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { id: newUser.id, email: normalizedEmail, verificationRequired: !skipVerification },
      message: skipVerification ? 'Registration successful (demo mode: email verification skipped).' : 'Registration successful. Please verify your email with OTP.',
    }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('[auth/register] prisma error:', { code: error.code, meta: error.meta, message: error.message });

      if (error.code === 'P2002') {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'This roll number or email is already registered.',
        }, { status: 409 });
      }

      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Database error while creating the account. Check Railway logs and DATABASE_URL.',
      }, { status: 503 });
    }

    console.error('[auth/register] unexpected error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error.',
    }, { status: 500 });
  }
}
