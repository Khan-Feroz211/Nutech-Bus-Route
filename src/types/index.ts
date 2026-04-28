// ─── User & Auth ────────────────────────────────────────────────────────────

export type UserRole = 'student' | 'driver' | 'admin';

export interface User {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface StudentUser extends User {
  role: 'student';
  rollNumber: string;
  assignedRouteId: string;
  phoneNumber?: string;
  address?: string;
}

export interface DriverUser extends User {
  role: 'driver';
  employeeId: string;
  assignedBusId: string;
  licenseNumber?: string;
  phoneNumber?: string;
}

export interface AdminUser extends User {
  role: 'admin';
  email: string;
}

// ─── Bus & Routes ────────────────────────────────────────────────────────────

export interface BusRoute {
  id: string;
  name: string;
  label: string; // e.g., "Route A"
  color: string; // hex color for the polyline
  area: string; // e.g., "Rawalpindi"
  totalStops: number;
  morningDeparture: string; // e.g., "7:30 AM"
  eveningDeparture: string;
  estimatedDuration: string; // e.g., "45 min"
  stops: RouteStop[];
  waypoints: LatLng[];
}

export interface RouteStop {
  id: string;
  name: string;
  location: LatLng;
  order: number;
  morningArrival: string;
  eveningArrival: string;
}

export interface Bus {
  id: string;
  plateNumber: string;
  routeId: string;
  driverId: string;
  capacity: number;
  model: string;
  status: BusStatus;
  currentLocation?: LatLng;
  lastUpdated?: Date;
  heading?: number; // degrees
  speed?: number; // km/h
}

export type BusStatus = 'active' | 'idle' | 'offline' | 'maintenance';

export interface LatLng {
  lat: number;
  lng: number;
}

// ─── Trip ────────────────────────────────────────────────────────────────────

export interface Trip {
  id: string;
  busId: string;
  driverId: string;
  routeId: string;
  startTime: Date;
  endTime?: Date;
  status: TripStatus;
  direction: 'morning' | 'evening';
  locationHistory: LocationPoint[];
}

export type TripStatus = 'pending' | 'active' | 'completed' | 'cancelled';

export interface LocationPoint {
  location: LatLng;
  timestamp: Date;
  speed?: number;
  heading?: number;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  createdAt: Date;
  read: boolean;
  targetRole?: UserRole | 'all';
  routeId?: string;
}

export type NotificationType = 'info' | 'warning' | 'delay' | 'arrival' | 'system';

export interface NotificationPreferences {
  busArrival: boolean;
  delays: boolean;
  announcements: boolean;
  tripStart: boolean;
}

// ─── Reports ────────────────────────────────────────────────────────────────

export interface Report {
  id: string;
  studentId: string;
  busId?: string;
  routeId?: string;
  type: ReportType;
  description: string;
  createdAt: Date;
  status: 'pending' | 'resolved' | 'dismissed';
}

export type ReportType =
  | 'delay'
  | 'driver_behavior'
  | 'bus_condition'
  | 'route_issue'
  | 'safety'
  | 'other';

// ─── Socket Events ───────────────────────────────────────────────────────────

export interface GPSUpdatePayload {
  busId: string;
  driverId: string;
  location: LatLng;
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

// ─── API Responses ───────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ─── ETA ────────────────────────────────────────────────────────────────────

export interface ETAInfo {
  stopId: string;
  stopName: string;
  etaMinutes: number;
  distanceKm: number;
}
