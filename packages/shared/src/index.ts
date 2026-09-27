import { z } from 'zod';

// Roles & Permissions
export const OrgRoleSchema = z.enum([
  'owner',
  'admin',
  'developer',
  'editor',
  'analyst',
  'support_agent',
  'viewer',
]);
export type OrgRole = z.infer<typeof OrgRoleSchema>;

// User & Organization Schemas
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  displayName: z.string().min(1),
  avatarUrl: z.string().optional(),
  timezone: z.string().default('UTC'),
  language: z.string().default('en'),
  isPlatformAdmin: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type User = z.infer<typeof UserSchema>;

export const OrganizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  logoUrl: z.string().optional(),
  ownerId: z.string().uuid(),
  planTier: z.enum(['free', 'starter', 'professional', 'business', 'enterprise']).default('free'),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Organization = z.infer<typeof OrganizationSchema>;

export const MemberSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  userId: z.string().uuid(),
  role: OrgRoleSchema,
  userEmail: z.string().email().optional(),
  userName: z.string().optional(),
  createdAt: z.string(),
});
export type Member = z.infer<typeof MemberSchema>;

// Chatbot & Visual Builder Configs
export const ResponseModeSchema = z.enum([
  'business_data_first',
  'business_data_only',
  'explicit_global_ai',
  'rules_faq',
]);
export type ResponseMode = z.infer<typeof ResponseModeSchema>;

export const ChatbotWidgetConfigSchema = z.object({
  displayName: z.string().default('Assistant'),
  avatarUrl: z.string().optional(),
  primaryColor: z.string().default('#3b82f6'),
  accentColor: z.string().default('#1d4ed8'),
  backgroundColor: z.string().default('#ffffff'),
  textColor: z.string().default('#1f2937'),
  fontFamily: z.string().default('Inter, sans-serif'),
  fontSize: z.number().default(14),
  borderRadius: z.number().default(12),
  position: z.enum(['bottom_right', 'bottom_left', 'top_right', 'top_left']).default('bottom_right'),
  headerTitle: z.string().default('Chat with us'),
  welcomeMessage: z.string().default('Hello! How can I assist you with our business today?'),
  conversationStarters: z.array(z.string()).default([
    'What products do you offer?',
    'What are your pricing options?',
    'How can I contact support?'
  ]),
  suggestedReplies: z.array(z.string()).default([]),
  inputPlaceholder: z.string().default('Type your question here...'),
  showBranding: z.boolean().default(true),
  customCss: z.string().optional(),
  themeMode: z.enum(['light', 'dark', 'auto']).default('light'),
});
export type ChatbotWidgetConfig = z.infer<typeof ChatbotWidgetConfigSchema>;

export const ChatbotBehaviorConfigSchema = z.object({
  systemInstructions: z.string().default('You are a helpful business customer assistant. Answer questions using the provided business knowledge accurately and professionally.'),
  persona: z.string().default('Professional and friendly customer support representative'),
  language: z.string().default('English'),
  responseStyle: z.enum(['concise', 'detailed', 'friendly', 'formal', 'technical']).default('friendly'),
  maxAnswerLength: z.number().default(500),
  fallbackMessage: z.string().default('I apologize, but I do not have that information in my business knowledge base right now. Would you like to speak to a human representative?'),
  allowedTopics: z.array(z.string()).default([]),
  prohibitedTopics: z.array(z.string()).default([]),
  confidenceThreshold: z.number().min(0).max(1).default(0.4),
  showSourceCitations: z.boolean().default(true),
  humanHandoffEnabled: z.boolean().default(true),
  humanHandoffTriggerKeywords: z.array(z.string()).default(['human', 'agent', 'support', 'representative', 'person']),
});
export type ChatbotBehaviorConfig = z.infer<typeof ChatbotBehaviorConfigSchema>;

export const ChatbotModelConfigSchema = z.object({
  provider: z.enum(['mock', 'openai', 'anthropic', 'google']).default('mock'),
  modelName: z.string().default('default'),
  temperature: z.number().min(0).max(2).default(0.2),
  maxTokens: z.number().default(1000),
  allowGeneralKnowledgeFallback: z.boolean().default(false),
  customApiKeyRef: z.string().optional(),
});
export type ChatbotModelConfig = z.infer<typeof ChatbotModelConfigSchema>;

export const ChatbotSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().default(''),
  purpose: z.enum(['customer_support', 'sales', 'faq', 'education', 'booking', 'internal']).default('customer_support'),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  version: z.number().default(1),
  publishedVersion: z.number().optional(),
  responseMode: ResponseModeSchema.default('business_data_first'),
  widgetConfig: ChatbotWidgetConfigSchema,
  behaviorConfig: ChatbotBehaviorConfigSchema,
  modelConfig: ChatbotModelConfigSchema,
  allowedDomains: z.array(z.string()).default(['*']),
  publicEmbedId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Chatbot = z.infer<typeof ChatbotSchema>;

// Knowledge Base & JSON
export const KnowledgeSourceTypeSchema = z.enum([
  'json',
  'pdf',
  'docx',
  'txt',
  'csv',
  'markdown',
  'faq',
  'web_url',
]);
export type KnowledgeSourceType = z.infer<typeof KnowledgeSourceTypeSchema>;

export const JSONFieldMapSchema = z.object({
  idField: z.string().optional(),
  titleField: z.string().optional(),
  contentFields: z.array(z.string()).default([]),
  categoryField: z.string().optional(),
  priceField: z.string().optional(),
  urlField: z.string().optional(),
});
export type JSONFieldMap = z.infer<typeof JSONFieldMapSchema>;

export const KnowledgeSourceSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  chatbotIds: z.array(z.string().uuid()).default([]),
  name: z.string().min(1),
  type: KnowledgeSourceTypeSchema,
  status: z.enum(['pending', 'processing', 'ready', 'error']).default('ready'),
  fileUrl: z.string().optional(),
  rawContent: z.string().optional(),
  jsonFieldMap: JSONFieldMapSchema.optional(),
  recordCount: z.number().default(0),
  errorMessage: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type KnowledgeSource = z.infer<typeof KnowledgeSourceSchema>;

export const KnowledgeRecordSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  sourceId: z.string().uuid(),
  title: z.string(),
  content: z.string(),
  category: z.string().optional(),
  metadata: z.record(z.any()).default({}),
  embedding: z.array(z.number()).optional(),
  createdAt: z.string(),
});
export type KnowledgeRecord = z.infer<typeof KnowledgeRecordSchema>;

// Conversations & Messages
export const MessageSenderSchema = z.enum(['visitor', 'bot', 'agent', 'system']);
export type MessageSender = z.infer<typeof MessageSenderSchema>;

export const CitationSchema = z.object({
  sourceId: z.string(),
  sourceName: z.string(),
  title: z.string(),
  excerpt: z.string(),
  recordId: z.string().optional(),
  confidence: z.number(),
});
export type Citation = z.infer<typeof CitationSchema>;

export const MessageSchema = z.object({
  id: z.string().uuid(),
  conversationId: z.string().uuid(),
  sender: MessageSenderSchema,
  senderName: z.string().optional(),
  content: z.string(),
  citations: z.array(CitationSchema).default([]),
  isFallback: z.boolean().default(false),
  responseModeUsed: ResponseModeSchema.optional(),
  modelUsed: z.string().optional(),
  feedbackScore: z.number().optional(),
  createdAt: z.string(),
});
export type Message = z.infer<typeof MessageSchema>;

export const ConversationSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  chatbotId: z.string().uuid(),
  visitorId: z.string(),
  status: z.enum(['open', 'pending_agent', 'agent_active', 'resolved', 'archived']).default('open'),
  assignedAgentId: z.string().uuid().optional(),
  visitorName: z.string().optional(),
  visitorEmail: z.string().email().optional(),
  internalNotes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Conversation = z.infer<typeof ConversationSchema>;

// Payments & Subscriptions
export const PlanTierSchema = z.enum(['free', 'starter', 'professional', 'business', 'enterprise']);
export type PlanTier = z.infer<typeof PlanTierSchema>;

export const PlanEntitlementsSchema = z.object({
  maxChatbots: z.number(),
  maxMonthlyConversations: z.number(),
  maxKnowledgeStorageMb: z.number(),
  allowGlobalAiModels: z.boolean(),
  allowCustomBranding: z.boolean(),
  allowApiAndWebhooks: z.boolean(),
  maxTeamMembers: z.number(),
});
export type PlanEntitlements = z.infer<typeof PlanEntitlementsSchema>;

export const SubscriptionSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  planTier: PlanTierSchema,
  status: z.enum(['active', 'trialing', 'past_due', 'canceled']).default('active'),
  paypalSubscriptionId: z.string().optional(),
  currentPeriodStart: z.string(),
  currentPeriodEnd: z.string(),
  createdAt: z.string(),
});
export type Subscription = z.infer<typeof SubscriptionSchema>;

export const PaymentTransactionSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  provider: z.enum(['paypal', 'stripe', 'mock']).default('paypal'),
  transactionId: z.string(),
  amount: z.number(),
  currency: z.string().default('USD'),
  status: z.enum(['completed', 'pending', 'failed', 'refunded']).default('completed'),
  description: z.string(),
  createdAt: z.string(),
});
export type PaymentTransaction = z.infer<typeof PaymentTransactionSchema>;

// Marketplace Templates
export const MarketplaceCategorySchema = z.enum([
  'e_commerce',
  'hospitality',
  'healthcare_admin',
  'education',
  'real_estate',
  'finance',
  'saas_support',
  'hr_internal',
  'general_business',
  'developer_tools'
]);
export type MarketplaceCategory = z.infer<typeof MarketplaceCategorySchema>;

export const MarketplaceTemplateSchema = z.object({
  id: z.string().uuid(),
  publisherOrgId: z.string().uuid(),
  publisherName: z.string(),
  name: z.string().min(1),
  description: z.string(),
  category: MarketplaceCategorySchema,
  tags: z.array(z.string()).default([]),
  avatarUrl: z.string().optional(),
  chatbotConfig: ChatbotSchema.omit({ id: true, orgId: true, publicEmbedId: true, createdAt: true, updatedAt: true }),
  sampleKnowledge: z.array(z.object({
    title: z.string(),
    content: z.string(),
    category: z.string().optional(),
  })).default([]),
  price: z.number().default(0),
  isPublic: z.boolean().default(true),
  installCount: z.number().default(0),
  rating: z.number().default(5.0),
  reviewCount: z.number().default(0),
  createdAt: z.string(),
});
export type MarketplaceTemplate = z.infer<typeof MarketplaceTemplateSchema>;

// Developer API & Webhooks
export const ApiKeySchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  name: z.string(),
  keyHash: z.string(),
  keyPrefix: z.string(),
  scopes: z.array(z.string()).default(['chat', 'knowledge_read']),
  lastUsedAt: z.string().optional(),
  createdAt: z.string(),
});
export type ApiKey = z.infer<typeof ApiKeySchema>;

export const WebhookEndpointSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  targetUrl: z.string().url(),
  secret: z.string(),
  events: z.array(z.string()).default(['conversation.created', 'message.created', 'handoff.requested']),
  isActive: z.boolean().default(true),
  createdAt: z.string(),
});
export type WebhookEndpoint = z.infer<typeof WebhookEndpointSchema>;

// Audit Logs
export const AuditLogSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  action: z.string(),
  resourceType: z.string(),
  resourceId: z.string().optional(),
  details: z.record(z.any()).default({}),
  ipAddress: z.string().optional(),
  createdAt: z.string(),
});
export type AuditLog = z.infer<typeof AuditLogSchema>;
