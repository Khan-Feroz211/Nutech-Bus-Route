import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import type { UserRole } from '@/types';

export interface ApiSessionUser {
  id: string;
  role: UserRole;
  assignedRouteId?: string;
  assignedBusId?: string;
}

type AuthOk = { ok: true; user: ApiSessionUser };
type AuthError = { ok: false; response: NextResponse };

export async function requireApiAuth(allowedRoles?: UserRole[]): Promise<AuthOk | AuthError> {
  const session = await auth();
  if (!session?.user) {
    return {
      ok: false,
      response: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const user = session.user as Record<string, unknown>;
  const role = user.role as UserRole | undefined;
  const id = user.id as string | undefined;

  if (!role || !id) {
    return {
      ok: false,
      response: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }),
    };
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return {
      ok: false,
      response: NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 }),
    };
  }

  return {
    ok: true,
    user: {
      id,
      role,
      assignedRouteId: user.assignedRouteId as string | undefined,
      assignedBusId: user.assignedBusId as string | undefined,
    },
  };
}
