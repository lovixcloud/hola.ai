import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { requireRole } from '../middleware/auth.js';
import { IngestionService } from '../services/ingestionService.js';
import { RAGOrchestrator } from '../services/ragEngine.js';
import { KnowledgeSourceTypeSchema } from '@hola-ai/shared';

export async function knowledgeRoutes(server: FastifyInstance) {
  const db = (server as any).db;
  const rag = new RAGOrchestrator(db);

  server.get('/api/v1/organizations/:orgId/knowledge/sources', { preHandler: requireRole(['viewer']) }, async (req, reply) => {
    const { orgId } = req.params as any;
    const sources = db.listKnowledgeSourcesByOrg(orgId);
    return reply.send({ sources });
  });

  server.post('/api/v1/organizations/:orgId/knowledge/sources', { preHandler: requireRole(['editor', 'admin', 'owner']) }, async (req, reply) => {
    const { orgId } = req.params as any;
    const bodySchema = z.object({
      name: z.string().min(1),
      type: KnowledgeSourceTypeSchema,
      chatbotIds: z.array(z.string().uuid()).default([]),
      rawContent: z.string().min(1),
      jsonFieldMap: z.object({
        titleField: z.string().optional(),
        contentFields: z.array(z.string()).default([]),
        categoryField: z.string().optional(),
        priceField: z.string().optional(),
      }).optional(),
    });

    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Validation Error', details: parsed.error.issues });
    }

    const { name, type, chatbotIds, rawContent, jsonFieldMap } = parsed.data;
    const now = new Date().toISOString();
    const sourceId = randomUUID();

    let ingestionResult;
    if (type === 'json') {
      ingestionResult = IngestionService.processJson(rawContent, jsonFieldMap);
    } else if (type === 'csv') {
      ingestionResult = IngestionService.processCsv(rawContent);
    } else {
      ingestionResult = IngestionService.processText(rawContent, name);
    }

    if (ingestionResult.errorMessage) {
      const errorSource = db.saveKnowledgeSource({
        id: sourceId,
        orgId,
        chatbotIds,
        name,
        type,
        status: 'error',
        rawContent,
        jsonFieldMap: ingestionResult.detectedFieldMap,
        recordCount: 0,
        errorMessage: ingestionResult.errorMessage,
        createdAt: now,
        updatedAt: now,
      });
      return reply.status(400).send({ error: 'Ingestion Failed', source: errorSource });
    }

    const source = db.saveKnowledgeSource({
      id: sourceId,
      orgId,
      chatbotIds,
      name,
      type,
      status: 'ready',
      rawContent,
      jsonFieldMap: ingestionResult.detectedFieldMap,
      recordCount: ingestionResult.recordCount,
      createdAt: now,
      updatedAt: now,
    });

    const recordsToSave = ingestionResult.records.map(rec => ({
      id: randomUUID(),
      orgId,
      sourceId: source.id,
      title: rec.title,
      content: rec.content,
      category: rec.category,
      metadata: rec.metadata,
      createdAt: now,
    }));

    db.saveKnowledgeRecords(recordsToSave);

    return reply.send({
      source,
      recordCount: recordsToSave.length,
      detectedFieldMap: ingestionResult.detectedFieldMap,
    });
  });

  server.post('/api/v1/organizations/:orgId/chatbots/:chatbotId/test-query', { preHandler: requireRole(['editor', 'admin', 'owner']) }, async (req, reply) => {
    const { orgId, chatbotId } = req.params as any;
    const bodySchema = z.object({
      query: z.string().min(1),
    });

    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Validation Error', details: parsed.error.issues });
    }

    const bot = db.getChatbotById(chatbotId);
    if (!bot || bot.orgId !== orgId) {
      return reply.status(404).send({ error: 'Chatbot not found' });
    }

    const answer = await rag.generateAnswer(bot, parsed.data.query);

    return reply.send({
      query: parsed.data.query,
      result: answer,
    });
  });
}
