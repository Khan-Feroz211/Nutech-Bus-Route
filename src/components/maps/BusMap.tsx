'use client';

import { useEffect, useRef, useState } from 'react';
import type { LatLng, BusRoute } from '@/types';

interface BusMapProps {
  busLocation: LatLng | null;
  route: BusRoute;
  heading?: number;
  height?: string;
}

declare global {
  interface Window {
    google: typeof google;
    initBusMap?: () => void;
  }
}

export default function BusMap({ busLocation, route, heading = 0, height = '400px' }: BusMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const busMarkerRef = useRef<google.maps.Marker | null>(null);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [apiError, setApiError] = useState(false);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
      setApiError(true);
      return;
    }

    if (window.google?.maps) {
      setMapsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initBusMap`;
    script.async = true;
    script.defer = true;

    window.initBusMap = () => setMapsLoaded(true);

    script.onerror = () => setApiError(true);
    document.head.appendChild(script);

    return () => {
      delete window.initBusMap;
    };
  }, [apiKey]);

  useEffect(() => {
    if (!mapsLoaded || !mapRef.current || mapInstanceRef.current) return;

    const center = busLocation ?? route.waypoints[0] ?? { lat: 33.6502, lng: 73.1201 };

    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 13,
      styles: [
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
      ],
      disableDefaultUI: false,
      zoomControl: true,
      streetViewControl: false,
    });
    mapInstanceRef.current = map;

    // Draw route polyline
    const polyline = new window.google.maps.Polyline({
      path: route.waypoints,
      geodesic: true,
      strokeColor: route.color,
      strokeOpacity: 0.8,
      strokeWeight: 4,
    });
    polyline.setMap(map);
    polylineRef.current = polyline;

    // Draw stop markers
    route.stops.forEach((stop) => {
      new window.google.maps.Marker({
        position: stop.location,
        map,
        title: stop.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: route.color,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });
    });

    // NUTECH campus marker
    new window.google.maps.Marker({
      position: { lat: 33.6502, lng: 73.1201 },
      map,
      title: 'NUTECH Campus',
      icon: {
        url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
      },
    });
  }, [mapsLoaded, route, busLocation]);

  // Update bus marker position
  useEffect(() => {
    if (!mapsLoaded || !mapInstanceRef.current || !busLocation) return;

    if (busMarkerRef.current) {
      busMarkerRef.current.setPosition(busLocation);
    } else {
      busMarkerRef.current = new window.google.maps.Marker({
        position: busLocation,
        map: mapInstanceRef.current,
        title: 'Bus Location',
        icon: {
          path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: '#22C55E',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          rotation: heading,
        },
        zIndex: 100,
      });
    }

    // Pan map to bus
    mapInstanceRef.current.panTo(busLocation);
  }, [mapsLoaded, busLocation, heading]);

  if (apiError) {
    return <MapFallback route={route} busLocation={busLocation} height={height} />;
  }

  return (
    <div style={{ height }} className="w-full rounded-xl overflow-hidden relative">
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
      {!mapsLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-nutech-blue mx-auto mb-2" />
            <p className="text-sm text-gray-500">Loading map…</p>
          </div>
        </div>
      )}
    </div>
  );
}

function MapFallback({
  route,
  busLocation,
  height,
}: {
  route: BusRoute;
  busLocation: LatLng | null;
  height: string;
}) {
  return (
    <div
      style={{ height }}
      className="w-full rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 flex flex-col items-center justify-center p-6"
    >
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-nutech-blue rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>
        <h3 className="font-semibold text-nutech-blue text-lg mb-1">{route.label} – {route.area}</h3>
        <p className="text-sm text-gray-600 mb-3">
          {busLocation
            ? `Bus at ${busLocation.lat.toFixed(4)}, ${busLocation.lng.toFixed(4)}`
            : 'Locating bus…'}
        </p>
        <p className="text-xs text-gray-400">Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable live map</p>
        <a
          href={`https://www.google.com/maps/dir/${busLocation?.lat ?? ''},${busLocation?.lng ?? ''}/${33.6502},${73.1201}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-nutech-blue hover:underline"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Open in Google Maps
        </a>
      </div>

      {/* Stop list */}
      <div className="mt-4 w-full max-w-xs">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Stops</p>
        <div className="space-y-1.5">
          {route.stops.map((stop, i) => (
            <div key={stop.id} className="flex items-center gap-2 text-sm">
              <span
                className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: route.color }}
              >
                {i + 1}
              </span>
              <span className="text-gray-700">{stop.name}</span>
              <span className="ml-auto text-gray-400 text-xs">{stop.morningArrival}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
