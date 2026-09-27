import assert from 'node:assert';
import { test } from 'node:test';
import { DatabaseRepository } from './index.js';
import { runSeed } from './seed/seed.js';

test('Database Repository & Seed Initialization', () => {
  const db = new DatabaseRepository(':memory:');
  runSeed(db);

  const admin = db.getUserByEmail('admin@hola.ai');
  assert.ok(admin, 'Admin user should exist');
  assert.strictEqual(admin.isPlatformAdmin, true);

  const org = db.getOrganizationById('22222222-2222-2222-2222-222222222222');
  assert.ok(org, 'Demo organization should exist');
  assert.strictEqual(org.name, 'Acme Store & Services');

  const bots = db.listChatbotsByOrg(org.id);
  assert.strictEqual(bots.length, 1);
  assert.strictEqual(bots[0].responseMode, 'business_data_first');

  const records = db.searchKnowledgeRecords(org.id, bots[0].id, 'headphones');
  assert.ok(records.length > 0, 'Knowledge search should return headphone product record');
});
