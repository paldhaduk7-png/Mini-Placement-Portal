import { config } from './config/env';
import app from './app';
import prisma from './lib/prisma';
import { ApplicationService } from './services/application.service';
import http from 'http';
import dns from 'dns/promises';

const PORT = config.port || 5000;
let server: http.Server;

async function resolveIpv4DatabaseUrl() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return;

  try {
    const parsed = new URL(dbUrl);
    // If hostname is a domain name (not already an IPv4 address), resolve to IPv4 to prevent IPv6/NAT64 timeouts
    if (parsed.hostname && !/^(\d{1,3}\.){3}\d{1,3}$/.test(parsed.hostname) && parsed.hostname !== 'localhost') {
      const lookup = await dns.lookup(parsed.hostname, { family: 4 });
      if (lookup?.address) {
        parsed.hostname = lookup.address;
        process.env.DATABASE_URL = parsed.toString();
        console.log(`[DB] Resolved IPv4 host: ${lookup.address}`);
      }
    }
  } catch (err: any) {
    console.warn('[DB] IPv4 DNS resolution warning:', err?.message || err);
  }
}

async function startServer() {
  try {
    await resolveIpv4DatabaseUrl();

    // Verify database connection before starting server
    await prisma.$queryRaw`SELECT 1`;
    console.log('Database connected successfully');

    // Ensure all student placement states are synchronized per student
    await ApplicationService.syncAllStudentPlacements();
    console.log('Student placements synchronized successfully');

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
