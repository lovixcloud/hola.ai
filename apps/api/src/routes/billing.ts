import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { requireRole } from '../middleware/auth.js';
import { PlanEntitlements } from '@hola-ai/shared';

export const PLAN_TIERS_CONFIG: Record<string, { name: string; priceMonthly: number; entitlements: PlanEntitlements }> = {
  free: {
    name: 'Free',
    priceMonthly: 0,
    entitlements: {
      maxChatbots: 2,
      maxMonthlyConversations: 100,
      maxKnowledgeStorageMb: 10,
      allowGlobalAiModels: false,
      allowCustomBranding: false,
      allowApiAndWebhooks: false,
      maxTeamMembers: 1,
    },
  },
  starter: {
    name: 'Starter',
    priceMonthly: 19,
    entitlements: {
      maxChatbots: 5,
      maxMonthlyConversations: 1000,
      maxKnowledgeStorageMb: 50,
      allowGlobalAiModels: true,
      allowCustomBranding: false,
      allowApiAndWebhooks: true,
      maxTeamMembers: 3,
    },
  },
  professional: {
    name: 'Professional',
    priceMonthly: 49,
    entitlements: {
      maxChatbots: 15,
      maxMonthlyConversations: 5000,
      maxKnowledgeStorageMb: 250,
      allowGlobalAiModels: true,
      allowCustomBranding: true,
      allowApiAndWebhooks: true,
      maxTeamMembers: 10,
    },
  },
  business: {
    name: 'Business',
    priceMonthly: 149,
    entitlements: {
      maxChatbots: 50,
      maxMonthlyConversations: 25000,
      maxKnowledgeStorageMb: 1000,
      allowGlobalAiModels: true,
      allowCustomBranding: true,
      allowApiAndWebhooks: true,
      maxTeamMembers: 25,
    },
  },
};

export async function billingRoutes(server: FastifyInstance) {
  const db = (server as any).db;

  server.get('/api/v1/billing/plans', async (req, reply) => {
    return reply.send({ plans: PLAN_TIERS_CONFIG });
  });

  server.get('/api/v1/organizations/:orgId/billing', { preHandler: requireRole(['viewer']) }, async (req, reply) => {
    const { orgId } = req.params as any;
    const sub = db.getSubscriptionByOrg(orgId);
    const planTier = sub?.planTier || 'free';
    const planConfig = PLAN_TIERS_CONFIG[planTier] || PLAN_TIERS_CONFIG.free;

    const chatbots = db.listChatbotsByOrg(orgId);
    const conversations = db.listConversationsByOrg(orgId);
    const sources = db.listKnowledgeSourcesByOrg(orgId);
    const members = db.listMembersByOrg(orgId);
    const transactions = db.listTransactionsByOrg(orgId);

    const usage = {
      chatbotsCount: chatbots.length,
      chatbotsLimit: planConfig.entitlements.maxChatbots,
      conversationsThisMonth: conversations.length,
      conversationsLimit: planConfig.entitlements.maxMonthlyConversations,
      teamMembersCount: members.length,
      teamMembersLimit: planConfig.entitlements.maxTeamMembers,
      knowledgeSourcesCount: sources.length,
    };

    return reply.send({
      subscription: sub || {
        orgId,
        planTier: 'free',
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
      },
      planConfig,
      usage,
      recentTransactions: transactions,
    });
  });

  server.post('/api/v1/organizations/:orgId/billing/paypal/create-order', { preHandler: requireRole(['owner', 'admin']) }, async (req, reply) => {
    const { orgId } = req.params as any;
    const bodySchema = z.object({
      planTier: z.enum(['starter', 'professional', 'business']),
    });

    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Validation Error', details: parsed.error.issues });
    }

    const plan = PLAN_TIERS_CONFIG[parsed.data.planTier];
    const paypalOrderId = `PAYPAL_ORDER_${randomUUID().slice(0, 12).toUpperCase()}`;

    return reply.send({
      orderId: paypalOrderId,
      planTier: parsed.data.planTier,
      amount: plan.priceMonthly,
      currency: 'USD',
      approvalUrl: `https://www.sandbox.paypal.com/checkoutnow?token=${paypalOrderId}`,
    });
  });

  server.post('/api/v1/organizations/:orgId/billing/paypal/capture-order', { preHandler: requireRole(['owner', 'admin']) }, async (req, reply) => {
    const { orgId } = req.params as any;
    const bodySchema = z.object({
      orderId: z.string().min(1),
      planTier: z.enum(['starter', 'professional', 'business']),
    });

    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Validation Error', details: parsed.error.issues });
    }

    const now = new Date().toISOString();
    const periodEnd = new Date(Date.now() + 30 * 86400000).toISOString();
    const plan = PLAN_TIERS_CONFIG[parsed.data.planTier];

    const updatedSub = db.saveSubscription({
      id: randomUUID(),
      orgId,
      planTier: parsed.data.planTier,
      status: 'active',
      paypalSubscriptionId: parsed.data.orderId,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      createdAt: now,
    });

    const tx = db.addPaymentTransaction({
      id: randomUUID(),
      orgId,
      provider: 'paypal',
      transactionId: `TX_${parsed.data.orderId}`,
      amount: plan.priceMonthly,
      currency: 'USD',
      status: 'completed',
      description: `Hola.ai ${plan.name} Monthly Plan Subscription`,
      createdAt: now,
    });

    return reply.send({
      subscription: updatedSub,
      transaction: tx,
    });
  });

  server.post('/api/v1/billing/paypal/webhook', async (req, reply) => {
    const event = req.body as any;
    const eventType = event?.event_type || 'PAYMENT.SALE.COMPLETED';
    const resource = event?.resource || {};

    db.addAuditLog({
      id: randomUUID(),
      action: 'PAYPAL_WEBHOOK_RECEIVED',
      resourceType: 'PAYMENT',
      details: { eventType, resourceId: resource.id },
      createdAt: new Date().toISOString(),
    });

    return reply.send({ received: true, eventType });
  });
}
