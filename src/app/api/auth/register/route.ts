import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';

// In-memory store for demo; in production use a real database
const registeredUsers: Array<{
  id: string;
  name: string;
  rollNumber: string;
  email?: string;
  phoneNumber?: string;
  routeId: string;
  createdAt: string;
}> = [];

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

    const { name, rollNumber, email, phoneNumber, routeId } = body;

    if (!name || !rollNumber || !routeId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Name, roll number, and route are required.',
      }, { status: 400 });
    }

    const existing = registeredUsers.find((u) => u.rollNumber === rollNumber);
    if (existing) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'This roll number is already registered.',
      }, { status: 409 });
    }

    const newUser = {
      id: `stu-${Date.now()}`,
      name,
      rollNumber,
      email,
      phoneNumber,
      routeId,
      createdAt: new Date().toISOString(),
    };

    registeredUsers.push(newUser);

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
