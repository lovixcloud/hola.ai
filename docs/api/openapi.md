# hola.ai REST API & OpenAPI Specification

The `apps/api` server automatically generates interactive OpenAPI 3.0 documentation served at `/docs`.

## Key Endpoint Groups

### 1. Authentication
- `POST /api/v1/auth/register` - Account registration & workspace creation
- `POST /api/v1/auth/login` - User login & JWT issuance
- `GET /api/v1/auth/me` - Authenticated user profile

### 2. Organizations & RBAC
- `GET /api/v1/organizations` - List user workspaces
- `POST /api/v1/organizations` - Create new workspace
- `GET /api/v1/organizations/:orgId` - Get organization details & subscription status
- `POST /api/v1/organizations/:orgId/members` - Invite member & set role

### 3. Visual Chatbot Builder
- `GET /api/v1/organizations/:orgId/chatbots` - List workspace chatbots
- `POST /api/v1/organizations/:orgId/chatbots` - Create chatbot via wizard
- `PUT /api/v1/organizations/:orgId/chatbots/:chatbotId` - Update widget config, behavior, and response modes
- `POST /api/v1/organizations/:orgId/chatbots/:chatbotId/publish` - Publish chatbot version

### 4. Knowledge Base & Ingestion
- `GET /api/v1/organizations/:orgId/knowledge/sources` - List knowledge sources
- `POST /api/v1/organizations/:orgId/knowledge/sources` - Upload & index JSON / CSV / TXT
- `POST /api/v1/organizations/:orgId/chatbots/:chatbotId/test-query` - Test RAG query search

### 5. Public Embed Chat Runtime
- `GET /api/v1/public/chatbots/:embedId/config` - Fetch public embed widget config
- `POST /api/v1/public/chatbots/:embedId/chat` - Submit public message and receive RAG answer with citations

### 6. Billing & PayPal
- `GET /api/v1/billing/plans` - List subscription plan tiers
- `GET /api/v1/organizations/:orgId/billing` - Subscription & usage meters
- `POST /api/v1/organizations/:orgId/billing/paypal/create-order` - Create PayPal subscription order
- `POST /api/v1/organizations/:orgId/billing/paypal/capture-order` - Capture and verify PayPal payment
- `POST /api/v1/billing/paypal/webhook` - Idempotent PayPal event receiver

### 7. Marketplace & Developer APIs
- `GET /api/v1/marketplace/templates` - Browse marketplace catalog
- `POST /api/v1/organizations/:orgId/marketplace/install` - 1-Click install template
- `POST /api/v1/organizations/:orgId/developer/keys` - Create scoped API keys
- `POST /api/v1/organizations/:orgId/developer/webhooks` - Register webhook endpoints
