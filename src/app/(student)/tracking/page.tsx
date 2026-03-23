'use client';

import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { useBusLocation } from '@/hooks/useBusLocation';
import { mockBuses, mockRoutes } from '@/lib/db';
import { formatTime, formatETA } from '@/lib/utils';

const BusMap = dynamic(() => import('@/components/maps/BusMap'), { ssr: false });

export default function TrackingPage() {
  const { data: session } = useSession();
  const assignedRouteId = (session?.user as Record<string, unknown>)?.assignedRouteId as string ?? 'route-a';

  const route = mockRoutes.find((r) => r.id === assignedRouteId) ?? mockRoutes[0];
  const bus = mockBuses.find((b) => b.routeId === route.id) ?? mockBuses[0];

  const { location, heading, speed, isLive, lastUpdated, etaMinutes } = useBusLocation(bus.id);

  const openInGoogleMaps = () => {
    if (!location) return;
    const url = `https://www.google.com/maps/dir/${location.lat},${location.lng}/33.6502,73.1201`;
    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)]">
      {/* Map takes most of screen */}
      <div className="flex-1 relative">
        <BusMap
          busLocation={location}
          route={route}
          heading={heading}
          height="100%"
        />

        {/* Floating info overlay */}
        <div className="absolute top-3 left-3 right-3 md:left-auto md:right-3 md:w-72">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: route.color }} />
              <span className="font-semibold text-sm text-gray-900">{route.label} – {route.area}</span>
              {isLive && (
                <span className="ml-auto flex items-center gap-1 text-xs font-medium text-green-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Live
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-gray-50 rounded-lg p-1.5">
                <p className="text-lg font-bold text-gray-900">
                  {etaMinutes !== null ? formatETA(etaMinutes) : '—'}
                </p>
                <p className="text-[10px] text-gray-500">ETA</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-1.5">
                <p className="text-lg font-bold text-gray-900">
                  {speed ? `${speed.toFixed(0)}` : '0'}
                </p>
                <p className="text-[10px] text-gray-500">km/h</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-1.5">
                <p className="text-lg font-bold text-gray-900">{bus.plateNumber.split('-')[1]}</p>
                <p className="text-[10px] text-gray-500">Bus</p>
              </div>
            </div>

            {lastUpdated && (
              <p className="text-[10px] text-gray-400 text-right mt-1">
                Updated {formatTime(lastUpdated)}
              </p>
            )}
          </div>
        </div>

        {/* Google Maps button */}
        <button
          onClick={openInGoogleMaps}
          className="absolute bottom-4 right-4 flex items-center gap-2 bg-white shadow-lg rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:shadow-xl transition-shadow border border-gray-200"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Open in Maps
        </button>
      </div>

      {/* Stops panel */}
      <div className="bg-white border-t border-gray-200 max-h-48 overflow-y-auto">
        <div className="p-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Stops</p>
          <div className="space-y-1">
            {route.stops.map((stop, i) => {
              const stopEta = etaMinutes !== null
                ? Math.max(0, etaMinutes - (route.stops.length - 1 - i) * 3)
                : null;

              return (
                <div key={stop.id} className="flex items-center gap-2 py-1">
                  <div
                    className="w-6 h-6 rounded-full text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: route.color }}
                  >
                    {i + 1}
                  </div>
                  <span className="text-sm text-gray-700 flex-1">{stop.name}</span>
                  <span className="text-xs text-gray-500">
                    {stopEta !== null ? formatETA(stopEta) : stop.morningArrival}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
