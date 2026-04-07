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

    const existing = await prisma.user.findFirst({ where: { rollNumber } });
    if (existing) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'This roll number is already registered.',
      }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        rollNumber,
        email,
        phoneNumber,
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

