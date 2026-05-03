import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { createHash } from 'crypto';
import { prisma } from '@/lib/prisma';
import { ensureUserFcmTokenColumn } from '@/lib/dbSchemaCompat';
import { clearLoginRateLimit, enforceLoginRateLimit } from '@/lib/accountService';
import type { UserRole } from '@/types';

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (secret) return secret;

  const base = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? 'nutech-bustrack';
  return createHash('sha256').update(base).digest('hex');
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        identifier: { label: 'Identifier', type: 'text' },
        password: { label: 'Password', type: 'password' },
        role: { label: 'Role', type: 'text' },
      },
      async authorize(credentials, request) {
        await ensureUserFcmTokenColumn();

        const { identifier, password, role } = credentials as {
          identifier: string;
          password: string;
          role: UserRole;
        };

        if (!identifier || !password || !role) return null;

        const ipAddress = request?.headers?.get('x-forwarded-for')?.split(',')[0]?.trim()
          || request?.headers?.get('x-real-ip')
          || 'unknown';

        const rateLimit = enforceLoginRateLimit(identifier, ipAddress);
        if (!rateLimit.allowed) {
          return null;
        }

        try {
          if (role === 'student') {
            const student = await prisma.user.findFirst({
              where: {
                role: 'student',
                OR: [{ rollNumber: identifier }, { email: identifier.toLowerCase() }],
              },
            });
            if (!student) return null;
            if (student.email && !student.isEmailVerified) return null;
            const valid = await bcrypt.compare(password, student.passwordHash);
            if (!valid) return null;
            clearLoginRateLimit(identifier, ipAddress);
            return {
              id: student.id,
              name: student.name,
              email: student.email ?? null,
              role: 'student' as UserRole,
              rollNumber: student.rollNumber ?? '',
              assignedRouteId: student.assignedRouteId ?? 'route-a',
            };
          }

          if (role === 'driver') {
            const driver = await prisma.user.findFirst({
              where: { employeeId: identifier, role: 'driver' },
            });
            if (!driver) return null;
            const valid = await bcrypt.compare(password, driver.passwordHash);
            if (!valid) return null;
            clearLoginRateLimit(identifier, ipAddress);
            return {
              id: driver.id,
              name: driver.name,
              email: driver.email ?? null,
              role: 'driver' as UserRole,
              employeeId: driver.employeeId ?? '',
              assignedBusId: driver.assignedBusId ?? '',
            };
          }

          if (role === 'admin') {
            const admin = await prisma.user.findFirst({
              where: { email: identifier, role: 'admin' },
            });
            if (!admin) return null;
            const valid = await bcrypt.compare(password, admin.passwordHash);
            if (!valid) return null;
            clearLoginRateLimit(identifier, ipAddress);
            return {
              id: admin.id,
              name: admin.name,
              email: admin.email ?? null,
              role: 'admin' as UserRole,
            };
          }
        } catch (err) {
          console.error('[Auth] DB error during authorize:', err);
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as Record<string, unknown>).role as UserRole;
        token.id = user.id;
        const u = user as Record<string, unknown>;
        if (u.rollNumber) token.rollNumber = u.rollNumber as string;
        if (u.assignedRouteId) token.assignedRouteId = u.assignedRouteId as string;
        if (u.employeeId) token.employeeId = u.employeeId as string;
        if (u.assignedBusId) token.assignedBusId = u.assignedBusId as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as unknown as Record<string, unknown>).role = token.role;
        (session.user as unknown as Record<string, unknown>).id = token.id;
        if (token.rollNumber) (session.user as unknown as Record<string, unknown>).rollNumber = token.rollNumber;
        if (token.assignedRouteId) (session.user as unknown as Record<string, unknown>).assignedRouteId = token.assignedRouteId;
        if (token.employeeId) (session.user as unknown as Record<string, unknown>).employeeId = token.employeeId;
        if (token.assignedBusId) (session.user as unknown as Record<string, unknown>).assignedBusId = token.assignedBusId;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
  secret: getAuthSecret(),
});
