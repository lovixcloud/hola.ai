import assert from 'node:assert';
import { test } from 'node:test';
import { buildServer } from './index.js';

test('Data-First RAG Retrieval & Ingestion Tests', async () => {
  const server = buildServer(':memory:', true);
  await server.ready();

  const loginRes = await server.inject({
    method: 'POST',
    url: '/api/v1/auth/login',
    payload: { email: 'alex@acme.com', password: 'password123' },
  });
  const { token } = JSON.parse(loginRes.body);
  const orgId = '22222222-2222-2222-2222-222222222222';

  const customJson = JSON.stringify([
    { id: 'HOTEL-101', hotel_name: 'Grand Ocean Resort', price: '$250/night', amenities: 'Infinity pool, Spa, Beachfront access' },
  ]);

  const ingestRes = await server.inject({
    method: 'POST',
    url: `/api/v1/organizations/${orgId}/knowledge/sources`,
    headers: { authorization: `Bearer ${token}` },
    payload: {
      name: 'Resort Catalog JSON',
      type: 'json',
      rawContent: customJson,
    },
  });
  assert.strictEqual(ingestRes.statusCode, 200);

  const chatbotId = '44444444-4444-4444-4444-444444444444';
  const queryRes = await server.inject({
    method: 'POST',
    url: `/api/v1/organizations/${orgId}/chatbots/${chatbotId}/test-query`,
    headers: { authorization: `Bearer ${token}` },
    payload: { query: 'wireless' },
  });
  assert.strictEqual(queryRes.statusCode, 200);

  await server.close();
});
