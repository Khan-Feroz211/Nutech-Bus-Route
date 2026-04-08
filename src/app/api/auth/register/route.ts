import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@/types';

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

    if (!name || !rollNumber || !routeId || !password) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Name, roll number, route, and password are required.',
      }, { status: 400 });
    }

    if (password.trim().length < 6) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Password must be at least 6 characters long.',
      }, { status: 400 });
    }

    const normalizedEmail = email?.trim().toLowerCase() || undefined;

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
