// Shared types for the server
export interface GPSUpdatePayload {
  busId: string;
  driverId: string;
  location: { lat: number; lng: number };
  speed?: number;
  heading?: number;
  timestamp: number;
}

export interface TripEventPayload {
  busId: string;
  driverId: string;
  routeId: string;
  event: 'start' | 'end' | 'pause';
  timestamp: number;
}

export interface LatLng {
  lat: number;
  lng: number;
}
