// DealRail Backend API Server
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { config } from './config';
import jobsRouter from './api/jobs.routes';
import { eventListenerService } from './services/event-listener.service';

const app: Express = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', async (_req: Request, res: Response) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      blockchain: {
        chainId: config.blockchain.chainId,
        escrowAddress: config.blockchain.escrowAddress,
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// API routes
app.use('/api/v1/jobs', jobsRouter);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: any) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const HOST = config.server.host;
const PORT = config.server.port;

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected');

    // Start event listener
    await eventListenerService.start('latest');

    // Start HTTP server
    app.listen(PORT, HOST, () => {
      console.log(`✅ DealRail API server running on ${HOST}:${PORT}`);
      console.log(`   Health: http://${HOST}:${PORT}/health`);
      console.log(`   API: http://${HOST}:${PORT}/api/v1`);
      console.log(`   Chain ID: ${config.blockchain.chainId}`);
      console.log(`   Escrow: ${config.blockchain.escrowAddress}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await eventListenerService.stop();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await eventListenerService.stop();
  await prisma.$disconnect();
  process.exit(0);
});

startServer();

export default app;
