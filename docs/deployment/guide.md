# hola.ai Production Deployment Guide

## 1. Prerequisites
- Node.js v20+ and `pnpm`
- PostgreSQL database (or Supabase project)
- PayPal Developer Sandbox / Live credentials

## 2. Environment Variables Setup
Copy `.env.example` to `.env` and populate:

```ini
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@host:5432/hola_ai
JWT_SECRET=your-32-character-jwt-secret
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
PAYPAL_ENVIRONMENT=live
```

## 3. Build & Run
```bash
# Install dependencies
pnpm install

# Build all workspace packages
pnpm run build

# Start API server
pnpm --filter @hola-ai/api start

# Serve web dashboard
pnpm --filter @hola-ai/web dev
```
