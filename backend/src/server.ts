import { config } from './config/env';
import app from './app';
import prisma from './lib/prisma';
import http from 'http';

const PORT = config.port || 5000;
let server: http.Server;

async function startServer() {
  try {
    // Verify database connection before starting server
    await prisma.$queryRaw`SELECT 1`;
    console.log('Database connected successfully');

    // Start Express HTTP server
    server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error: any) {
    console.error('Database connection failed:', error.message || error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Graceful shutdown handling
async function gracefulShutdown(signal: string) {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  if (server) {
    server.close(async () => {
      await prisma.$disconnect();
      console.log('Database disconnected. Process terminated.');
      process.exit(0);
    });
  } else {
    await prisma.$disconnect();
    process.exit(0);
  }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

startServer();
