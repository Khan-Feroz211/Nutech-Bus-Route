import { Router, Request, Response } from 'express';

const router = Router();

const buses = [
  { id: 'bus-001', plateNumber: 'ISB-001', routeId: 'route-a', status: 'active', capacity: 45 },
  { id: 'bus-002', plateNumber: 'ISB-002', routeId: 'route-b', status: 'active', capacity: 40 },
  { id: 'bus-003', plateNumber: 'ISB-003', routeId: 'route-c', status: 'idle', capacity: 45 },
  { id: 'bus-004', plateNumber: 'ISB-004', routeId: 'route-d', status: 'active', capacity: 40 },
];

router.get('/', (_req: Request, res: Response) => {
  res.json({ success: true, data: buses });
});

router.get('/:id', (req: Request, res: Response) => {
  const bus = buses.find((b) => b.id === req.params.id);
  if (!bus) return res.status(404).json({ success: false, error: 'Bus not found' });
  return res.json({ success: true, data: bus });
});

export default router;
