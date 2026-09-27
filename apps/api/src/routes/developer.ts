import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { randomUUID, randomBytes, createHash } from 'crypto';
import { requireRole } from '../middleware/auth.js';

export async function developerRoutes(server: FastifyInstance) {
  const db = (server as any).db;

  server.get('/api/v1/organizations/:orgId/developer/keys', { preHandler: requireRole(['developer', 'admin', 'owner']) }, async (req, reply) => {
    const { orgId } = req.params as any;
    const keys = db.listApiKeysByOrg(orgId);
    return reply.send({ apiKeys: keys });
  });

  server.post('/api/v1/organizations/:orgId/developer/keys', { preHandler: requireRole(['developer', 'admin', 'owner']) }, async (req, reply) => {
    const { orgId } = req.params as any;
    const bodySchema = z.object({
      name: z.string().min(1),
      scopes: z.array(z.string()).default(['chat', 'knowledge_read']),
    });

    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Validation Error', details: parsed.error.issues });
    }

    const rawToken = `hola_sk_${randomBytes(24).toString('hex')}`;
    const keyPrefix = rawToken.slice(0, 12);
    const keyHash = createHash('sha256').update(rawToken).digest('hex');
    const now = new Date().toISOString();

    const apiKey = db.saveApiKey({
      id: randomUUID(),
      orgId,
      name: parsed.data.name,
      keyHash,
      keyPrefix,
      scopes: parsed.data.scopes,
      createdAt: now,
    });

    return reply.send({
      apiKey,
      rawSecretKey: rawToken,
    });
  });

  server.get('/api/v1/organizations/:orgId/developer/webhooks', { preHandler: requireRole(['developer', 'admin', 'owner']) }, async (req, reply) => {
    const { orgId } = req.params as any;
    const webhooks = db.listWebhookEndpointsByOrg(orgId);
    return reply.send({ webhookEndpoints: webhooks });
  });

  server.post('/api/v1/organizations/:orgId/developer/webhooks', { preHandler: requireRole(['developer', 'admin', 'owner']) }, async (req, reply) => {
    const { orgId } = req.params as any;
    const bodySchema = z.object({
      targetUrl: z.string().url(),
      events: z.array(z.string()).default(['conversation.created', 'message.created', 'handoff.requested']),
    });

    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Validation Error', details: parsed.error.issues });
    }

    const webhookSecret = `whsec_${randomBytes(20).toString('hex')}`;
    const now = new Date().toISOString();

    const webhook = db.saveWebhookEndpoint({
      id: randomUUID(),
      orgId,
      targetUrl: parsed.data.targetUrl,
      secret: webhookSecret,
      events: parsed.data.events,
      isActive: true,
      createdAt: now,
    });

    return reply.send({ webhookEndpoint: webhook });
  });
}
