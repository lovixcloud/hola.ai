import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import multipart from '@fastify/multipart';
import { DatabaseRepository } from '@hola-ai/database';
import { runSeed } from '@hola-ai/database/dist/seed/seed.js';
import { authRoutes } from './routes/auth.js';
import { organizationRoutes } from './routes/organizations.js';
import { knowledgeRoutes } from './routes/knowledge.js';
import { chatbotRoutes } from './routes/chatbots.js';
import { billingRoutes } from './routes/billing.js';
import { marketplaceRoutes } from './routes/marketplace.js';
import { developerRoutes } from './routes/developer.js';
import { analyticsRoutes } from './routes/analytics.js';
import { adminRoutes } from './routes/admin.js';

export function buildServer(dbPath: string = ':memory:', runSeedData: boolean = true) {
  const server = Fastify({ logger: false });

  const db = new DatabaseRepository(dbPath);
  if (runSeedData) {
    runSeed(db);
  }
  (server as any).db = db;

  server.register(cors, {
    origin: '*',
    credentials: true,
  });

  server.register(jwt, {
    secret: process.env.JWT_SECRET || 'hola-ai-jwt-secret-key-for-development-and-tests-32-chars',
  });

  server.register(multipart, {
    limits: {
      fileSize: (parseInt(process.env.MAX_UPLOAD_SIZE_MB || '25', 10)) * 1024 * 1024,
    },
  });

  server.register(swagger, {
    openapi: {
      info: {
        title: 'hola.ai API',
        description: 'REST API for Custom AI Chatbot Builder, Marketplace & Business Intelligence Platform',
        version: '1.0.0',
      },
    },
  });

  server.register(swaggerUi, {
    routePrefix: '/docs',
  });

  server.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  server.register(authRoutes);
  server.register(organizationRoutes);
  server.register(knowledgeRoutes);
  server.register(chatbotRoutes);
  server.register(billingRoutes);
  server.register(marketplaceRoutes);
  server.register(developerRoutes);
  server.register(analyticsRoutes);
  server.register(adminRoutes);

  return server;
}

if (process.env.NODE_ENV !== 'test') {
  const port = parseInt(process.env.PORT || '3000', 10);
  const server = buildServer(process.env.DATABASE_URL || ':memory:', true);
  server.listen({ port, host: '0.0.0.0' }, (err, address) => {
    if (err) {
      console.error('Server startup error:', err);
      process.exit(1);
    }
    console.log(`🚀 hola.ai API running at ${address}`);
    console.log(`📚 OpenAPI Docs available at ${address}/docs`);
  });
}
