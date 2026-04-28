import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

export function formatETA(minutes: number): string {
  if (minutes <= 0) return 'Arrived';
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function calculateDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function getBusStatusColor(status: string): string {
  switch (status) {
    case 'active': return 'text-green-600 bg-green-50 border-green-200';
    case 'idle': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'offline': return 'text-gray-600 bg-gray-50 border-gray-200';
    case 'maintenance': return 'text-red-600 bg-red-50 border-red-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

export function getBusStatusLabel(status: string): string {
  switch (status) {
    case 'active': return 'Live';
    case 'idle': return 'Idle';
    case 'offline': return 'Offline';
    case 'maintenance': return 'Maintenance';
    default: return status;
  }
}
