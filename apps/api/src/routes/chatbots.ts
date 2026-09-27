import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { requireRole } from '../middleware/auth.js';
import { RAGOrchestrator } from '../services/ragEngine.js';
import {
  ChatbotWidgetConfigSchema,
  ChatbotBehaviorConfigSchema,
  ChatbotModelConfigSchema,
  ResponseModeSchema,
  Chatbot
} from '@hola-ai/shared';

export async function chatbotRoutes(server: FastifyInstance) {
  const db = (server as any).db;
  const rag = new RAGOrchestrator(db);

  server.get('/api/v1/organizations/:orgId/chatbots', { preHandler: requireRole(['viewer']) }, async (req, reply) => {
    const { orgId } = req.params as any;
    const chatbots = db.listChatbotsByOrg(orgId);
    return reply.send({ chatbots });
  });

  server.get('/api/v1/organizations/:orgId/chatbots/:chatbotId', { preHandler: requireRole(['viewer']) }, async (req, reply) => {
    const { orgId, chatbotId } = req.params as any;
    const bot = db.getChatbotById(chatbotId);
    if (!bot || bot.orgId !== orgId) {
      return reply.status(404).send({ error: 'Chatbot not found' });
    }
    return reply.send({ chatbot: bot });
  });

  server.post('/api/v1/organizations/:orgId/chatbots', { preHandler: requireRole(['editor', 'admin', 'owner']) }, async (req, reply) => {
    const { orgId } = req.params as any;
    const bodySchema = z.object({
      name: z.string().min(1),
      description: z.string().default(''),
      purpose: z.enum(['customer_support', 'sales', 'faq', 'education', 'booking', 'internal']).default('customer_support'),
      responseMode: ResponseModeSchema.default('business_data_first'),
    });

    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Validation Error', details: parsed.error.issues });
    }

    const now = new Date().toISOString();
    const botId = randomUUID();
    const publicEmbedId = `embed_${parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${randomUUID().slice(0, 8)}`;

    const newBot = db.saveChatbot({
      id: botId,
      orgId,
      name: parsed.data.name,
      description: parsed.data.description,
      purpose: parsed.data.purpose,
      status: 'draft',
      version: 1,
      responseMode: parsed.data.responseMode,
      widgetConfig: {
        displayName: parsed.data.name,
        primaryColor: '#2563eb',
        accentColor: '#1d4ed8',
        backgroundColor: '#ffffff',
        textColor: '#0f172a',
        fontFamily: 'Inter, sans-serif',
        fontSize: 14,
        borderRadius: 12,
        position: 'bottom_right',
        headerTitle: parsed.data.name,
        welcomeMessage: 'Hello! How can I assist you with our business today?',
        conversationStarters: ['What services do you offer?', 'What are your store hours?', 'Contact support'],
        suggestedReplies: [],
        inputPlaceholder: 'Ask a question...',
        showBranding: true,
        themeMode: 'light',
      },
      behaviorConfig: {
        systemInstructions: 'You are a helpful business customer assistant. Answer questions strictly using business knowledge sources.',
        persona: 'Customer Representative',
        language: 'English',
        responseStyle: 'friendly',
        maxAnswerLength: 400,
        fallbackMessage: 'I do not have that information in our business knowledge base currently. Would you like to speak to a human representative?',
        allowedTopics: [],
        prohibitedTopics: [],
        confidenceThreshold: 0.35,
        showSourceCitations: true,
        humanHandoffEnabled: true,
        humanHandoffTriggerKeywords: ['human', 'agent', 'support'],
      },
      modelConfig: {
        provider: 'mock',
        modelName: 'default-fast',
        temperature: 0.2,
        maxTokens: 500,
        allowGeneralKnowledgeFallback: false,
      },
      allowedDomains: ['*'],
      publicEmbedId,
      createdAt: now,
      updatedAt: now,
    });

    return reply.send({ chatbot: newBot });
  });

  server.put('/api/v1/organizations/:orgId/chatbots/:chatbotId', { preHandler: requireRole(['editor', 'admin', 'owner']) }, async (req, reply) => {
    const { orgId, chatbotId } = req.params as any;
    const bot = db.getChatbotById(chatbotId);
    if (!bot || bot.orgId !== orgId) {
      return reply.status(404).send({ error: 'Chatbot not found' });
    }

    const bodySchema = z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      purpose: z.enum(['customer_support', 'sales', 'faq', 'education', 'booking', 'internal']).optional(),
      responseMode: ResponseModeSchema.optional(),
      widgetConfig: ChatbotWidgetConfigSchema.partial().optional(),
      behaviorConfig: ChatbotBehaviorConfigSchema.partial().optional(),
      modelConfig: ChatbotModelConfigSchema.partial().optional(),
      allowedDomains: z.array(z.string()).optional(),
    });

    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Validation Error', details: parsed.error.issues });
    }

    const updated: Chatbot = {
      ...bot,
      name: parsed.data.name !== undefined ? parsed.data.name : bot.name,
      description: parsed.data.description !== undefined ? parsed.data.description : bot.description,
      purpose: parsed.data.purpose !== undefined ? parsed.data.purpose : bot.purpose,
      responseMode: parsed.data.responseMode !== undefined ? parsed.data.responseMode : bot.responseMode,
      widgetConfig: parsed.data.widgetConfig ? { ...bot.widgetConfig, ...parsed.data.widgetConfig } : bot.widgetConfig,
      behaviorConfig: parsed.data.behaviorConfig ? { ...bot.behaviorConfig, ...parsed.data.behaviorConfig } : bot.behaviorConfig,
      modelConfig: parsed.data.modelConfig ? { ...bot.modelConfig, ...parsed.data.modelConfig } : bot.modelConfig,
      allowedDomains: parsed.data.allowedDomains !== undefined ? parsed.data.allowedDomains : bot.allowedDomains,
      version: bot.version + 1,
      updatedAt: new Date().toISOString(),
    };

    db.saveChatbot(updated);
    return reply.send({ chatbot: updated });
  });

  server.post('/api/v1/organizations/:orgId/chatbots/:chatbotId/publish', { preHandler: requireRole(['editor', 'admin', 'owner']) }, async (req, reply) => {
    const { orgId, chatbotId } = req.params as any;
    const bot = db.getChatbotById(chatbotId);
    if (!bot || bot.orgId !== orgId) {
      return reply.status(404).send({ error: 'Chatbot not found' });
    }

    const updated: Chatbot = {
      ...bot,
      status: 'published',
      publishedVersion: bot.version,
      updatedAt: new Date().toISOString(),
    };

    db.saveChatbot(updated);
    return reply.send({ chatbot: updated });
  });

  // Public Embed Runtime
  server.get('/api/v1/public/chatbots/:embedId/config', async (req, reply) => {
    const { embedId } = req.params as any;
    const bot = db.getChatbotByEmbedId(embedId);
    if (!bot || bot.status !== 'published') {
      return reply.status(404).send({ error: 'Chatbot embed not found or not published' });
    }

    return reply.send({
      name: bot.name,
      widgetConfig: bot.widgetConfig,
      responseMode: bot.responseMode,
      embedId: bot.publicEmbedId,
    });
  });

  server.post('/api/v1/public/chatbots/:embedId/chat', async (req, reply) => {
    const { embedId } = req.params as any;
    const bot = db.getChatbotByEmbedId(embedId);
    if (!bot || bot.status !== 'published') {
      return reply.status(404).send({ error: 'Chatbot embed not found or not published' });
    }

    const bodySchema = z.object({
      visitorId: z.string().min(1),
      message: z.string().min(1),
      conversationId: z.string().optional(),
      visitorName: z.string().optional(),
      visitorEmail: z.string().email().optional(),
    });

    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Validation Error', details: parsed.error.issues });
    }

    const now = new Date().toISOString();

    let conv = parsed.data.conversationId ? db.getConversationById(parsed.data.conversationId) : null;
    if (!conv) {
      conv = db.createConversation({
        id: randomUUID(),
        orgId: bot.orgId,
        chatbotId: bot.id,
        visitorId: parsed.data.visitorId,
        status: 'open',
        visitorName: parsed.data.visitorName,
        visitorEmail: parsed.data.visitorEmail,
        createdAt: now,
        updatedAt: now,
      });
    }

    db.addMessage({
      id: randomUUID(),
      conversationId: conv.id,
      sender: 'visitor',
      senderName: parsed.data.visitorName || 'Visitor',
      content: parsed.data.message,
      citations: [],
      createdAt: now,
    });

    if (conv.status === 'agent_active') {
      return reply.send({
        conversationId: conv.id,
        answer: 'You are currently connected with a live support representative. They will respond shortly.',
        citations: [],
        isFallback: false,
        handOffActive: true,
      });
    }

    const ragResult = await rag.generateAnswer(bot, parsed.data.message);

    const botMsg = db.addMessage({
      id: randomUUID(),
      conversationId: conv.id,
      sender: 'bot',
      senderName: bot.widgetConfig.displayName,
      content: ragResult.answer,
      citations: ragResult.citations,
      isFallback: ragResult.isFallback,
      responseModeUsed: ragResult.responseModeUsed,
      modelUsed: ragResult.modelUsed,
      createdAt: new Date().toISOString(),
    });

    return reply.send({
      conversationId: conv.id,
      messageId: botMsg.id,
      answer: ragResult.answer,
      citations: ragResult.citations,
      isFallback: ragResult.isFallback,
      responseModeUsed: ragResult.responseModeUsed,
      modelUsed: ragResult.modelUsed,
    });
  });
}
