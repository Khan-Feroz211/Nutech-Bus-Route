'use client';

import { useEffect, useRef, useState } from 'react';
import type { Bus, BusRoute } from '@/types';

interface FleetMapProps {
  buses: Bus[];
  routes: BusRoute[];
  height?: string;
}

declare global {
  interface Window {
    initFleetMap?: () => void;
  }
}

export default function FleetMap({ buses, routes, height = '500px' }: FleetMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
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

    if (document.querySelector('script[data-maps-loaded]')) {
      const check = setInterval(() => {
        if (window.google?.maps) {
          setMapsLoaded(true);
          clearInterval(check);
        }
      }, 200);
      return () => clearInterval(check);
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initFleetMap`;
    script.async = true;
    script.defer = true;
    script.dataset.mapsLoaded = 'true';

    window.initFleetMap = () => setMapsLoaded(true);
    script.onerror = () => setApiError(true);
    document.head.appendChild(script);

    return () => { delete window.initFleetMap; };
  }, [apiKey]);

  useEffect(() => {
    if (!mapsLoaded || !mapRef.current || mapInstanceRef.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 33.6502, lng: 73.1201 },
      zoom: 12,
      streetViewControl: false,
    });
    mapInstanceRef.current = map;

    // Draw all route polylines
    routes.forEach((route) => {
      new window.google.maps.Polyline({
        path: route.waypoints,
        geodesic: true,
        strokeColor: route.color,
        strokeOpacity: 0.6,
        strokeWeight: 3,
        map,
      });
    });

    // NUTECH campus
    new window.google.maps.Marker({
      position: { lat: 33.6502, lng: 73.1201 },
      map,
      title: 'NUTECH Campus',
      icon: { url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png' },
    });
  }, [mapsLoaded, routes]);

  useEffect(() => {
    if (!mapsLoaded || !mapInstanceRef.current) return;

    const colors: Record<string, string> = {
      active: '#22C55E',
      idle: '#EAB308',
      offline: '#6B7280',
      maintenance: '#EF4444',
    };

    buses.forEach((bus) => {
      if (!bus.currentLocation) return;

      const existing = markersRef.current.get(bus.id);
      if (existing) {
        existing.setPosition(bus.currentLocation);
      } else {
        const marker = new window.google.maps.Marker({
          position: bus.currentLocation,
          map: mapInstanceRef.current!,
          title: `${bus.plateNumber} (${routes.find((r) => r.id === bus.routeId)?.label ?? ''})`,
          icon: {
            path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 5,
            fillColor: colors[bus.status] ?? '#6B7280',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
            rotation: bus.heading ?? 0,
          },
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `<div style="font-size:13px;padding:4px">
            <b>${bus.plateNumber}</b><br/>
            ${routes.find((r) => r.id === bus.routeId)?.label ?? ''}<br/>
            Speed: ${bus.speed?.toFixed(0) ?? 0} km/h<br/>
            Status: ${bus.status}
          </div>`,
        });

        marker.addListener('click', () => infoWindow.open(mapInstanceRef.current, marker));
        markersRef.current.set(bus.id, marker);
      }
    });
  }, [mapsLoaded, buses, routes]);

  if (apiError) {
    return (
      <div
        style={{ height }}
        className="w-full rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex flex-col items-center justify-center p-6"
      >
        <div className="text-center mb-6">
          <p className="text-sm font-semibold text-gray-600 mb-1">Fleet Overview (Map Unavailable)</p>
          <p className="text-xs text-gray-400">Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable maps</p>
        </div>
        <div className="grid grid-cols-2 gap-3 w-full max-w-md">
          {buses.map((bus) => {
            const route = routes.find((r) => r.id === bus.routeId);
            return (
              <div key={bus.id} className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full ${bus.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <span className="font-medium text-sm">{bus.plateNumber}</span>
                </div>
                <p className="text-xs text-gray-500">{route?.label} – {route?.area}</p>
                <p className="text-xs text-gray-400 mt-0.5">{bus.speed?.toFixed(0) ?? 0} km/h</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{ height }} className="w-full rounded-xl overflow-hidden relative">
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
      {!mapsLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-nutech-blue" />
        </div>
      )}
    </div>
  );
}
