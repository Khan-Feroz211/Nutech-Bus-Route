'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { mockRoutes } from '@/lib/db';
import { formatTime } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

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

interface TrendPoint {
  label: string;
  trips: number;
  boardings: number;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');

  useEffect(() => {
    fetch('/api/analytics')
      .then((r) => r.json())
      .then((d) => { if (d.success) setData(d.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!data) {
    return <div className="max-w-4xl mx-auto px-4 py-12 text-center text-gray-400">Failed to load analytics.</div>;
  }

  const routeChartData = data.tripsByRoute.map(item => {
    const route = mockRoutes.find(r => r.id === item.routeId);
    return {
      name: route?.label || item.routeId,
      trips: item._count.id,
      color: route?.color || '#ccc'
    };
  });

  const busPassData = [
    { name: 'Pending', value: data.busPass.pendingPasses, color: '#F59E0B' },
    { name: 'Approved', value: data.busPass.approvedPasses, color: '#10B981' },
    { name: 'Paid', value: data.busPass.paidFees, color: '#3B82F6' },
  ];

  const weeklyData: TrendPoint[] = [
    { label: 'Mon', trips: 24, boardings: 180 },
    { label: 'Tue', trips: 22, boardings: 165 },
    { label: 'Wed', trips: 26, boardings: 195 },
    { label: 'Thu', trips: 20, boardings: 150 },
    { label: 'Fri', trips: 28, boardings: 210 },
    { label: 'Sat', trips: 10, boardings: 75 },
    { label: 'Sun', trips: 0, boardings: 0 },
  ];

  const monthlyData: TrendPoint[] = [
    { label: 'Week 1', trips: 85, boardings: 650 },
    { label: 'Week 2', trips: 92, boardings: 720 },
    { label: 'Week 3', trips: 78, boardings: 580 },
    { label: 'Week 4', trips: 95, boardings: 740 },
  ];

  const statCards = [
    { label: 'Total Students', value: data.overview.totalStudents, icon: '🎓', bg: 'bg-blue-50' },
    { label: 'Total Buses', value: data.overview.totalBuses, icon: '🚌', bg: 'bg-green-50' },
    { label: 'Active Routes', value: data.overview.totalRoutes, icon: '🗺️', bg: 'bg-purple-50' },
    { label: 'Trips Today', value: data.overview.tripsToday, icon: '📍', bg: 'bg-orange-50' },
    { label: 'Trips This Week', value: data.overview.tripsThisWeek, icon: '📅', bg: 'bg-yellow-50' },
    { label: 'Pending Reports', value: data.overview.pendingReports, icon: '⚠️', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time insights for NUTECH BusTrack</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeRange === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeRange === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            This Month
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="!p-4">
            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center text-2xl mb-3`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="!p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Trips & Boardings</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeRange === 'week' ? weeklyData : monthlyData}>
                <defs>
                  <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorBoardings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="label" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip />
                <Area type="monotone" dataKey="trips" stroke="#3B82F6" fillOpacity={1} fill="url(#colorTrips)" strokeWidth={2} />
                <Area type="monotone" dataKey="boardings" stroke="#10B981" fillOpacity={1} fill="url(#colorBoardings)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="!p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Trips by Route</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={routeChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" stroke="#6B7280" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#6B7280" fontSize={12} width={80} />
                <Tooltip />
                <Bar dataKey="trips" radius={[0, 4, 4, 0]}>
                  {routeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="!p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Bus Pass Status</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={busPassData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {busPassData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {busPassData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-gray-600">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="!p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Key Metrics</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Active Trips</span>
                <span className="font-medium text-gray-900">{data.overview.activeTrips}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min(100, (data.overview.activeTrips / Math.max(1, data.overview.tripsToday)) * 100)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Bus Utilization</span>
                <span className="font-medium text-gray-900">{Math.round((data.overview.tripsToday / Math.max(1, data.overview.totalBuses * 2)) * 100)}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, (data.overview.tripsToday / Math.max(1, data.overview.totalBuses * 2)) * 100)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Avg Boardings/Trip</span>
                <span className="font-medium text-gray-900">{data.overview.tripsToday > 0 ? Math.round(data.boarding.boardingsToday / data.overview.tripsToday) : 0}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '65%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Report Resolution</span>
                <span className="font-medium text-gray-900">{data.overview.totalReports > 0 ? Math.round(((data.overview.totalReports - data.overview.pendingReports) / data.overview.totalReports) * 100) : 100}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: `${data.overview.totalReports > 0 ? ((data.overview.totalReports - data.overview.pendingReports) / data.overview.totalReports) * 100 : 100}%` }} />
              </div>
            </div>
          </div>
        </Card>

        <Card className="!p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Quick Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">{data.boarding.boardingsToday}</p>
              <p className="text-xs text-blue-700 mt-1">Boardings Today</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{data.boarding.boardingsThisWeek}</p>
              <p className="text-xs text-green-700 mt-1">This Week</p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-yellow-600">{data.busPass.pendingPasses}</p>
              <p className="text-xs text-yellow-700 mt-1">Pending Passes</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-red-600">{data.overview.pendingReports}</p>
              <p className="text-xs text-red-700 mt-1">Open Reports</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="!p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Recent Trips</h2>
        {data.recentTrips.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No trips recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left pb-3 pr-4 text-xs font-semibold text-gray-500 uppercase">Bus</th>
                  <th className="text-left pb-3 pr-4 text-xs font-semibold text-gray-500 uppercase">Route</th>
                  <th className="text-left pb-3 pr-4 text-xs font-semibold text-gray-500 uppercase">Started</th>
                  <th className="text-left pb-3 pr-4 text-xs font-semibold text-gray-500 uppercase">Direction</th>
                  <th className="text-left pb-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.recentTrips.slice(0, 5).map((trip) => (
                  <tr key={trip.id} className="hover:bg-gray-50">
                    <td className="py-3 pr-4 font-medium text-gray-900">{trip.bus.plateNumber}</td>
                    <td className="py-3 pr-4">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: trip.route.color }} />
                        {trip.route.label}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-gray-500">{formatTime(trip.startTime)}</td>
                    <td className="py-3 pr-4 capitalize text-gray-600">{trip.direction}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        trip.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {trip.status}
                      </span>
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
