import { Router, Request, Response } from 'express';

const router = Router();

const notifications: Array<{
  id: string;
  title: string;
  message: string;
  type: string;
  createdAt: string;
  routeId?: string;
}> = [];

router.get('/', (_req: Request, res: Response) => {
  res.json({ success: true, data: notifications });
});

router.post('/', (req: Request, res: Response) => {
  const { title, message, type, routeId } = req.body as {
    title: string; message: string; type: string; routeId?: string;
  };

  const notif = {
    id: `notif-${Date.now()}`,
    title,
    message,
    type,
    routeId,
    createdAt: new Date().toISOString(),
  };
  notifications.unshift(notif);

  res.status(201).json({ success: true, data: notif });
});

export default router;
