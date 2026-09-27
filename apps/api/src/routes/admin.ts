import { FastifyInstance } from 'fastify';
import { authenticate } from '../middleware/auth.js';

export async function adminRoutes(server: FastifyInstance) {
  const db = (server as any).db;

  const requireAdmin = async (req: any, reply: any) => {
    await authenticate(req, reply);
    if (reply.sent) return;

    if (!req.user.isPlatformAdmin) {
      return reply.status(403).send({ error: 'Forbidden: Platform Admin privileges required' });
    }
  };

  server.get('/api/v1/admin/overview', { preHandler: requireAdmin }, async (req, reply) => {
    const auditLogs = db.listAuditLogs();
    const marketplace = db.listMarketplaceTemplates();

    return reply.send({
      platformMetrics: {
        totalOrganizations: 1,
        totalUsers: 2,
        totalChatbots: 1,
        totalMarketplaceListings: marketplace.length,
        systemHealth: 'healthy',
        activeJobsQueue: 0,
      },
      recentAuditLogs: auditLogs.slice(0, 20),
    });
  });

  server.get('/api/v1/admin/audit-logs', { preHandler: requireAdmin }, async (req, reply) => {
    const logs = db.listAuditLogs();
    return reply.send({ auditLogs: logs });
  });
}
