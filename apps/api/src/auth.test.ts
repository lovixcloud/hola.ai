import assert from 'node:assert';
import { test } from 'node:test';
import { buildServer } from './index.js';

test('Auth & RBAC Integration Tests', async () => {
  const server = buildServer(':memory:', true);
  await server.ready();

  const healthRes = await server.inject({ method: 'GET', url: '/health' });
  assert.strictEqual(healthRes.statusCode, 200);

  const loginRes = await server.inject({
    method: 'POST',
    url: '/api/v1/auth/login',
    payload: { email: 'alex@acme.com', password: 'password123' },
  });
  assert.strictEqual(loginRes.statusCode, 200);
  const loginBody = JSON.parse(loginRes.body);
  assert.ok(loginBody.token);

  const meRes = await server.inject({
    method: 'GET',
    url: '/api/v1/auth/me',
    headers: { authorization: `Bearer ${loginBody.token}` },
  });
  assert.strictEqual(meRes.statusCode, 200);

  await server.close();
});
