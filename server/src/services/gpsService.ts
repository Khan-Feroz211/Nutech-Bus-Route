import type { LatLng } from '../types';

export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Check if a location is within radius (km) of a point.
 */
export function isNearStop(location: LatLng, stop: LatLng, radiusKm = 0.3): boolean {
  return calculateDistance(location.lat, location.lng, stop.lat, stop.lng) <= radiusKm;
}

/**
 * Estimate ETA given distance and average speed.
 */
export function estimateETA(distanceKm: number, avgSpeedKmh = 30): number {
  return Math.round((distanceKm / avgSpeedKmh) * 60);
}
