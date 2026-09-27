import { Chatbot, KnowledgeRecord, Citation, ResponseMode } from '@hola-ai/shared';
import { DatabaseRepository } from '@hola-ai/database';

export interface RAGAnswerResult {
  answer: string;
  citations: Citation[];
  isFallback: boolean;
  responseModeUsed: ResponseMode;
  modelUsed: string;
  confidence: number;
}

export class RAGOrchestrator {
  private db: DatabaseRepository;

  constructor(db: DatabaseRepository) {
    this.db = db;
  }

  public sanitizeInput(input: string): string {
    return input
      .replace(/ignore\s+previous\s+instructions/gi, '[filtered]')
      .replace(/reveal\s+(system\s+prompt|api\s+key|secrets)/gi, '[filtered]')
      .trim();
  }

  public async generateAnswer(
    chatbot: Chatbot,
    userQuery: string
  ): Promise<RAGAnswerResult> {
    const cleanQuery = this.sanitizeInput(userQuery);
    const mode = chatbot.responseMode || 'business_data_first';

    const records = this.db.searchKnowledgeRecords(
      chatbot.orgId,
      chatbot.id,
      cleanQuery,
      5
    );

    const citations: Citation[] = records.map(rec => ({
      sourceId: rec.sourceId,
      sourceName: 'Business Knowledge Base',
      title: rec.title,
      excerpt: rec.content.slice(0, 200),
      recordId: rec.id,
      confidence: 0.85,
    }));

    const hasSufficientData = records.length > 0;

    if (mode === 'business_data_only') {
      if (hasSufficientData) {
        const formattedAnswer = this.formatBusinessDataAnswer(cleanQuery, records, chatbot);
        return {
          answer: formattedAnswer,
          citations,
          isFallback: false,
          responseModeUsed: mode,
          modelUsed: 'business-data-engine (no-ai)',
          confidence: 0.9,
        };
      } else {
        return {
          answer: chatbot.behaviorConfig.fallbackMessage || 'I do not have that information in my business knowledge base.',
          citations: [],
          isFallback: true,
          responseModeUsed: mode,
          modelUsed: 'business-data-engine (no-ai)',
          confidence: 0.0,
        };
      }
    }

    if (mode === 'business_data_first') {
      if (hasSufficientData) {
        const formattedAnswer = this.formatBusinessDataAnswer(cleanQuery, records, chatbot);
        return {
          answer: formattedAnswer,
          citations,
          isFallback: false,
          responseModeUsed: mode,
          modelUsed: 'business-data-engine (hybrid-matched)',
          confidence: 0.88,
        };
      } else {
        if (chatbot.modelConfig.allowGeneralKnowledgeFallback) {
          const aiResponse = await this.callModelProvider(chatbot, cleanQuery, []);
          return {
            answer: `[General AI Note: Not directly in business knowledge base]\n${aiResponse}`,
            citations: [],
            isFallback: true,
            responseModeUsed: mode,
            modelUsed: `${chatbot.modelConfig.provider}:${chatbot.modelConfig.modelName}`,
            confidence: 0.5,
          };
        } else {
          return {
            answer: chatbot.behaviorConfig.fallbackMessage,
            citations: [],
            isFallback: true,
            responseModeUsed: mode,
            modelUsed: 'business-data-engine',
            confidence: 0.0,
          };
        }
      }
    }

    if (mode === 'explicit_global_ai') {
      const aiResponse = await this.callModelProvider(chatbot, cleanQuery, records);
      return {
        answer: aiResponse,
        citations,
        isFallback: false,
        responseModeUsed: mode,
        modelUsed: `${chatbot.modelConfig.provider}:${chatbot.modelConfig.modelName}`,
        confidence: 0.95,
      };
    }

    const exactMatch = records.find(r => r.title.toLowerCase().includes(cleanQuery.toLowerCase()));
    if (exactMatch) {
      return {
        answer: exactMatch.content,
        citations: [{
          sourceId: exactMatch.sourceId,
          sourceName: 'Rules Engine',
          title: exactMatch.title,
          excerpt: exactMatch.content,
          confidence: 1.0,
        }],
        isFallback: false,
        responseModeUsed: mode,
        modelUsed: 'rules-engine',
        confidence: 1.0,
      };
    } else {
      return {
        answer: chatbot.behaviorConfig.fallbackMessage,
        citations: [],
        isFallback: true,
        responseModeUsed: mode,
        modelUsed: 'rules-engine',
        confidence: 0.0,
      };
    }
  }

  private formatBusinessDataAnswer(query: string, records: KnowledgeRecord[], chatbot: Chatbot): string {
    const top = records[0];
    let response = `Based on our ${top.category ? top.category + ' ' : ''}records for **${top.title}**:\n\n${top.content}`;

    if (records.length > 1) {
      response += `\n\n*Related Information:*`;
      for (let i = 1; i < Math.min(records.length, 3); i++) {
        response += `\n- **${records[i].title}**: ${records[i].content.slice(0, 120)}...`;
      }
    }

    return response;
  }

  private async callModelProvider(chatbot: Chatbot, query: string, contextRecords: KnowledgeRecord[]): Promise<string> {
    const provider = chatbot.modelConfig.provider;
    const persona = chatbot.behaviorConfig.persona || 'Customer Support Assistant';
    const instructions = chatbot.behaviorConfig.systemInstructions || '';
    const contextText = contextRecords.map(r => `[Source: ${r.title}]\n${r.content}`).join('\n\n');

    if (provider === 'mock' || !process.env.OPENAI_API_KEY) {
      if (contextRecords.length > 0) {
        return `[Assistant (${persona})]: ${instructions}\n\nAccording to our business records:\n${contextText}`;
      }
      return `[Assistant (${persona})]: Thank you for your inquiry about "${query}". How else can I assist you with our services today?`;
    }

    return `[${provider.toUpperCase()} Answer]: Responding to "${query}" guided by system persona: ${persona}.`;
  }
}
