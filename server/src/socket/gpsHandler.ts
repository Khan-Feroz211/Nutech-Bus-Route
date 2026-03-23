import { Server, Socket } from 'socket.io';
import type { GPSUpdatePayload, TripEventPayload } from '../types';

// In-memory bus location store
const busLocations = new Map<string, GPSUpdatePayload>();
const simulationIntervals = new Map<string, ReturnType<typeof setInterval>>();

// Predefined waypoints for simulation (Route A as example)
const routeWaypoints: Record<string, Array<{ lat: number; lng: number }>> = {
  'bus-001': [
    { lat: 33.5986, lng: 73.0478 },
    { lat: 33.6020, lng: 73.0510 },
    { lat: 33.6060, lng: 73.0566 },
    { lat: 33.6150, lng: 73.0620 },
    { lat: 33.6232, lng: 73.0682 },
    { lat: 33.6290, lng: 73.0780 },
    { lat: 33.6340, lng: 73.0890 },
    { lat: 33.6410, lng: 73.1010 },
    { lat: 33.6480, lng: 73.1150 },
    { lat: 33.6502, lng: 73.1201 },
  ],
  'bus-002': [
    { lat: 33.6847, lng: 73.0051 },
    { lat: 33.6820, lng: 73.0130 },
    { lat: 33.6800, lng: 73.0200 },
    { lat: 33.6760, lng: 73.0320 },
    { lat: 33.6700, lng: 73.0450 },
    { lat: 33.6640, lng: 73.0630 },
    { lat: 33.6580, lng: 73.0820 },
    { lat: 33.6540, lng: 73.1010 },
    { lat: 33.6502, lng: 73.1201 },
  ],
};

const waypointIndices = new Map<string, number>();

function startSimulation(io: Server, busId: string): void {
  if (simulationIntervals.has(busId)) return;

  waypointIndices.set(busId, 0);

  const interval = setInterval(() => {
    const waypoints = routeWaypoints[busId];
    if (!waypoints) return;

    const currentIndex = waypointIndices.get(busId) ?? 0;
    const nextIndex = (currentIndex + 1) % waypoints.length;
    waypointIndices.set(busId, nextIndex);

    const location = waypoints[nextIndex];
    const prevLocation = waypoints[currentIndex];

    const dLng = location.lng - prevLocation.lng;
    const dLat = location.lat - prevLocation.lat;
    const heading = ((Math.atan2(dLng, dLat) * 180) / Math.PI + 360) % 360;

    const payload: GPSUpdatePayload = {
      busId,
      driverId: `sim-driver-${busId}`,
      location,
      speed: 25 + Math.random() * 15,
      heading,
      timestamp: Date.now(),
    };

    busLocations.set(busId, payload);
    io.to(`bus:${busId}`).emit('gps:update', payload);
    io.emit('fleet:update', payload); // admin room gets all updates
  }, 5000);

  simulationIntervals.set(busId, interval);
}

function stopSimulation(busId: string): void {
  const interval = simulationIntervals.get(busId);
  if (interval) {
    clearInterval(interval);
    simulationIntervals.delete(busId);
  }
}

export function setupGPSHandlers(io: Server): void {
  // Start simulation for all buses immediately
  Object.keys(routeWaypoints).forEach((busId) => startSimulation(io, busId));

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Student joins a bus room to receive location updates
    socket.on('watch:bus', (busId: string) => {
      socket.join(`bus:${busId}`);
      // Send current location immediately
      const current = busLocations.get(busId);
      if (current) socket.emit('gps:update', current);
    });

    socket.on('unwatch:bus', (busId: string) => {
      socket.leave(`bus:${busId}`);
    });

    // Admin watches all buses
    socket.on('watch:fleet', () => {
      socket.join('fleet');
      busLocations.forEach((payload) => socket.emit('fleet:update', payload));
    });

    // Driver sends GPS update
    socket.on('gps:driver:update', (payload: GPSUpdatePayload) => {
      // Stop simulation for this bus since driver is providing real GPS
      stopSimulation(payload.busId);

      busLocations.set(payload.busId, { ...payload, timestamp: Date.now() });
      io.to(`bus:${payload.busId}`).emit('gps:update', payload);
      io.to('fleet').emit('fleet:update', payload);
    });

    // Driver starts/ends trip
    socket.on('trip:event', (payload: TripEventPayload) => {
      if (payload.event === 'end') {
        // Restart simulation when trip ends
        startSimulation(io, payload.busId);
      }
      io.to(`bus:${payload.busId}`).emit('trip:event', payload);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });
}


