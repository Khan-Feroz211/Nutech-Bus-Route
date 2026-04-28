'use client';

import { useSession } from 'next-auth/react';
import TripControls from '@/components/driver/TripControls';
import { Card } from '@/components/ui/Card';
import { mockBuses, mockRoutes, mockDrivers } from '@/lib/db';

export default function DriverPage() {
  const { data: session } = useSession();
  const employeeId = (session?.user as Record<string, unknown>)?.employeeId as string ?? 'DRV-001';
  const assignedBusId = (session?.user as Record<string, unknown>)?.assignedBusId as string ?? 'bus-001';

  const driver = mockDrivers.find((d) => d.employeeId === employeeId) ?? mockDrivers[0];
  const bus = mockBuses.find((b) => b.id === assignedBusId) ?? mockBuses[0];
  const route = mockRoutes.find((r) => r.id === bus.routeId) ?? mockRoutes[0];

  return (
    <div className="max-w-md mx-auto px-4 py-4 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Driver Portal</h1>
        <p className="text-sm text-gray-500 mt-0.5">Welcome, {driver.name}</p>
      </div>

      {/* Route & bus info */}
      <Card>
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: route.color }}
          >
            {route.label.replace('Route ', '')}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{route.label}</p>
            <p className="text-sm text-gray-500">{route.area}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-2.5 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">Bus Plate</p>
            <p className="font-semibold text-gray-900 mt-0.5">{bus.plateNumber}</p>
          </div>
          <div className="p-2.5 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">Model</p>
            <p className="font-semibold text-gray-900 mt-0.5 text-xs leading-tight">{bus.model}</p>
          </div>
          <div className="p-2.5 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">🌅 Morning</p>
            <p className="font-semibold text-nutech-blue mt-0.5">{route.morningDeparture}</p>
          </div>
          <div className="p-2.5 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">🌆 Evening</p>
            <p className="font-semibold text-orange-600 mt-0.5">{route.eveningDeparture}</p>
          </div>
        </div>
      </Card>

      {/* Trip controls */}
      <TripControls
        busId={bus.id}
        driverId={driver.id}
        routeId={route.id}
        driverName={driver.name}
      />

      {/* Stops quick reference */}
      <Card>
        <h3 className="font-semibold text-gray-900 mb-3">Route Stops</h3>
        <div className="space-y-2">
          {route.stops.map((stop, i) => (
            <div key={stop.id} className="flex items-center gap-2.5 text-sm">
              <span
                className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: route.color }}
              >
                {i + 1}
              </span>
              <span className="flex-1 text-gray-700">{stop.name}</span>
              <span className="text-gray-400 text-xs">{stop.morningArrival}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
