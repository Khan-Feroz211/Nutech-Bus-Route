import { Card } from '@/components/ui/Card';
import type { BusRoute } from '@/types';

interface ScheduleCardProps {
  route: BusRoute;
  direction: 'morning' | 'evening';
}

export default function ScheduleCard({ route, direction }: ScheduleCardProps) {
  const isMorning = direction === 'morning';

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: route.color }}
          />
          <span className="font-semibold text-gray-900">{route.label}</span>
        </div>
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          {isMorning ? '🌅 Morning' : '🌆 Evening'}
        </span>
      </div>

      <div className="space-y-2">
        {route.stops.map((stop, index) => {
          const arrival = isMorning ? stop.morningArrival : stop.eveningArrival;
          const isFirst = index === 0;
          const isLast = index === route.stops.length - 1;

          return (
            <div key={stop.id} className="flex items-center gap-3">
              {/* Timeline dot */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-3 h-3 rounded-full border-2 ${
                    isFirst || isLast ? 'w-4 h-4' : ''
                  }`}
                  style={{
                    borderColor: route.color,
                    backgroundColor: isFirst || isLast ? route.color : 'white',
                  }}
                />
                {!isLast && (
                  <div className="w-0.5 h-4" style={{ backgroundColor: route.color, opacity: 0.3 }} />
                )}
              </div>

              {/* Stop info */}
              <div className="flex-1 flex items-center justify-between pb-1">
                <span className={`text-sm ${isFirst || isLast ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                  {stop.name}
                </span>
                <span className={`text-sm font-medium ${isFirst || isLast ? 'text-nutech-blue' : 'text-gray-500'}`}>
                  {arrival}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <span>Duration: {route.estimatedDuration}</span>
        <span>{route.totalStops} stops</span>
      </div>
    </Card>
  );
}
