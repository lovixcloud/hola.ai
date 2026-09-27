import { FastifyRequest, FastifyReply } from 'fastify';
import { OrgRole } from '@hola-ai/shared';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  isPlatformAdmin: boolean;
}

export async function authenticate(req: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      reply.status(401).send({ error: 'Unauthorized: Missing Authorization header' });
      return;
    }
    const token = authHeader.replace(/^Bearer\s+/i, '');
    const decoded = req.server.jwt.verify<AuthUser>(token);
    (req as any).user = decoded;
  } catch (err) {
    reply.status(401).send({ error: 'Unauthorized: Invalid or expired token' });
  }
}

const ROLE_RANK: Record<OrgRole, number> = {
  owner: 70,
  admin: 60,
  developer: 50,
  editor: 40,
  support_agent: 30,
  analyst: 20,
  viewer: 10,
};

export function requireRole(allowedRoles: OrgRole[]) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    await authenticate(req, reply);
    if (reply.sent) return;

    const user: AuthUser = (req as any).user;
    if (user.isPlatformAdmin) return;

    const orgId = (req.params as any).orgId || (req.headers['x-organization-id'] as string);
    if (!orgId) {
      reply.status(400).send({ error: 'Missing organization context parameter or X-Organization-ID header' });
      return;
    }

    const db = (req.server as any).db;
    const member = db.getMember(orgId, user.id);
    if (!member) {
      reply.status(403).send({ error: 'Forbidden: You are not a member of this organization' });
      return;
    }

    const minRequiredRank = Math.min(...allowedRoles.map(r => ROLE_RANK[r as OrgRole] || 0));
    const userRank = ROLE_RANK[member.role as OrgRole] || 0;

    if (userRank < minRequiredRank) {
      reply.status(403).send({ error: `Forbidden: Required role level (${allowedRoles.join('/')}), your role is ${member.role}` });
      return;
    }

    (req as any).member = member;
  };
}
