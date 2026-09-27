import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { authenticate, requireRole } from '../middleware/auth.js';
import { OrgRoleSchema } from '@hola-ai/shared';

export async function organizationRoutes(server: FastifyInstance) {
  const db = (server as any).db;

  server.get('/api/v1/organizations', { preHandler: authenticate }, async (req, reply) => {
    const user = (req as any).user;
    const allMembers = Array.from((db as any).members.values()).filter((m: any) => m.userId === user.id);
    const orgs = allMembers.map((m: any) => {
      const org = db.getOrganizationById(m.orgId);
      return {
        ...org,
        myRole: m.role,
      };
    }).filter(Boolean);

    return reply.send({ organizations: orgs });
  });

  server.post('/api/v1/organizations', { preHandler: authenticate }, async (req, reply) => {
    const user = (req as any).user;
    const bodySchema = z.object({
      name: z.string().min(1),
    });

    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Validation Error', details: parsed.error.issues });
    }

    const now = new Date().toISOString();
    const newOrg = db.createOrganization({
      id: randomUUID(),
      name: parsed.data.name,
      slug: parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'org',
      ownerId: user.id,
      planTier: 'free',
      createdAt: now,
      updatedAt: now,
    });

    db.addMember({
      id: randomUUID(),
      orgId: newOrg.id,
      userId: user.id,
      role: 'owner',
      createdAt: now,
    });

    return reply.send({ organization: newOrg });
  });

  server.get('/api/v1/organizations/:orgId', { preHandler: requireRole(['viewer']) }, async (req, reply) => {
    const { orgId } = req.params as any;
    const org = db.getOrganizationById(orgId);
    if (!org) return reply.status(404).send({ error: 'Organization not found' });
    const members = db.listMembersByOrg(orgId);
    const sub = db.getSubscriptionByOrg(orgId);
    return reply.send({ organization: org, members, subscription: sub });
  });

  server.post('/api/v1/organizations/:orgId/members', { preHandler: requireRole(['admin', 'owner']) }, async (req, reply) => {
    const { orgId } = req.params as any;
    const bodySchema = z.object({
      email: z.string().email(),
      role: OrgRoleSchema,
    });

    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Validation Error', details: parsed.error.issues });
    }

    let targetUser = db.getUserByEmail(parsed.data.email);
    const now = new Date().toISOString();

    if (!targetUser) {
      targetUser = db.createUser({
        id: randomUUID(),
        email: parsed.data.email,
        displayName: parsed.data.email.split('@')[0],
        isPlatformAdmin: false,
        timezone: 'UTC',
        language: 'en',
        createdAt: now,
        updatedAt: now,
      });
    }

    const existingMember = db.getMember(orgId, targetUser.id);
    if (existingMember) {
      return reply.status(409).send({ error: 'User is already a member of this organization' });
    }

    const newMember = db.addMember({
      id: randomUUID(),
      orgId,
      userId: targetUser.id,
      role: parsed.data.role,
      createdAt: now,
    });

    return reply.send({ member: { ...newMember, userEmail: targetUser.email, userName: targetUser.displayName } });
  });
}
