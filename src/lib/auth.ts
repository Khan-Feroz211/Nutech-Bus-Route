import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { mockStudents, mockDrivers, mockAdmin } from '@/lib/db';
import type { UserRole } from '@/types';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        identifier: { label: 'Identifier', type: 'text' },
        password: { label: 'Password', type: 'password' },
        role: { label: 'Role', type: 'text' },
      },
      async authorize(credentials) {
        const { identifier, password, role } = credentials as {
          identifier: string;
          password: string;
          role: UserRole;
        };

        if (!identifier || !password || !role) return null;

        if (role === 'student') {
          const student = mockStudents.find(
            (s) => s.rollNumber === identifier && password === 'student123'
          );
          if (student) {
            return {
              id: student.id,
              name: student.name,
              email: student.email ?? null,
              role: 'student',
              rollNumber: student.rollNumber,
              assignedRouteId: student.assignedRouteId,
            };
          }
        }

        if (role === 'driver') {
          const driver = mockDrivers.find(
            (d) => d.employeeId === identifier && password === '1234'
          );
          if (driver) {
            return {
              id: driver.id,
              name: driver.name,
              email: driver.email ?? null,
              role: 'driver',
              employeeId: driver.employeeId,
              assignedBusId: driver.assignedBusId,
            };
          }
        }

        if (role === 'admin') {
          if (identifier === mockAdmin.email && password === 'admin123') {
            return {
              id: mockAdmin.id,
              name: mockAdmin.name,
              email: mockAdmin.email,
              role: 'admin',
            };
          }
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
  secret: (() => {
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      // In production at *runtime* (not build), a missing secret is a misconfiguration.
      // The fallback below is safe only for local development.
      if (process.env.NEXTAUTH_SECRET_REQUIRED === 'true') {
        throw new Error('NEXTAUTH_SECRET environment variable must be set in production');
      }
      return 'nutech-bustrack-dev-secret-replace-before-deploying';
    }
    return secret;
  })(),
});
