'use client';

import { Card } from '@/components/ui/Card';
import { mockRoutes, mockBuses } from '@/lib/db';

export default function AdminRoutesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Routes Management</h1>

      <div className="space-y-4">
        {mockRoutes.map((route) => {
          const bus = mockBuses.find((b) => b.routeId === route.id);

          return (
            <Card key={route.id}>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: route.color }}
                >
                  {route.label.replace('Route ', '')}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{route.label}</h3>
                  <p className="text-sm text-gray-500">{route.name} · {route.area}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-medium text-gray-800">{bus?.plateNumber ?? '—'}</p>
                  <p className={`text-xs ${bus?.status === 'active' ? 'text-green-600' : 'text-gray-400'}`}>
                    {bus?.status ?? 'no bus'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-3 text-sm">
                <div className="p-2 bg-gray-50 rounded-lg text-center">
                  <p className="text-xs text-gray-500">Stops</p>
                  <p className="font-semibold">{route.totalStops}</p>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg text-center">
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="font-semibold">{route.estimatedDuration}</p>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg text-center">
                  <p className="text-xs text-gray-500">Morning</p>
                  <p className="font-semibold">{route.morningDeparture}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Stops</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {route.stops.map((stop, i) => (
                    <div key={stop.id} className="flex items-center gap-2 text-sm text-gray-700">
                      <span
                        className="w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: route.color }}
                      >
                        {i + 1}
                      </span>
                      {stop.name}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
