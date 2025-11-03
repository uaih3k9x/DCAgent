import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import devicesRouter from './routes/devices';
import cablesRouter from './routes/cables';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'DCAgent Backend'
  });
});

// API Routes
app.get('/api', (req: Request, res: Response) => {
  res.json({
    message: 'DCAgent API v1',
    endpoints: {
      datacenters: '/api/datacenters',
      rooms: '/api/rooms',
      cabinets: '/api/cabinets',
      devices: '/api/devices',
      panels: '/api/panels',
      ports: '/api/ports',
      cables: '/api/cables',
      connections: '/api/connections'
    }
  });
});

// Mount routers
app.use('/api/devices', devicesRouter);
app.use('/api/cables', cablesRouter);

// Error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📡 API endpoints: http://localhost:${PORT}/api`);
});

export default app;
