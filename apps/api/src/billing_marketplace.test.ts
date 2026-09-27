import assert from 'node:assert';
import { test } from 'node:test';
import { buildServer } from './index.js';

test('Billing & Marketplace Integration Tests', async () => {
  const server = buildServer(':memory:', true);
  await server.ready();

  const loginRes = await server.inject({
    method: 'POST',
    url: '/api/v1/auth/login',
    payload: { email: 'alex@acme.com', password: 'password123' },
  });
  const { token } = JSON.parse(loginRes.body);
  const orgId = '22222222-2222-2222-2222-222222222222';

  const createOrderRes = await server.inject({
    method: 'POST',
    url: `/api/v1/organizations/${orgId}/billing/paypal/create-order`,
    headers: { authorization: `Bearer ${token}` },
    payload: { planTier: 'business' },
  });
  assert.strictEqual(createOrderRes.statusCode, 200);

  const tplRes = await server.inject({
    method: 'GET',
    url: '/api/v1/marketplace/templates',
  });
  assert.strictEqual(tplRes.statusCode, 200);

  await server.close();
});
