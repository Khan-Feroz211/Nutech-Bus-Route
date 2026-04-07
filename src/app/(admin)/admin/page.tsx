'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/Card';
import BusTable from '@/components/admin/BusTable';
import { mockRoutes, mockDrivers } from '@/lib/db';
import type { Bus } from '@/types';

const FleetMap = dynamic(() => import('@/components/maps/FleetMap'), { ssr: false });

export default function AdminDashboard() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/buses')
      .then((r) => r.json())
      .then((d) => { if (d.success) setBuses(d.data); })
      .finally(() => setLoading(false));
  }, []);

  const activeBuses = buses.filter((b) => b.status === 'active').length;
  const idleBuses = buses.filter((b) => b.status === 'idle').length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Fleet Overview</h1>
        <p className="text-sm text-gray-500 mt-0.5">Real-time status of all NUTECH buses</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Buses" value={buses.length.toString()} icon="🚌" color="blue" />
        <StatCard label="Active" value={activeBuses.toString()} icon="✅" color="green" />
        <StatCard label="Idle" value={idleBuses.toString()} icon="⏸️" color="yellow" />
        <StatCard label="Routes" value={mockRoutes.length.toString()} icon="🗺️" color="purple" />
      </div>

      {/* Fleet map */}
      <Card padding="none" className="overflow-hidden">
        <div className="px-4 pt-4 pb-2 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Live Fleet Map</h2>
        </div>
        <FleetMap buses={buses} routes={mockRoutes} height="450px" />
      </Card>

      {/* Bus table */}
      <Card>
        <h2 className="font-semibold text-gray-900 mb-4">Bus Status</h2>
        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading…</div>
        ) : (
          <BusTable buses={buses} routes={mockRoutes} drivers={mockDrivers} />
        )}
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'purple';
}) {
  const colors = {
    blue: 'bg-blue-50 border-blue-100',
    green: 'bg-green-50 border-green-100',
    yellow: 'bg-yellow-50 border-yellow-100',
    purple: 'bg-purple-50 border-purple-100',
  };

  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-600 mt-0.5">{label}</p>
    </div>
  );
}

