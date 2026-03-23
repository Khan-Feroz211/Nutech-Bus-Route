'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import type { LatLng, GPSUpdatePayload } from '@/types';
import { mockBuses, mockRoutes } from '@/lib/db';

interface BusLocationState {
  location: LatLng | null;
  heading: number;
  speed: number;
  isLive: boolean;
  lastUpdated: Date | null;
  etaMinutes: number | null;
}

export function useBusLocation(busId: string, simulate = true) {
  const [state, setState] = useState<BusLocationState>({
    location: null,
    heading: 0,
    speed: 0,
    isLive: false,
    lastUpdated: null,
    etaMinutes: null,
  });

  const waypointIndexRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getBusWaypoints = useCallback(() => {
    const bus = mockBuses.find((b) => b.id === busId);
    if (!bus) return [];
    const route = mockRoutes.find((r) => r.id === bus.routeId);
    return route?.waypoints ?? [];
  }, [busId]);

  const simulateMovement = useCallback(() => {
    const waypoints = getBusWaypoints();
    if (waypoints.length === 0) return;

    const currentIndex = waypointIndexRef.current;
    const nextIndex = (currentIndex + 1) % waypoints.length;
    const currentWp = waypoints[currentIndex];

    // calculate heading
    const nextWp = waypoints[nextIndex];
    const dLng = nextWp.lng - currentWp.lng;
    const dLat = nextWp.lat - currentWp.lat;
    const heading = (Math.atan2(dLng, dLat) * 180) / Math.PI;

    waypointIndexRef.current = nextIndex;

    const totalStops = waypoints.length;
    const remaining = totalStops - currentIndex;
    const etaMinutes = Math.max(0, Math.round(remaining * 2.5));

    setState({
      location: currentWp,
      heading: (heading + 360) % 360,
      speed: 25 + Math.random() * 20,
      isLive: true,
      lastUpdated: new Date(),
      etaMinutes,
    });
  }, [getBusWaypoints]);

  useEffect(() => {
    // Set initial location
    const bus = mockBuses.find((b) => b.id === busId);
    if (bus?.currentLocation) {
      setState((prev) => ({
        ...prev,
        location: bus.currentLocation!,
        heading: bus.heading ?? 0,
        speed: bus.speed ?? 0,
        lastUpdated: bus.lastUpdated ?? new Date(),
        isLive: bus.status === 'active',
      }));
    }

    if (!simulate) return;

    // Start simulation
    intervalRef.current = setInterval(simulateMovement, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [busId, simulate, simulateMovement]);

  const handleExternalUpdate = useCallback((payload: GPSUpdatePayload) => {
    if (payload.busId !== busId) return;
    setState({
      location: payload.location,
      heading: payload.heading ?? 0,
      speed: payload.speed ?? 0,
      isLive: true,
      lastUpdated: new Date(payload.timestamp),
      etaMinutes: null,
    });
  }, [busId]);

  return { ...state, handleExternalUpdate };
}
