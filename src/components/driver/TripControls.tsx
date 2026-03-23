'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import type { GPSUpdatePayload, TripEventPayload } from '@/types';

interface TripControlsProps {
  busId: string;
  driverId: string;
  routeId: string;
  driverName: string;
  onLocationUpdate?: (payload: GPSUpdatePayload) => void;
}

type TripStatus = 'idle' | 'active' | 'paused';

export default function TripControls({
  busId,
  driverId,
  routeId,
  driverName,
  onLocationUpdate,
}: TripControlsProps) {
  const [tripStatus, setTripStatus] = useState<TripStatus>('idle');
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const sendLocation = useCallback((lat: number, lng: number, speed?: number, heading?: number) => {
    const payload: GPSUpdatePayload = {
      busId,
      driverId,
      location: { lat, lng },
      speed,
      heading,
      timestamp: Date.now(),
    };

    // In real app this would go via socket.io
    console.log('[TripControls] GPS Update:', payload);
    onLocationUpdate?.(payload);
  }, [busId, driverId, onLocationUpdate]);

  const startGPSWatch = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation not supported on this device.');
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, speed, accuracy: acc } = pos.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        setAccuracy(acc);
        setGpsError(null);
        sendLocation(latitude, longitude, speed ?? undefined);
      },
      (err) => {
        setGpsError(`GPS Error: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
  }, [sendLocation]);

  const stopGPSWatch = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const startTrip = useCallback(() => {
    setTripStatus('active');
    setElapsedSeconds(0);
    startGPSWatch();

    timerRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);

    const event: TripEventPayload = {
      busId,
      driverId,
      routeId,
      event: 'start',
      timestamp: Date.now(),
    };
    console.log('[TripControls] Trip started:', event);
  }, [busId, driverId, routeId, startGPSWatch]);

  const endTrip = useCallback(() => {
    setTripStatus('idle');
    stopGPSWatch();
    if (timerRef.current) clearInterval(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);

    const event: TripEventPayload = {
      busId,
      driverId,
      routeId,
      event: 'end',
      timestamp: Date.now(),
    };
    console.log('[TripControls] Trip ended:', event);
  }, [busId, driverId, routeId, stopGPSWatch]);

  useEffect(() => {
    return () => {
      stopGPSWatch();
      if (timerRef.current) clearInterval(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [stopGPSWatch]);

  const formatElapsed = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0
      ? `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
      : `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const sendBroadcast = () => {
    if (!broadcastMessage.trim()) return;
    setIsBroadcasting(true);
    console.log('[TripControls] Broadcast:', broadcastMessage);
    setTimeout(() => {
      setIsBroadcasting(false);
      setBroadcastMessage('');
    }, 1000);
  };

  return (
    <div className="space-y-4">
      {/* Status header */}
      <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          tripStatus === 'active' ? 'bg-green-100' : 'bg-gray-100'
        }`}>
          <svg className={`w-5 h-5 ${tripStatus === 'active' ? 'text-green-600' : 'text-gray-400'}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="font-medium text-gray-900">{driverName}</p>
          <p className="text-sm text-gray-500">
            {tripStatus === 'active'
              ? `Trip in progress – ${formatElapsed(elapsedSeconds)}`
              : 'No active trip'}
          </p>
        </div>
        {tripStatus === 'active' && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-green-600">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Live
          </span>
        )}
      </div>

      {/* GPS status */}
      {tripStatus === 'active' && (
        <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-sm font-medium text-nutech-blue mb-1">📍 GPS Location</p>
          {gpsError ? (
            <p className="text-xs text-red-600">{gpsError}</p>
          ) : currentLocation ? (
            <div className="text-xs text-gray-600 space-y-0.5">
              <p>Lat: {currentLocation.lat.toFixed(6)}</p>
              <p>Lng: {currentLocation.lng.toFixed(6)}</p>
              {accuracy && <p>Accuracy: ±{accuracy.toFixed(0)}m</p>}
            </div>
          ) : (
            <p className="text-xs text-gray-500">Acquiring GPS signal…</p>
          )}
        </div>
      )}

      {/* Main action button */}
      {tripStatus === 'idle' ? (
        <Button onClick={startTrip} size="lg" className="w-full">
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Start Trip
        </Button>
      ) : (
        <Button onClick={endTrip} variant="danger" size="lg" className="w-full">
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
          </svg>
          End Trip
        </Button>
      )}

      {/* Broadcast */}
      <div className="p-4 bg-white rounded-xl border border-gray-200">
        <p className="text-sm font-medium text-gray-700 mb-2">📢 Broadcast Message</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={broadcastMessage}
            onChange={(e) => setBroadcastMessage(e.target.value)}
            placeholder="e.g., Stuck in traffic, 10 min delay"
            className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-nutech-blue"
            onKeyDown={(e) => e.key === 'Enter' && sendBroadcast()}
          />
          <Button
            onClick={sendBroadcast}
            loading={isBroadcasting}
            disabled={!broadcastMessage.trim()}
            size="sm"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
