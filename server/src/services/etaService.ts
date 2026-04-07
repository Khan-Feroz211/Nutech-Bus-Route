import { calculateDistance, estimateETA } from './gpsService';
import type { LatLng } from '../types';

interface Stop {
  id: string;
  name: string;
  location: LatLng;
  order: number;
}

export function calculateETAToStop(
  busLocation: LatLng,
  stop: Stop,
  avgSpeedKmh = 30
): { etaMinutes: number; distanceKm: number } {
  const distanceKm = calculateDistance(
    busLocation.lat,
    busLocation.lng,
    stop.location.lat,
    stop.location.lng
  );
  const etaMinutes = estimateETA(distanceKm, avgSpeedKmh);
  return { etaMinutes, distanceKm };
}

export function calculateETAToAllStops(
  busLocation: LatLng,
  stops: Stop[],
  avgSpeedKmh = 30
): Array<{ stopId: string; stopName: string; etaMinutes: number; distanceKm: number }> {
  return stops.map((stop) => {
    const { etaMinutes, distanceKm } = calculateETAToStop(busLocation, stop, avgSpeedKmh);
    return { stopId: stop.id, stopName: stop.name, etaMinutes, distanceKm };
  });
}
