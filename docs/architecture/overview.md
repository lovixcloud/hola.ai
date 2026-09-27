# hola.ai Architecture & System Design Overview

## 1. System Vision
**hola.ai** is a multi-tenant SaaS application designed to empower businesses, agencies, and developers to create, customize, embed, and monetize custom AI chatbots. The core foundation of hola.ai is **Business Data First**: every chatbot query prioritizes business knowledge (JSON catalogs, uploaded documents, FAQs) before considering external AI models.

## 2. Monorepo & Application Modules
The platform is structured as a TypeScript monorepo using `pnpm` workspaces:

```text
hola-ai/
├── apps/
│   ├── web/         # React + Vite + Tailwind CSS dashboard & Visual Builder UI
│   ├── api/         # Fastify + Node.js TypeScript REST API & RAG Engine
│   └── widget/      # Standalone embeddable JavaScript chatbot runtime bundle
├── packages/
│   └── shared/      # Shared Zod schemas, TypeScript types, and domain models
├── database/        # Database storage layer, schema migrations, and seed runner
├── docs/            # System architecture, API docs, security & deployment guides
└── .github/         # Continuous Integration GitHub Actions workflows
```

## 3. Data-First RAG Retrieval Engine
When a visitor sends a question:
1. **Query Sanitization**: User input is sanitized against prompt injection and secret-leak attempts.
2. **Knowledge Search**: Keyword and metadata retrieval searches assigned business knowledge records (JSON fields, document passages, FAQs).
3. **Response Mode Orchestration**:
   - `business_data_first` (Default): Uses matching business knowledge with citations. Invokes external AI models only if explicitly enabled in fallback settings.
   - `business_data_only`: Strict zero-external-AI mode. Returns fallback message if data is unmatched.
   - `explicit_global_ai`: Directly routes to global AI models (OpenAI, Anthropic, Gemini, Mock) with grounded business context.
   - `rules_faq`: Exact FAQ or rule matches.

## 4. Multi-Tenancy & Security Model
- **Tenant Isolation**: Every database entity is scoped by `orgId` (Organization ID).
- **Role-Based Access Control (RBAC)**: Supports 7 granular roles: `owner`, `admin`, `developer`, `editor`, `analyst`, `support_agent`, and `viewer`.
- **API Key Scopes & Webhooks**: Developer API keys carry hashed secrets and custom scopes. Webhook events are dispatched asynchronously.
