'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import ScheduleCard from '@/components/student/ScheduleCard';
import { mockRoutes } from '@/lib/db';

export default function SchedulePage() {
  const { data: session } = useSession();
  const [direction, setDirection] = useState<'morning' | 'evening'>('morning');

  const assignedRouteId = (session?.user as Record<string, unknown>)?.assignedRouteId as string ?? 'route-a';
  const myRoute = mockRoutes.find((r) => r.id === assignedRouteId) ?? mockRoutes[0];

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Schedule</h1>
        <p className="text-sm text-gray-500 mt-0.5">Bus timetable for {new Date().toLocaleDateString('en-PK', { weekday: 'long' })}</p>
      </div>

      {/* Direction toggle */}
      <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
        {(['morning', 'evening'] as const).map((d) => (
          <button
            key={d}
            onClick={() => setDirection(d)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              direction === d
                ? 'bg-white text-nutech-blue shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {d === 'morning' ? '🌅' : '🌆'} {d}
          </button>
        ))}
      </div>

      {/* My route first */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-nutech-blue" />
          <span className="text-sm font-semibold text-gray-700">Your Route</span>
        </div>
        <ScheduleCard route={myRoute} direction={direction} />
      </div>

      {/* All routes */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-semibold text-gray-700">All Routes</span>
        </div>
        <div className="space-y-3">
          {mockRoutes
            .filter((r) => r.id !== myRoute.id)
            .map((route) => (
              <ScheduleCard key={route.id} route={route} direction={direction} />
            ))}
        </div>
      </div>

      {/* Notes */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
        <p className="font-semibold mb-1">ℹ️ Note</p>
        <p>Timings may vary due to traffic. Bus tracking is live. Check the Track page for real-time ETA.</p>
      </div>
    </div>
  );
}
