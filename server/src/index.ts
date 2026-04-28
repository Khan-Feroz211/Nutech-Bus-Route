import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import compression from 'compression';
import { setupGPSHandlers } from './socket/gpsHandler';
import { setupWebSocketAuth } from './middleware/socketAuth';
import busRoutes from './routes/buses';
import tripRoutes from './routes/trips';
import authRoutes from './routes/auth';
import notificationRoutes from './routes/notifications';
import routeRoutes from './routes/routes';

const PORT = process.env.PORT ?? 3001;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3000', 'http://localhost:3001'];

const app = express();

app.use(compression());

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Request ID middleware
app.use((req, res, next) => {
  const requestId = req.headers['x-request-id'] || Math.random().toString(36).substring(2, 15);
  res.setHeader('X-Request-ID', requestId);
  next();
});

// Health check with detailed status
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// REST routes
app.use('/api/auth', authRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/routes', routeRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Socket.io
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: corsOptions,
  pingTimeout: 60000,
  pingInterval: 25000,
});

setupWebSocketAuth(io);
setupGPSHandlers(io);

httpServer.listen(PORT, () => {
  console.log(`✅ NUTECH BusTrack server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket enabled`);
  console.log(`🔒 CORS origins: ${ALLOWED_ORIGINS.join(', ')}`);
});

export { io };
