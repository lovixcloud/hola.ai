# hola.ai — Custom AI Chatbot Builder, Marketplace & Business Intelligence Platform

**hola.ai** is a scalable, multi-tenant SaaS application for creating, managing, customizing, embedding, and monetizing intelligent business chatbots.

The platform is **business-data-first by default**. When a chatbot receives a question, it searches the business's configured JSON data, uploaded files, knowledge base, or connected business sources before considering an external AI model.

---

## 🌟 Key Features

- **Visual Chatbot Builder**: Customize brand colors, typography, avatar, positioning, header text, welcome greetings, and conversation starters with live interactive widget preview.
- **JSON-First Business Data Management**: Upload or paste structured JSON datasets, products, and FAQs with automatic field mapping detection.
- **Data-First RAG Retrieval Engine**: Supports four response modes:
  1. `business_data_first` (Default): Searches business knowledge first; includes source citations.
  2. `business_data_only`: Strict privacy mode with zero external AI model calls.
  3. `explicit_global_ai`: Grounded responses using OpenAI, Anthropic, Gemini, or Mock providers.
  4. `rules_faq`: Exact keyword/rule matching.
- **Embeddable Chatbot Widget**: Standalone, lightweight JavaScript widget (`widget.iife.js`) embeddable into external websites.
- **Chatbot Marketplace**: Discover, preview, publish, and 1-click install sanitized chatbot templates into workspaces.
- **PayPal Payments & Usage Metering**: Subscription checkout, order capture, idempotent webhook processing, and plan entitlements enforcement.
- **Multi-Tenancy & RBAC**: Organization workspaces with 7 granular roles (`owner`, `admin`, `developer`, `editor`, `analyst`, `support_agent`, `viewer`).
- **Conversations Inbox & Live Handoff**: Review visitor sessions, unanswered questions, and human agent takeover.
- **Developer APIs & Webhooks**: Scoped API key generation and webhook event listeners.
- **Platform Admin Console**: Global system metrics, moderation, and security audit logs.

---

## 🏗️ Repository Architecture

```text
hola-ai/
├── apps/
│   ├── web/         # React + Vite + Tailwind CSS dashboard & Visual Builder UI
│   ├── api/         # Fastify + Node.js TypeScript REST API & RAG Engine
│   └── widget/      # Standalone embeddable JavaScript chatbot runtime bundle
├── packages/
│   └── shared/      # Shared Zod schemas, TypeScript types, and domain models
├── database/        # Database storage layer, schema migrations, and seed runner
├── docs/            # Architecture overview, OpenAPI specs, deployment & security guides
└── .github/         # Continuous Integration GitHub Actions workflow
```

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Build All Packages
```bash
pnpm run build
```

### 3. Run Automated Tests
```bash
pnpm run test
```

### 4. Start Development Servers
```bash
# Start API server and Web dashboard simultaneously
pnpm run dev
```

- **Web Dashboard**: [http://localhost:5173](http://localhost:5173)
- **API Server**: [http://localhost:3000](http://localhost:3000)
- **OpenAPI Docs**: [http://localhost:3000/docs](http://localhost:3000/docs)

---

## 🔑 Demo Credentials

- **Email**: `alex@acme.com`
- **Password**: `password123`
- **Platform Admin**: `admin@hola.ai` / `password123`

---

## 📜 License
MIT License.
