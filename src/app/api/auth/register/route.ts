import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { enforceRegistrationRateLimit } from '@/lib/accountService';
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

    if (normalizedEmail) {
      const existingEmail = await prisma.user.findFirst({ where: { email: normalizedEmail, role: 'student' } });
      if (existingEmail) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'This email is already registered.',
        }, { status: 409 });
      }
    }

    const passwordHash = await bcrypt.hash(password.trim(), 12);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        rollNumber: rollNumber.trim(),
        email: normalizedEmail,
        phoneNumber: phoneNumber?.trim(),
        assignedRouteId: routeId,
        role: 'student',
        passwordHash,
      },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { id: newUser.id },
      message: 'Registration successful.',
    }, { status: 201 });
  } catch {
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error.',
    }, { status: 500 });
  }
}
