import { PrismaLibSql } from '@prisma/adapter-libsql';
import { PrismaClient } from '@/generated/prisma/client';
import path from 'path';

function getDbUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  // Build/runtime fallback for local/demo environments.
  return `file:${path.join(process.cwd(), 'prisma', 'dev.db')}`;
}

function createPrismaClient() {
  const adapter = new PrismaLibSql({ url: getDbUrl() });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
