import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { requireRole } from '../middleware/auth.js';
import { MarketplaceCategorySchema } from '@hola-ai/shared';

export async function marketplaceRoutes(server: FastifyInstance) {
  const db = (server as any).db;

  server.get('/api/v1/marketplace/templates', async (req, reply) => {
    const { category, query } = req.query as any;
    const templates = db.listMarketplaceTemplates(category, query);
    return reply.send({ templates });
  });

  server.get('/api/v1/marketplace/templates/:templateId', async (req, reply) => {
    const { templateId } = req.params as any;
    const template = db.listMarketplaceTemplates().find((t: any) => t.id === templateId);
    if (!template) {
      return reply.status(404).send({ error: 'Marketplace template not found' });
    }
    return reply.send({ template });
  });

  server.post('/api/v1/organizations/:orgId/marketplace/install', { preHandler: requireRole(['editor', 'admin', 'owner']) }, async (req, reply) => {
    const { orgId } = req.params as any;
    const bodySchema = z.object({
      templateId: z.string().uuid(),
      chatbotName: z.string().optional(),
    });

    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Validation Error', details: parsed.error.issues });
    }

    const tpl = db.listMarketplaceTemplates().find((t: any) => t.id === parsed.data.templateId);
    if (!tpl) {
      return reply.status(404).send({ error: 'Template not found' });
    }

    const now = new Date().toISOString();
    const botId = randomUUID();
    const botName = parsed.data.chatbotName || `${tpl.name} (Installed)`;
    const publicEmbedId = `embed_${botName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${randomUUID().slice(0, 8)}`;

    const newBot = db.saveChatbot({
      id: botId,
      orgId,
      name: botName,
      description: tpl.description,
      purpose: tpl.chatbotConfig.purpose || 'customer_support',
      status: 'draft',
      version: 1,
      responseMode: tpl.chatbotConfig.responseMode || 'business_data_first',
      widgetConfig: { ...tpl.chatbotConfig.widgetConfig, displayName: botName },
      behaviorConfig: tpl.chatbotConfig.behaviorConfig,
      modelConfig: tpl.chatbotConfig.modelConfig,
      allowedDomains: ['*'],
      publicEmbedId,
      createdAt: now,
      updatedAt: now,
    });

    if (tpl.sampleKnowledge && tpl.sampleKnowledge.length > 0) {
      const sourceId = randomUUID();
      db.saveKnowledgeSource({
        id: sourceId,
        orgId,
        chatbotIds: [newBot.id],
        name: `${tpl.name} Sample Knowledge`,
        type: 'faq',
        status: 'ready',
        recordCount: tpl.sampleKnowledge.length,
        createdAt: now,
        updatedAt: now,
      });

      db.saveKnowledgeRecords(tpl.sampleKnowledge.map((k: any) => ({
        id: randomUUID(),
        orgId,
        sourceId,
        title: k.title,
        content: k.content,
        category: k.category,
        metadata: {},
        createdAt: now,
      })));
    }

    tpl.installCount += 1;
    db.saveMarketplaceTemplate(tpl);

    return reply.send({
      installedChatbot: newBot,
      message: 'Template installed successfully into your workspace!',
    });
  });

  server.post('/api/v1/organizations/:orgId/marketplace/publish', { preHandler: requireRole(['admin', 'owner']) }, async (req, reply) => {
    const { orgId } = req.params as any;
    const bodySchema = z.object({
      chatbotId: z.string().uuid(),
      templateName: z.string().min(1),
      description: z.string().min(10),
      category: MarketplaceCategorySchema,
      price: z.number().min(0).default(0),
    });

    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Validation Error', details: parsed.error.issues });
    }

    const bot = db.getChatbotById(parsed.data.chatbotId);
    if (!bot || bot.orgId !== orgId) {
      return reply.status(404).send({ error: 'Chatbot not found' });
    }

    const org = db.getOrganizationById(orgId);
    const now = new Date().toISOString();

    const newTpl = db.saveMarketplaceTemplate({
      id: randomUUID(),
      publisherOrgId: orgId,
      publisherName: org?.name || 'Verified Publisher',
      name: parsed.data.templateName,
      description: parsed.data.description,
      category: parsed.data.category,
      tags: [parsed.data.category, 'custom-bot'],
      avatarUrl: bot.widgetConfig.avatarUrl,
      chatbotConfig: {
        name: bot.name,
        description: bot.description,
        purpose: bot.purpose,
        status: 'draft',
        version: 1,
        responseMode: bot.responseMode,
        widgetConfig: bot.widgetConfig,
        behaviorConfig: bot.behaviorConfig,
        modelConfig: bot.modelConfig,
        allowedDomains: ['*'],
      },
      sampleKnowledge: [
        { title: 'Getting Started FAQ', content: 'Sample business information for template installation.', category: 'FAQ' }
      ],
      price: parsed.data.price,
      isPublic: true,
      installCount: 0,
      rating: 5.0,
      reviewCount: 0,
      createdAt: now,
    });

    return reply.send({ template: newTpl });
  });
}
