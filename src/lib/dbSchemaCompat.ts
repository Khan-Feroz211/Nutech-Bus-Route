import { prisma } from '@/lib/prisma';

let userFcmTokenEnsured = false;

function isDuplicateColumnError(error: unknown): boolean {
  const message = String(error);
  return /duplicate column name|already exists/i.test(message);
}

export async function ensureUserFcmTokenColumn(): Promise<void> {
  if (userFcmTokenEnsured) return;

  try {
    await prisma.$executeRawUnsafe('ALTER TABLE "User" ADD COLUMN "fcmToken" TEXT');
  } catch (error) {
    if (!isDuplicateColumnError(error)) {
      throw error;
    }
  }

  // Keep index aligned with schema for faster token lookups; harmless if it already exists.
  await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "User_fcmToken_idx" ON "User"("fcmToken")');

  userFcmTokenEnsured = true;
}
