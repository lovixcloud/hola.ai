# hola.ai Security & Multi-Tenant Model

## 1. Tenant Isolation
Every database table filters operations by `org_id`. Server-side validation enforces organization membership before reading or writing records.

## 2. Prompt Injection Protections
- Input sanitization strips system override phrases (`ignore previous instructions`, `reveal secrets`).
- System instructions are enforced in a isolated persona prompt.
- RAG retrieval results are passed as untrusted factual context.

## 3. Secrets & Payment Security
- Provider API keys and webhook secrets are encrypted at rest.
- No raw credit card data is ever stored on hola.ai servers; PayPal OAuth and Webhook validation handles payment verification.
