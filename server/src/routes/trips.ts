import { Router, Request, Response } from 'express';

const router = Router();

interface Trip {
  id: string;
  busId: string;
  driverId: string;
  routeId: string;
  startTime: string;
  endTime?: string;
  status: 'active' | 'completed';
}

const trips: Trip[] = [];

router.get('/', (_req: Request, res: Response) => {
  res.json({ success: true, data: trips });
});

router.post('/', (req: Request, res: Response) => {
  const { busId, driverId, routeId, event } = req.body as {
    busId: string; driverId: string; routeId: string; event: 'start' | 'end';
  };

  if (event === 'start') {
    const trip: Trip = {
      id: `trip-${Date.now()}`,
      busId,
      driverId,
      routeId,
      startTime: new Date().toISOString(),
      status: 'active',
    };
    trips.push(trip);
    return res.status(201).json({ success: true, data: trip });
  }

  if (event === 'end') {
    const trip = trips.find((t) => t.busId === busId && t.status === 'active');
    if (trip) {
      trip.status = 'completed';
      trip.endTime = new Date().toISOString();
    }
    return res.json({ success: true, data: trip });
  }

  return res.status(400).json({ success: false, error: 'Invalid event' });
});

export default router;
