import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  services: {
    database: {
      status: 'up' | 'down';
      latency?: number;
      error?: string;
    };
    socket: {
      status: 'up' | 'down';
    };
  };
  version: string;
}

const startTime = Date.now();

export async function GET() {
  const health: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
    services: {
      database: {
        status: 'down',
      },
      socket: {
        status: 'up',
      },
    },
    version: process.env.npm_package_version || '0.1.0',
  };

  const dbStart = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    health.services.database = {
      status: 'up',
      latency: Date.now() - dbStart,
    };
  } catch (error) {
    health.services.database = {
      status: 'down',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    health.status = 'degraded';
  }

  const hasDownService = Object.values(health.services).some(
    (service) => 'status' in service && service.status === 'down'
  );

  if (hasDownService) {
    health.status = 'unhealthy';
  }

  const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;

  return NextResponse.json(health, { status: statusCode });
}
