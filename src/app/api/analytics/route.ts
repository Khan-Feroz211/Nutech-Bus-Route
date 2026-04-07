import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@/types';

export async function GET(): Promise<NextResponse> {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart.getTime() - 6 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalStudents,
      totalBuses,
      totalRoutes,
      tripsToday,
      tripsThisWeek,
      activeTrips,
      pendingReports,
      totalReports,
      pendingPasses,
      approvedPasses,
      paidFees,
      boardingsToday,
      boardingsThisWeek,
      recentTrips,
      tripsByRoute,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'student' } }),
      prisma.bus.count(),
      prisma.busRoute.count(),
      prisma.trip.count({ where: { startTime: { gte: todayStart } } }),
      prisma.trip.count({ where: { startTime: { gte: weekStart } } }),
      prisma.trip.count({ where: { status: 'active' } }),
      prisma.report.count({ where: { status: 'pending' } }),
      prisma.report.count(),
      prisma.busPassApplication.count({ where: { status: 'pending' } }),
      prisma.busPassApplication.count({ where: { status: 'approved' } }),
      prisma.busPassApplication.count({ where: { feeStatus: 'paid' } }),
      prisma.boardingLog.count({ where: { boardedAt: { gte: todayStart } } }),
      prisma.boardingLog.count({ where: { boardedAt: { gte: weekStart } } }),
      prisma.trip.findMany({
        orderBy: { startTime: 'desc' },
        take: 10,
        include: { bus: { select: { plateNumber: true } }, route: { select: { label: true, color: true } } },
      }),
      prisma.trip.groupBy({
        by: ['routeId'],
        _count: { id: true },
        where: { startTime: { gte: monthStart } },
        orderBy: { _count: { id: 'desc' } },
      }),
    ]);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        overview: {
          totalStudents,
          totalBuses,
          totalRoutes,
          tripsToday,
          tripsThisWeek,
          activeTrips,
          pendingReports,
          totalReports,
        },
        busPass: {
          pendingPasses,
          approvedPasses,
          paidFees,
        },
        boarding: {
          boardingsToday,
          boardingsThisWeek,
        },
        recentTrips,
        tripsByRoute,
      },
    });
  } catch (err) {
    console.error('[Analytics API]', err);
    return NextResponse.json<ApiResponse>({ success: false, error: 'DB error' }, { status: 500 });
  }
}
