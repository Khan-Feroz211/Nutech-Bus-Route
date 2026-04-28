'use client';

import { Card } from '@/components/ui/Card';
import { getBusStatusColor, getBusStatusLabel, formatETA } from '@/lib/utils';
import type { Bus, BusRoute, DriverUser } from '@/types';

interface BusStatusCardProps {
  bus: Bus;
  route: BusRoute;
  driver: DriverUser | null;
  etaMinutes: number | null;
  onTrackClick?: () => void;
}

export default function BusStatusCard({ bus, route, driver, etaMinutes, onTrackClick }: BusStatusCardProps) {
  const statusClass = getBusStatusColor(bus.status);
  const statusLabel = getBusStatusLabel(bus.status);

  return (
    <Card className="relative overflow-hidden">
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl" style={{ backgroundColor: route.color }} />

      <div className="mt-2">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900 text-base">{route.label}</h3>
            <p className="text-sm text-gray-500">{route.name}</p>
          </div>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusClass}`}>
            {bus.status === 'active' && (
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse" />
            )}
            {statusLabel}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <StatItem
            label="ETA"
            value={etaMinutes !== null ? formatETA(etaMinutes) : '—'}
            highlight={etaMinutes !== null && etaMinutes <= 5}
          />
          <StatItem
            label="Speed"
            value={bus.speed ? `${bus.speed.toFixed(0)} km/h` : '—'}
          />
          <StatItem
            label="Stops"
            value={`${route.totalStops}`}
          />
        </div>

        {/* Driver info */}
        {driver && (
          <div className="flex items-center gap-2 py-2.5 px-3 bg-gray-50 rounded-lg mb-3">
            <div className="w-8 h-8 rounded-full bg-nutech-blue flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">
                {driver.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{driver.name}</p>
              <p className="text-xs text-gray-500">{driver.employeeId}</p>
            </div>
          </div>
        )}

        {/* Bus details */}
        <div className="text-xs text-gray-500 flex items-center gap-3">
          <span>{bus.plateNumber}</span>
          <span>·</span>
          <span>{bus.model}</span>
          <span>·</span>
          <span>Cap. {bus.capacity}</span>
        </div>

        {onTrackClick && (
          <button
            onClick={onTrackClick}
            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-nutech-blue text-white text-sm font-medium hover:bg-nutech-blue-light transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Track Live
          </button>
        )}
      </div>
    </Card>
  );
}

function StatItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="text-center p-2 bg-gray-50 rounded-lg">
      <p className={`text-base font-bold ${highlight ? 'text-nutech-green' : 'text-gray-900'}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}
