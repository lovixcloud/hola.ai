import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { authenticate } from '../middleware/auth.js';

export async function authRoutes(server: FastifyInstance) {
  const db = (server as any).db;

  server.post('/api/v1/auth/register', async (req, reply) => {
    const bodySchema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
      displayName: z.string().min(1),
      orgName: z.string().optional(),
    });

    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Validation Error', details: parsed.error.issues });
    }

    const existing = db.getUserByEmail(parsed.data.email);
    if (existing) {
      return reply.status(409).send({ error: 'User with this email already exists' });
    }

    const now = new Date().toISOString();
    const newUser = db.createUser({
      id: randomUUID(),
      email: parsed.data.email,
      displayName: parsed.data.displayName,
      isPlatformAdmin: false,
      timezone: 'UTC',
      language: 'en',
      createdAt: now,
      updatedAt: now,
    });

    const orgName = parsed.data.orgName || `${newUser.displayName}'s Org`;
    const newOrg = db.createOrganization({
      id: randomUUID(),
      name: orgName,
      slug: orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'my-org',
      ownerId: newUser.id,
      planTier: 'free',
      createdAt: now,
      updatedAt: now,
    });

    db.addMember({
      id: randomUUID(),
      orgId: newOrg.id,
      userId: newUser.id,
      role: 'owner',
      createdAt: now,
    });

    const token = server.jwt.sign({
      id: newUser.id,
      email: newUser.email,
      displayName: newUser.displayName,
      isPlatformAdmin: newUser.isPlatformAdmin,
    });

    return reply.send({
      user: newUser,
      organization: newOrg,
      token,
    });
  });

  server.post('/api/v1/auth/login', async (req, reply) => {
    const bodySchema = z.object({
      email: z.string().email(),
      password: z.string(),
    });

    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Validation Error', details: parsed.error.issues });
    }

    const user = db.getUserByEmail(parsed.data.email);
    if (!user) {
      return reply.status(401).send({ error: 'Invalid email or password' });
    }

    const token = server.jwt.sign({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      isPlatformAdmin: user.isPlatformAdmin,
    });

    return reply.send({
      user,
      token,
    });
  });

  server.get('/api/v1/auth/me', { preHandler: authenticate }, async (req, reply) => {
    const authUser = (req as any).user;
    const user = db.getUserById(authUser.id);
    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }
    return reply.send({ user });
  });
}
