import bcrypt from 'bcryptjs';
import { randomBytes, createHash } from 'crypto';
import { mockStudents } from '@/lib/db';
import { prisma } from '@/lib/prisma';

const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_PER_IP = 10;
const RATE_LIMIT_MAX_PER_IDENTIFIER = 5;
const RATE_LIMIT_MAX_KEYS = 2000;

let seeded = false;

type RateWindow = { count: number; resetAt: number };
const ipWindows = new Map<string, RateWindow>();
const identifierWindows = new Map<string, RateWindow>();

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function ensureStudentSeedData(): Promise<void> {
  if (seeded) return;

  for (const student of mockStudents) {
    const existing = await prisma.user.findFirst({
      where: { role: 'student', rollNumber: student.rollNumber },
      select: { id: true },
    });

    if (!existing) {
      const passwordHash = await bcrypt.hash('student123', 12);
      await prisma.user.create({
        data: {
          name: student.name,
          role: 'student',
          rollNumber: student.rollNumber,
          email: student.email,
          phoneNumber: student.phoneNumber,
          assignedRouteId: student.assignedRouteId,
          passwordHash,
        },
      });
    }
  }

  seeded = true;
}

export async function enforceResetRateLimit(identifier: string, ipAddress: string): Promise<{ allowed: boolean; retryAfterSeconds?: number }> {
  const now = Date.now();
  const normalizedIdentifier = normalize(identifier);

  const enforceWindow = (
    key: string,
    max: number,
    store: Map<string, RateWindow>
  ): { allowed: boolean; retryAfterSeconds?: number } => {
    const current = store.get(key);
    if (!current || current.resetAt <= now) {
      store.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
      return { allowed: true };
    }

    if (current.count >= max) {
      return {
        allowed: false,
        retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
      };
    }

    current.count += 1;
    store.set(key, current);
    return { allowed: true };
  };

  // Opportunistic cleanup to keep memory bounded.
  if (ipWindows.size > RATE_LIMIT_MAX_KEYS || identifierWindows.size > RATE_LIMIT_MAX_KEYS) {
    for (const [key, value] of ipWindows) {
      if (value.resetAt <= now) ipWindows.delete(key);
    }
    for (const [key, value] of identifierWindows) {
      if (value.resetAt <= now) identifierWindows.delete(key);
    }
  }

  const byIp = enforceWindow(ipAddress || 'unknown', RATE_LIMIT_MAX_PER_IP, ipWindows);
  if (!byIp.allowed) return byIp;

  return enforceWindow(normalizedIdentifier, RATE_LIMIT_MAX_PER_IDENTIFIER, identifierWindows);
}

export async function createPasswordReset(input: { identifier: string }): Promise<{ email?: string; name?: string; token?: string }> {
  await ensureStudentSeedData();

  const normalized = normalize(input.identifier);
  const student = await prisma.user.findFirst({
    where: {
      role: 'student',
      OR: [{ rollNumber: input.identifier.trim() }, { email: normalized }],
    },
    select: { id: true, email: true, name: true },
  });

  if (!student || !student.email) {
    return {};
  }

  const plainToken = randomBytes(32).toString('hex');
  const tokenHash = hashToken(plainToken);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  await prisma.passwordResetToken.create({
    data: {
      tokenHash,
      userId: student.id,
      expiresAt,
    },
  });

  return {
    email: student.email,
    name: student.name,
    token: plainToken,
  };
}

export async function applyPasswordReset(input: { token: string; password: string }): Promise<{ success: boolean; error?: string }> {
  const tokenHash = hashToken(input.token.trim());
  const now = new Date();

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!resetToken) {
    return { success: false, error: 'Invalid reset token.' };
  }

  if (resetToken.usedAt || resetToken.expiresAt < now) {
    return { success: false, error: 'Reset token is invalid or expired.' };
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: now },
    }),
  ]);

  return { success: true };
}

/**
 * SECURITY: Rate limiting for login attempts
 * Prevents brute force attacks on authentication endpoints
 * 
 * Limits:
 * - Max 10 failed attempts per IP per 15-minute window
 * - Max 5 failed attempts per identifier per 15-minute window
 * 
 * Purpose: Limit attacker's ability to guess passwords
 */
const loginAttempts = new Map<string, RateWindow>();
const loginAttemptsPerIdentifier = new Map<string, RateWindow>();

export function enforceLoginRateLimit(identifier: string, ipAddress: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const normalizedIdentifier = normalize(identifier);
  
  const enforceWindow = (
    key: string,
    max: number,
    store: Map<string, RateWindow>
  ): { allowed: boolean; retryAfterSeconds?: number } => {
    const current = store.get(key);
    if (!current || current.resetAt <= now) {
      store.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
      return { allowed: true };
    }

    if (current.count >= max) {
      return {
        allowed: false,
        retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
      };
    }

    current.count += 1;
    store.set(key, current);
    return { allowed: true };
  };

  // Opportunistic cleanup
  if (loginAttempts.size > RATE_LIMIT_MAX_KEYS || loginAttemptsPerIdentifier.size > RATE_LIMIT_MAX_KEYS) {
    for (const [key, value] of loginAttempts) {
      if (value.resetAt <= now) loginAttempts.delete(key);
    }
    for (const [key, value] of loginAttemptsPerIdentifier) {
      if (value.resetAt <= now) loginAttemptsPerIdentifier.delete(key);
    }
  }

  const byIp = enforceWindow(ipAddress || 'unknown', RATE_LIMIT_MAX_PER_IP, loginAttempts);
  if (!byIp.allowed) return byIp;

  return enforceWindow(normalizedIdentifier, RATE_LIMIT_MAX_PER_IDENTIFIER, loginAttemptsPerIdentifier);
}

/**
 * SECURITY: Rate limiting for account registration/creation
 * Prevents account enumeration and resource exhaustion attacks
 * 
 * Limits:
 * - Max 5 new accounts per IP per 15-minute window
 * - Max 3 accounts per email per 15-minute window
 * 
 * Purpose: Prevent abuse, spam account creation, and enumeration
 */
const registrationAttempts = new Map<string, RateWindow>();
const registrationPerEmail = new Map<string, RateWindow>();

export function enforceRegistrationRateLimit(email: string, ipAddress: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const normalizedEmail = normalize(email);
  
  const maxPerIp = 5; // 5 registrations per IP per window (generous for shared networks)
  const maxPerEmail = 3; // 3 attempts per email per window (prevent enumeration)
  
  const enforceWindow = (
    key: string,
    max: number,
    store: Map<string, RateWindow>
  ): { allowed: boolean; retryAfterSeconds?: number } => {
    const current = store.get(key);
    if (!current || current.resetAt <= now) {
      store.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
      return { allowed: true };
    }

    if (current.count >= max) {
      return {
        allowed: false,
        retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
      };
    }

    current.count += 1;
    store.set(key, current);
    return { allowed: true };
  };

  // Opportunistic cleanup
  if (registrationAttempts.size > RATE_LIMIT_MAX_KEYS || registrationPerEmail.size > RATE_LIMIT_MAX_KEYS) {
    for (const [key, value] of registrationAttempts) {
      if (value.resetAt <= now) registrationAttempts.delete(key);
    }
    for (const [key, value] of registrationPerEmail) {
      if (value.resetAt <= now) registrationPerEmail.delete(key);
    }
  }

  const byIp = enforceWindow(ipAddress || 'unknown', maxPerIp, registrationAttempts);
  if (!byIp.allowed) return byIp;

  return enforceWindow(normalizedEmail, maxPerEmail, registrationPerEmail);
}
