'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { mockRoutes } from '@/lib/db';
import { formatTime } from '@/lib/utils';

interface AnalyticsData {
  overview: {
    totalStudents: number;
    totalBuses: number;
    totalRoutes: number;
    tripsToday: number;
    tripsThisWeek: number;
    activeTrips: number;
    pendingReports: number;
    totalReports: number;
  };
  busPass: {
    pendingPasses: number;
    approvedPasses: number;
    paidFees: number;
  };
  boarding: {
    boardingsToday: number;
    boardingsThisWeek: number;
  };
  recentTrips: Array<{
    id: string;
    startTime: string;
    endTime?: string;
    status: string;
    direction: string;
    bus: { plateNumber: string };
    route: { label: string; color: string };
  }>;
  tripsByRoute: Array<{ routeId: string; _count: { id: number } }>;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then((r) => r.json())
      .then((d) => { if (d.success) setData(d.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-12 text-center text-gray-400">Loading analytics…</div>;
  }

  if (!data) {
    return <div className="max-w-4xl mx-auto px-4 py-12 text-center text-gray-400">Failed to load analytics.</div>;
  }

  const statCards = [
    { label: 'Total Students', value: data.overview.totalStudents, icon: '🎓', color: 'bg-blue-50 text-nutech-blue' },
    { label: 'Total Buses', value: data.overview.totalBuses, icon: '🚌', color: 'bg-green-50 text-green-700' },
    { label: 'Active Routes', value: data.overview.totalRoutes, icon: '🗺️', color: 'bg-purple-50 text-purple-700' },
    { label: 'Trips Today', value: data.overview.tripsToday, icon: '📍', color: 'bg-orange-50 text-orange-700' },
    { label: 'Trips This Week', value: data.overview.tripsThisWeek, icon: '📅', color: 'bg-yellow-50 text-yellow-700' },
    { label: 'Pending Reports', value: data.overview.pendingReports, icon: '⚠️', color: 'bg-red-50 text-red-700' },
    { label: 'Bus Pass Applications', value: data.busPass.pendingPasses, icon: '📋', color: 'bg-indigo-50 text-indigo-700' },
    { label: 'Boardings Today', value: data.boarding.boardingsToday, icon: '✅', color: 'bg-teal-50 text-teal-700' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Analytics & Reports</h1>
        <p className="text-sm text-gray-500 mt-0.5">Live operational data for NUTECH BusTrack</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map((s) => (
          <Card key={s.label} className="!p-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-2 ${s.color}`}>{s.icon}</div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Bus pass & fee stats */}
      <Card>
        <h2 className="font-semibold text-gray-900 mb-4">Bus Pass & Fee Status</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-3xl font-bold text-yellow-600">{data.busPass.pendingPasses}</p>
            <p className="text-xs text-gray-500 mt-1">Pending Applications</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-green-600">{data.busPass.approvedPasses}</p>
            <p className="text-xs text-gray-500 mt-1">Approved Passes</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-nutech-blue">{data.busPass.paidFees}</p>
            <p className="text-xs text-gray-500 mt-1">Fees Paid</p>
          </div>
        </div>
      </Card>

      {/* Monthly trips by route */}
      {data.tripsByRoute.length > 0 && (
        <Card>
          <h2 className="font-semibold text-gray-900 mb-4">Trips This Month (by Route)</h2>
          <div className="space-y-3">
            {data.tripsByRoute.map((item) => {
              const route = mockRoutes.find((r) => r.id === item.routeId);
              return (
                <div key={item.routeId} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: route?.color ?? '#ccc' }}>
                    {route?.label.replace('Route ', '') ?? '?'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{route?.label ?? item.routeId}</p>
                    <div className="h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                      <div className="h-1.5 rounded-full" style={{ backgroundColor: route?.color ?? '#ccc', width: `${Math.min(100, (item._count.id / (data.tripsByRoute[0]?._count.id || 1)) * 100)}%` }} />
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-700">{item._count.id}</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Recent trips */}
      <Card>
        <h2 className="font-semibold text-gray-900 mb-4">Recent Trips</h2>
        {data.recentTrips.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No trips recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left pb-2 pr-4 text-xs font-semibold text-gray-500 uppercase">Bus</th>
                  <th className="text-left pb-2 pr-4 text-xs font-semibold text-gray-500 uppercase">Route</th>
                  <th className="text-left pb-2 pr-4 text-xs font-semibold text-gray-500 uppercase">Started</th>
                  <th className="text-left pb-2 pr-4 text-xs font-semibold text-gray-500 uppercase">Direction</th>
                  <th className="text-left pb-2 text-xs font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.recentTrips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-gray-50">
                    <td className="py-2 pr-4 font-medium text-gray-900">{trip.bus.plateNumber}</td>
                    <td className="py-2 pr-4">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: trip.route.color }} />
                        {trip.route.label}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-gray-500 text-xs">{formatTime(trip.startTime)}</td>
                    <td className="py-2 pr-4 capitalize text-gray-600">{trip.direction}</td>
                    <td className="py-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        trip.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>{trip.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
