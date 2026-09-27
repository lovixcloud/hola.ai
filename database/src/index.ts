import fs from 'fs';
import path from 'path';
import {
  User, Organization, Member, Chatbot, KnowledgeSource, KnowledgeRecord,
  Conversation, Message, Subscription, PaymentTransaction, MarketplaceTemplate,
  ApiKey, WebhookEndpoint, AuditLog, OrgRole
} from '@hola-ai/shared';

export class DatabaseRepository {
  private filePath?: string;
  private users: Map<string, User> = new Map();
  private organizations: Map<string, Organization> = new Map();
  private members: Map<string, Member> = new Map();
  private chatbots: Map<string, Chatbot> = new Map();
  private knowledgeSources: Map<string, KnowledgeSource> = new Map();
  private knowledgeRecords: Map<string, KnowledgeRecord> = new Map();
  private conversations: Map<string, Conversation> = new Map();
  private messages: Map<string, Message> = new Map();
  private subscriptions: Map<string, Subscription> = new Map();
  private paymentTransactions: Map<string, PaymentTransaction> = new Map();
  private marketplaceTemplates: Map<string, MarketplaceTemplate> = new Map();
  private apiKeys: Map<string, ApiKey> = new Map();
  private webhookEndpoints: Map<string, WebhookEndpoint> = new Map();
  private auditLogs: AuditLog[] = [];

  constructor(dbPath: string = ':memory:') {
    if (dbPath !== ':memory:') {
      this.filePath = dbPath;
      this.loadFromFile();
    }
  }

  private loadFromFile() {
    if (!this.filePath || !fs.existsSync(this.filePath)) return;
    try {
      const raw = fs.readFileSync(this.filePath, 'utf8');
      const data = JSON.parse(raw);
      if (data.users) this.users = new Map(data.users);
      if (data.organizations) this.organizations = new Map(data.organizations);
      if (data.members) this.members = new Map(data.members);
      if (data.chatbots) this.chatbots = new Map(data.chatbots);
      if (data.knowledgeSources) this.knowledgeSources = new Map(data.knowledgeSources);
      if (data.knowledgeRecords) this.knowledgeRecords = new Map(data.knowledgeRecords);
      if (data.conversations) this.conversations = new Map(data.conversations);
      if (data.messages) this.messages = new Map(data.messages);
      if (data.subscriptions) this.subscriptions = new Map(data.subscriptions);
      if (data.paymentTransactions) this.paymentTransactions = new Map(data.paymentTransactions);
      if (data.marketplaceTemplates) this.marketplaceTemplates = new Map(data.marketplaceTemplates);
      if (data.apiKeys) this.apiKeys = new Map(data.apiKeys);
      if (data.webhookEndpoints) this.webhookEndpoints = new Map(data.webhookEndpoints);
      if (data.auditLogs) this.auditLogs = data.auditLogs;
    } catch (e) {
      console.warn('Failed to parse database file, starting fresh:', e);
    }
  }

  private persist() {
    if (!this.filePath) return;
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const payload = {
        users: Array.from(this.users.entries()),
        organizations: Array.from(this.organizations.entries()),
        members: Array.from(this.members.entries()),
        chatbots: Array.from(this.chatbots.entries()),
        knowledgeSources: Array.from(this.knowledgeSources.entries()),
        knowledgeRecords: Array.from(this.knowledgeRecords.entries()),
        conversations: Array.from(this.conversations.entries()),
        messages: Array.from(this.messages.entries()),
        subscriptions: Array.from(this.subscriptions.entries()),
        paymentTransactions: Array.from(this.paymentTransactions.entries()),
        marketplaceTemplates: Array.from(this.marketplaceTemplates.entries()),
        apiKeys: Array.from(this.apiKeys.entries()),
        webhookEndpoints: Array.from(this.webhookEndpoints.entries()),
        auditLogs: this.auditLogs,
      };
      fs.writeFileSync(this.filePath, JSON.stringify(payload, null, 2), 'utf8');
    } catch (e) {
      console.error('Database write error:', e);
    }
  }

  // USERS
  createUser(user: User): User {
    this.users.set(user.id, user);
    this.persist();
    return user;
  }

  getUserById(id: string): User | null {
    return this.users.get(id) || null;
  }

  getUserByEmail(email: string): User | null {
    for (const u of this.users.values()) {
      if (u.email.toLowerCase() === email.toLowerCase()) return u;
    }
    return null;
  }

  // ORGANIZATIONS
  createOrganization(org: Organization): Organization {
    this.organizations.set(org.id, org);
    this.persist();
    return org;
  }

  getOrganizationById(id: string): Organization | null {
    return this.organizations.get(id) || null;
  }

  // MEMBERS
  addMember(member: Member): Member {
    this.members.set(member.id, member);
    this.persist();
    return member;
  }

  getMember(orgId: string, userId: string): Member | null {
    for (const m of this.members.values()) {
      if (m.orgId === orgId && m.userId === userId) return m;
    }
    return null;
  }

  listMembersByOrg(orgId: string): Member[] {
    const list: Member[] = [];
    for (const m of this.members.values()) {
      if (m.orgId === orgId) {
        const u = this.getUserById(m.userId);
        list.push({
          ...m,
          userEmail: u?.email,
          userName: u?.displayName,
        });
      }
    }
    return list;
  }

  // CHATBOTS
  saveChatbot(bot: Chatbot): Chatbot {
    this.chatbots.set(bot.id, bot);
    this.persist();
    return bot;
  }

  getChatbotById(id: string): Chatbot | null {
    return this.chatbots.get(id) || null;
  }

  getChatbotByEmbedId(embedId: string): Chatbot | null {
    for (const b of this.chatbots.values()) {
      if (b.publicEmbedId === embedId) return b;
    }
    return null;
  }

  listChatbotsByOrg(orgId: string): Chatbot[] {
    const list: Chatbot[] = [];
    for (const b of this.chatbots.values()) {
      if (b.orgId === orgId) list.push(b);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // KNOWLEDGE SOURCES & RECORDS
  saveKnowledgeSource(source: KnowledgeSource): KnowledgeSource {
    this.knowledgeSources.set(source.id, source);
    this.persist();
    return source;
  }

  listKnowledgeSourcesByOrg(orgId: string): KnowledgeSource[] {
    const list: KnowledgeSource[] = [];
    for (const s of this.knowledgeSources.values()) {
      if (s.orgId === orgId) list.push(s);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  saveKnowledgeRecords(records: KnowledgeRecord[]) {
    for (const r of records) {
      this.knowledgeRecords.set(r.id, r);
    }
    this.persist();
  }

  searchKnowledgeRecords(orgId: string, chatbotId: string, query: string, limit: number = 5): KnowledgeRecord[] {
    const sources = this.listKnowledgeSourcesByOrg(orgId).filter(s => s.chatbotIds.length === 0 || s.chatbotIds.includes(chatbotId));
    if (sources.length === 0) return [];
    const sourceIds = new Set(sources.map(s => s.id));

    const candidateRecords: KnowledgeRecord[] = [];
    for (const r of this.knowledgeRecords.values()) {
      if (r.orgId === orgId && sourceIds.has(r.sourceId)) {
        candidateRecords.push(r);
      }
    }

    const lowerQuery = query.toLowerCase().trim();
    const queryTerms = lowerQuery.split(/\s+/).filter(t => t.length > 2);

    const scored = candidateRecords.map(r => {
      const titleLower = r.title.toLowerCase();
      const contentLower = r.content.toLowerCase();
      let score = 0;

      if (titleLower.includes(lowerQuery)) score += 10;
      if (contentLower.includes(lowerQuery)) score += 5;

      for (const term of queryTerms) {
        if (titleLower.includes(term)) score += 3;
        if (contentLower.includes(term)) score += 1;
      }

      return { record: r, score };
    });

    return scored
      .filter(item => item.score > 0 || queryTerms.length === 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.record);
  }

  // CONVERSATIONS & MESSAGES
  createConversation(conv: Conversation): Conversation {
    this.conversations.set(conv.id, conv);
    this.persist();
    return conv;
  }

  getConversationById(id: string): Conversation | null {
    return this.conversations.get(id) || null;
  }

  updateConversationStatus(id: string, status: any, agentId?: string, notes?: string) {
    const conv = this.conversations.get(id);
    if (conv) {
      conv.status = status;
      if (agentId) conv.assignedAgentId = agentId;
      if (notes) conv.internalNotes = notes;
      conv.updatedAt = new Date().toISOString();
      this.conversations.set(id, conv);
      this.persist();
    }
  }

  listConversationsByOrg(orgId: string): Conversation[] {
    const list: Conversation[] = [];
    for (const c of this.conversations.values()) {
      if (c.orgId === orgId) list.push(c);
    }
    return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  addMessage(msg: Message): Message {
    this.messages.set(msg.id, msg);
    this.persist();
    return msg;
  }

  listMessagesByConversation(conversationId: string): Message[] {
    const list: Message[] = [];
    for (const m of this.messages.values()) {
      if (m.conversationId === conversationId) list.push(m);
    }
    return list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  // SUBSCRIPTIONS & TRANSACTIONS
  saveSubscription(sub: Subscription): Subscription {
    this.subscriptions.set(sub.orgId, sub);
    const org = this.organizations.get(sub.orgId);
    if (org) {
      org.planTier = sub.planTier;
      this.organizations.set(org.id, org);
    }
    this.persist();
    return sub;
  }

  getSubscriptionByOrg(orgId: string): Subscription | null {
    return this.subscriptions.get(orgId) || null;
  }

  addPaymentTransaction(tx: PaymentTransaction): PaymentTransaction {
    this.paymentTransactions.set(tx.id, tx);
    this.persist();
    return tx;
  }

  listTransactionsByOrg(orgId: string): PaymentTransaction[] {
    const list: PaymentTransaction[] = [];
    for (const tx of this.paymentTransactions.values()) {
      if (tx.orgId === orgId) list.push(tx);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // MARKETPLACE
  saveMarketplaceTemplate(tpl: MarketplaceTemplate): MarketplaceTemplate {
    this.marketplaceTemplates.set(tpl.id, tpl);
    this.persist();
    return tpl;
  }

  listMarketplaceTemplates(category?: string, query?: string): MarketplaceTemplate[] {
    let list = Array.from(this.marketplaceTemplates.values()).filter(t => t.isPublic);
    if (category && category !== 'all') {
      list = list.filter(t => t.category === category);
    }
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
    }
    return list.sort((a, b) => b.rating - a.rating || b.installCount - a.installCount);
  }

  // API KEYS & WEBHOOKS
  saveApiKey(key: ApiKey): ApiKey {
    this.apiKeys.set(key.id, key);
    this.persist();
    return key;
  }

  listApiKeysByOrg(orgId: string): ApiKey[] {
    const list: ApiKey[] = [];
    for (const k of this.apiKeys.values()) {
      if (k.orgId === orgId) list.push(k);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  saveWebhookEndpoint(wh: WebhookEndpoint): WebhookEndpoint {
    this.webhookEndpoints.set(wh.id, wh);
    this.persist();
    return wh;
  }

  listWebhookEndpointsByOrg(orgId: string): WebhookEndpoint[] {
    const list: WebhookEndpoint[] = [];
    for (const w of this.webhookEndpoints.values()) {
      if (w.orgId === orgId) list.push(w);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // AUDIT LOGS
  addAuditLog(log: AuditLog) {
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 500) this.auditLogs.pop();
    this.persist();
  }

  listAuditLogs(orgId?: string): AuditLog[] {
    if (orgId) {
      return this.auditLogs.filter(l => l.orgId === orgId);
    }
    return this.auditLogs;
  }
}
