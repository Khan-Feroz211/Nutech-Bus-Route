'use client';

import { formatETA } from '@/lib/utils';

interface ETADisplayProps {
  etaMinutes: number | null;
  stopName?: string;
  isLive?: boolean;
}

export default function ETADisplay({ etaMinutes, stopName, isLive = false }: ETADisplayProps) {
  const urgency =
    etaMinutes === null
      ? 'unknown'
      : etaMinutes <= 0
      ? 'arrived'
      : etaMinutes <= 5
      ? 'imminent'
      : etaMinutes <= 15
      ? 'soon'
      : 'normal';

  const colors = {
    unknown: 'text-gray-400 bg-gray-50 border-gray-200',
    arrived: 'text-green-700 bg-green-50 border-green-200',
    imminent: 'text-orange-700 bg-orange-50 border-orange-200',
    soon: 'text-yellow-700 bg-yellow-50 border-yellow-200',
    normal: 'text-nutech-blue bg-blue-50 border-blue-200',
  };

  return (
    <div className={`rounded-xl border p-4 text-center ${colors[urgency]}`}>
      {isLive && urgency !== 'unknown' && (
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-medium text-green-600">Live</span>
        </div>
      )}
      <p className="text-4xl font-bold tracking-tight">
        {etaMinutes === null ? '—' : etaMinutes <= 0 ? 'Here!' : formatETA(etaMinutes)}
      </p>
      {stopName && <p className="text-sm mt-1 opacity-80">{stopName}</p>}
      {urgency === 'imminent' && (
        <p className="text-xs font-medium mt-1 animate-bounce">Bus arriving soon!</p>
      )}
    </div>
  );
}
