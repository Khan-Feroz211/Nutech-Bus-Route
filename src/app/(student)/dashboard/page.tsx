'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/Card';
import BusStatusCard from '@/components/student/BusStatusCard';
import ETADisplay from '@/components/student/ETADisplay';
import { useBusLocation } from '@/hooks/useBusLocation';
import { mockBuses, mockRoutes, mockDrivers, mockNotifications } from '@/lib/db';
import { formatDate } from '@/lib/utils';

const BusMap = dynamic(() => import('@/components/maps/BusMap'), { ssr: false });

export default function StudentDashboard() {
  const { data: session } = useSession();
  const router = useRouter();

  const assignedRouteId = (session?.user as Record<string, unknown>)?.assignedRouteId as string ?? 'route-a';
  const studentName = session?.user?.name ?? 'Student';

  const route = mockRoutes.find((r) => r.id === assignedRouteId) ?? mockRoutes[0];
  const bus = mockBuses.find((b) => b.routeId === route.id) ?? mockBuses[0];
  const driver = mockDrivers.find((d) => d.assignedBusId === bus.id) ?? null;

  const { location, heading, etaMinutes, isLive } = useBusLocation(bus.id);

  const unreadNotifs = mockNotifications.filter(
    (n) => !n.read && (!n.routeId || n.routeId === assignedRouteId)
  ).length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
      {/* Greeting */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Good {getGreeting()}, {studentName.split(' ')[0]}! 👋
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{formatDate(new Date())}</p>
        </div>
        {unreadNotifs > 0 && (
          <button
            onClick={() => router.push('/notifications')}
            className="flex items-center gap-1.5 bg-red-50 text-red-600 text-xs font-medium px-2.5 py-1.5 rounded-full"
          >
            🔔 {unreadNotifs} new
          </button>
        )}
      </div>

      {/* ETA highlight */}
      <ETADisplay
        etaMinutes={etaMinutes}
        stopName={`Your stop: ${route.stops[0].name}`}
        isLive={isLive}
      />

      {/* Map */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-700">Live Location</h2>
          <button
            onClick={() => router.push('/tracking')}
            className="text-xs text-nutech-blue font-medium hover:underline"
          >
            Full screen →
          </button>
        </div>
        <BusMap busLocation={location} route={route} heading={heading} height="220px" />
      </div>

      {/* Bus status card */}
      <BusStatusCard
        bus={{ ...bus, currentLocation: location ?? bus.currentLocation }}
        route={route}
        driver={driver}
        etaMinutes={etaMinutes}
        onTrackClick={() => router.push('/tracking')}
      />

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <QuickAction icon="📅" label="Schedule" onClick={() => router.push('/schedule')} />
        <QuickAction icon="🚨" label="Report Issue" onClick={() => router.push('/report')} />
        <QuickAction icon="🔔" label="Notifications" onClick={() => router.push('/notifications')} badge={unreadNotifs} />
        <QuickAction icon="👤" label="My Profile" onClick={() => router.push('/profile')} />
      </div>

      {/* Route info */}
      <Card>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: route.color }}>
            {route.label.replace('Route ', '')}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{route.label}</p>
            <p className="text-sm text-gray-500">{route.area} · {route.totalStops} stops · {route.estimatedDuration}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-2.5 bg-blue-50 rounded-lg">
            <p className="text-xs text-gray-500">Morning Departure</p>
            <p className="font-semibold text-nutech-blue mt-0.5">{route.morningDeparture}</p>
          </div>
          <div className="p-2.5 bg-orange-50 rounded-lg">
            <p className="text-xs text-gray-500">Evening Departure</p>
            <p className="font-semibold text-orange-600 mt-0.5">{route.eveningDeparture}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function QuickAction({
  icon,
  label,
  onClick,
  badge,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className="relative flex items-center gap-3 p-3.5 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-nutech-blue/30 transition-all text-left"
    >
      <span className="text-2xl">{icon}</span>
      <span className="font-medium text-gray-800 text-sm">{label}</span>
      {badge ? (
        <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
          {badge}
        </span>
      ) : null}
    </button>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
