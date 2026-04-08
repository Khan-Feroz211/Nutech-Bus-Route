import bcrypt from 'bcryptjs';
import { randomBytes, createHash } from 'crypto';
import { mockStudents } from '@/lib/db';
import { prisma } from '@/lib/prisma';

const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_PER_IP = 10;
const RATE_LIMIT_MAX_PER_IDENTIFIER = 5;

let seeded = false;

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
  const windowStart = new Date(now - RATE_LIMIT_WINDOW_MS);

  await prisma.passwordResetRequest.deleteMany({
    where: { createdAt: { lt: windowStart } },
  });

  const normalizedIdentifier = normalize(identifier);
  const [ipCount, identifierCount] = await Promise.all([
    prisma.passwordResetRequest.count({ where: { ipAddress, createdAt: { gte: windowStart } } }),
    prisma.passwordResetRequest.count({ where: { identifier: normalizedIdentifier, createdAt: { gte: windowStart } } }),
  ]);

  if (ipCount >= RATE_LIMIT_MAX_PER_IP || identifierCount >= RATE_LIMIT_MAX_PER_IDENTIFIER) {
    return { allowed: false, retryAfterSeconds: Math.floor(RATE_LIMIT_WINDOW_MS / 1000) };
  }

  await prisma.passwordResetRequest.create({
    data: {
      identifier: normalizedIdentifier,
      ipAddress,
    },
  });

  return { allowed: true };
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
