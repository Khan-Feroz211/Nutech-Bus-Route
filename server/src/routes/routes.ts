import { Router, Request, Response } from 'express';

const router = Router();

const routes = [
  { id: 'route-a', label: 'Route A', area: 'Rawalpindi', totalStops: 6 },
  { id: 'route-b', label: 'Route B', area: 'G-11', totalStops: 5 },
  { id: 'route-c', label: 'Route C', area: 'Bahria Town', totalStops: 5 },
  { id: 'route-d', label: 'Route D', area: 'F-10', totalStops: 5 },
];

router.get('/', (_req: Request, res: Response) => {
  res.json({ success: true, data: routes });
});

export default router;
