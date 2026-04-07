'use client';

import { Badge } from '@/components/ui/Badge';
import { getBusStatusLabel } from '@/lib/utils';
import type { Bus, BusRoute, DriverUser } from '@/types';

interface BusTableProps {
  buses: Bus[];
  routes: BusRoute[];
  drivers: DriverUser[];
}

export default function BusTable({ buses, routes, drivers }: BusTableProps) {
  const statusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'idle': return 'warning';
      case 'maintenance': return 'danger';
      default: return 'default';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left pb-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Bus</th>
            <th className="text-left pb-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Route</th>
            <th className="text-left pb-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Driver</th>
            <th className="text-left pb-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Speed</th>
            <th className="text-left pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {buses.map((bus) => {
            const route = routes.find((r) => r.id === bus.routeId);
            const driver = drivers.find((d) => d.assignedBusId === bus.id);

            return (
              <tr key={bus.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 pr-4">
                  <div>
                    <p className="font-medium text-gray-900">{bus.plateNumber}</p>
                    <p className="text-xs text-gray-500">{bus.model}</p>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: route?.color ?? '#ccc' }}
                    />
                    <div>
                      <p className="font-medium text-gray-800">{route?.label ?? '—'}</p>
                      <p className="text-xs text-gray-500">{route?.area ?? '—'}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <p className="text-gray-800">{driver?.name ?? '—'}</p>
                  <p className="text-xs text-gray-500">{driver?.employeeId ?? ''}</p>
                </td>
                <td className="py-3 pr-4">
                  <span className="font-medium text-gray-800">
                    {bus.speed !== undefined ? `${bus.speed.toFixed(0)} km/h` : '—'}
                  </span>
                </td>
                <td className="py-3">
                  <Badge variant={statusBadgeVariant(bus.status) as 'success' | 'warning' | 'danger' | 'default'}>
                    {bus.status === 'active' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block mr-1" />
                    )}
                    {getBusStatusLabel(bus.status)}
                  </Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
