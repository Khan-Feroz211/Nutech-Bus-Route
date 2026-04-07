import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { setupGPSHandlers } from './socket/gpsHandler';
import busRoutes from './routes/buses';
import tripRoutes from './routes/trips';
import authRoutes from './routes/auth';
import notificationRoutes from './routes/notifications';
import routeRoutes from './routes/routes';

const PORT = process.env.PORT ?? 3001;
const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

const app = express();

app.use(cors({ origin: ALLOWED_ORIGIN, credentials: true }));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// REST routes
app.use('/api/auth', authRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/routes', routeRoutes);

// Socket.io
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ALLOWED_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

setupGPSHandlers(io);

httpServer.listen(PORT, () => {
  console.log(`✅ NUTECH BusTrack server running on http://localhost:${PORT}`);
});

export { io };
