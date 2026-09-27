import { DatabaseRepository } from '../index.js';
import { randomUUID } from 'crypto';

export function runSeed(db: DatabaseRepository) {
  console.log('🌱 Seeding hola.ai database...');

  const now = new Date().toISOString();

  // Admin User
  const adminUser = db.createUser({
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@hola.ai',
    displayName: 'Hola Platform Admin',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    timezone: 'UTC',
    language: 'en',
    isPlatformAdmin: true,
    createdAt: now,
    updatedAt: now,
  });

  // Demo Owner User
  const ownerUser = db.createUser({
    id: '11111111-1111-1111-1111-111111111111',
    email: 'alex@acme.com',
    displayName: 'Alex Rivers',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    timezone: 'America/New_York',
    language: 'en',
    isPlatformAdmin: false,
    createdAt: now,
    updatedAt: now,
  });

  // Demo Organization
  const org = db.createOrganization({
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Acme Store & Services',
    slug: 'acme-store',
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
    ownerId: ownerUser.id,
    planTier: 'professional',
    createdAt: now,
    updatedAt: now,
  });

  // Memberships
  db.addMember({
    id: '33333333-3333-3333-3333-333333333333',
    orgId: org.id,
    userId: ownerUser.id,
    role: 'owner',
    createdAt: now,
  });

  db.addMember({
    id: '33333333-3333-3333-3333-333333333334',
    orgId: org.id,
    userId: adminUser.id,
    role: 'admin',
    createdAt: now,
  });

  // Demo Chatbot 1: E-Commerce Customer Support
  const chatbot1 = db.saveChatbot({
    id: '44444444-4444-4444-4444-444444444444',
    orgId: org.id,
    name: 'Acme Shopping Assistant',
    description: 'Helps customers find products, check prices, shipping times, and return policies.',
    purpose: 'customer_support',
    status: 'published',
    version: 1,
    publishedVersion: 1,
    responseMode: 'business_data_first',
    widgetConfig: {
      displayName: 'Acme Support Bot',
      avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150',
      primaryColor: '#2563eb',
      accentColor: '#1d4ed8',
      backgroundColor: '#ffffff',
      textColor: '#0f172a',
      fontFamily: 'Inter, sans-serif',
      fontSize: 14,
      borderRadius: 12,
      position: 'bottom_right',
      headerTitle: 'Acme Store Assistant',
      welcomeMessage: '👋 Welcome to Acme Store! How can I help you find products, track orders, or check our store policies today?',
      conversationStarters: [
        'What wireless earbuds do you have in stock?',
        'What is your return policy?',
        'Do you offer free shipping?'
      ],
      suggestedReplies: ['Product Specs', 'Shipping Costs', 'Contact Support'],
      inputPlaceholder: 'Ask anything about Acme products & policies...',
      showBranding: true,
      themeMode: 'light',
    },
    behaviorConfig: {
      systemInstructions: 'You are Acme Store\'s official AI assistant. Answer customer questions strictly based on Acme\'s product catalog, pricing, and policy JSON records. Be courteous and helpful.',
      persona: 'Friendly E-Commerce Store Representative',
      language: 'English',
      responseStyle: 'friendly',
      maxAnswerLength: 400,
      fallbackMessage: 'I don\'t see that specific item or policy in Acme\'s business database right now. Would you like me to connect you with our live support team?',
      allowedTopics: ['products', 'shipping', 'returns', 'pricing', 'orders'],
      prohibitedTopics: ['competitor products', 'political opinions'],
      confidenceThreshold: 0.35,
      showSourceCitations: true,
      humanHandoffEnabled: true,
      humanHandoffTriggerKeywords: ['human', 'agent', 'representative', 'support ticket'],
    },
    modelConfig: {
      provider: 'mock',
      modelName: 'default-fast',
      temperature: 0.2,
      maxTokens: 500,
      allowGeneralKnowledgeFallback: false,
    },
    allowedDomains: ['*'],
    publicEmbedId: 'embed_acme_shopping_assistant_123',
    createdAt: now,
    updatedAt: now,
  });

  // Knowledge Source: Acme JSON Products & FAQs
  const jsonProducts = [
    {
      sku: 'ACME-HEADPHONES-01',
      title: 'Acme Pro Wireless Noise-Canceling Headphones',
      category: 'Electronics',
      price: '$149.99',
      stock: 'In Stock (45 units)',
      description: 'Active noise cancellation, 30-hour battery life, USB-C fast charging, bluetooth 5.3.',
      warranty: '2-Year Manufacturer Warranty',
      shipping_info: 'Free standard 2-day delivery on orders over $50.'
    },
    {
      sku: 'ACME-EARBUDS-02',
      title: 'Acme AirBuds Sport',
      category: 'Electronics',
      price: '$79.99',
      stock: 'In Stock (120 units)',
      description: 'Water-resistant IPX7, ear hooks for running, 8 hours playback + 24 hours charging case.',
      warranty: '1-Year Manufacturer Warranty',
      shipping_info: 'Ships within 24 hours.'
    },
    {
      sku: 'ACME-SMARTWATCH-03',
      title: 'Acme FitTrack Smartwatch v2',
      category: 'Wearables',
      price: '$199.99',
      stock: 'In Stock (15 units)',
      description: 'Heart rate monitoring, SPO2 sensor, GPS tracking, 7-day battery life, swim proof.',
      warranty: '1-Year Manufacturer Warranty',
      shipping_info: 'Ships via Express Courier.'
    }
  ];

  const jsonPolicies = [
    {
      topic: 'Return Policy',
      title: '30-Day Money-Back Guarantee Policy',
      content: 'Acme Store offers a 30-day money-back guarantee on all unopened and gently used items. Return shipping is free for store credit or $5.99 for full refund to original payment method.'
    },
    {
      topic: 'Shipping Policy',
      title: 'Shipping Options & Timelines',
      content: 'Standard shipping takes 3-5 business days ($4.99 or free over $50). Express shipping takes 1-2 business days ($12.99).'
    },
    {
      topic: 'Operating Hours & Support',
      title: 'Customer Support Working Hours',
      content: 'Our support desk is open Monday to Friday, 8:00 AM to 8:00 PM EST. Weekend email support responds within 24 hours.'
    }
  ];

  const source1 = db.saveKnowledgeSource({
    id: '55555555-5555-5555-5555-555555555555',
    orgId: org.id,
    chatbotIds: [chatbot1.id],
    name: 'Acme Products Catalog (JSON)',
    type: 'json',
    status: 'ready',
    rawContent: JSON.stringify(jsonProducts, null, 2),
    jsonFieldMap: {
      idField: 'sku',
      titleField: 'title',
      contentFields: ['description', 'price', 'stock', 'warranty', 'shipping_info'],
      categoryField: 'category',
      priceField: 'price',
    },
    recordCount: jsonProducts.length,
    createdAt: now,
    updatedAt: now,
  });

  const source2 = db.saveKnowledgeSource({
    id: '55555555-5555-5555-5555-555555555556',
    orgId: org.id,
    chatbotIds: [chatbot1.id],
    name: 'Acme Business Policies & FAQs (JSON)',
    type: 'json',
    status: 'ready',
    rawContent: JSON.stringify(jsonPolicies, null, 2),
    jsonFieldMap: {
      idField: 'topic',
      titleField: 'title',
      contentFields: ['content'],
      categoryField: 'topic',
    },
    recordCount: jsonPolicies.length,
    createdAt: now,
    updatedAt: now,
  });

  db.saveKnowledgeRecords(jsonProducts.map((p) => ({
    id: randomUUID(),
    orgId: org.id,
    sourceId: source1.id,
    title: p.title,
    content: `${p.description} Price: ${p.price}. Stock: ${p.stock}. Warranty: ${p.warranty}. Shipping: ${p.shipping_info}`,
    category: p.category,
    metadata: p,
    createdAt: now,
  })));

  db.saveKnowledgeRecords(jsonPolicies.map((pol) => ({
    id: randomUUID(),
    orgId: org.id,
    sourceId: source2.id,
    title: pol.title,
    content: pol.content,
    category: pol.topic,
    metadata: pol,
    createdAt: now,
  })));

  // Subscriptions
  db.saveSubscription({
    id: '66666666-6666-6666-6666-666666666666',
    orgId: org.id,
    planTier: 'professional',
    status: 'active',
    paypalSubscriptionId: 'I-SUB-ACME-DEMO-99',
    currentPeriodStart: new Date(Date.now() - 15 * 86400000).toISOString(),
    currentPeriodEnd: new Date(Date.now() + 15 * 86400000).toISOString(),
    createdAt: now,
  });

  db.addPaymentTransaction({
    id: '77777777-7777-7777-7777-777777777777',
    orgId: org.id,
    provider: 'paypal',
    transactionId: 'PAYPAL-TX-9876543210',
    amount: 49.00,
    currency: 'USD',
    status: 'completed',
    description: 'Hola.ai Professional Monthly Plan',
    createdAt: now,
  });

  // Marketplace Templates
  db.saveMarketplaceTemplate({
    id: '88888888-8888-8888-8888-888888888888',
    publisherOrgId: org.id,
    publisherName: 'Acme Official',
    name: 'E-Commerce Store & Order Assistant',
    description: 'Ready-to-use chatbot template designed for online stores. Ingests JSON catalog data, answers shipping and return questions.',
    category: 'e_commerce',
    tags: ['ecommerce', 'products', 'faq', 'returns', 'shipping'],
    avatarUrl: 'https://images.unsplash.com/photo-1556742049-0a670f4a4591?w=150',
    chatbotConfig: {
      name: 'Store Assistant Template',
      description: 'E-Commerce catalog and FAQ bot',
      purpose: 'sales',
      status: 'draft',
      version: 1,
      responseMode: 'business_data_first',
      widgetConfig: {
        displayName: 'Store Concierge',
        avatarUrl: 'https://images.unsplash.com/photo-1556742049-0a670f4a4591?w=150',
        primaryColor: '#059669',
        accentColor: '#047857',
        backgroundColor: '#ffffff',
        textColor: '#0f172a',
        fontFamily: 'Inter, sans-serif',
        fontSize: 14,
        borderRadius: 12,
        position: 'bottom_right',
        headerTitle: 'Customer Concierge',
        welcomeMessage: 'Hi there! Looking for specific products or store policies?',
        conversationStarters: ['Check shipping time', 'What is your return policy?', 'Search products'],
        suggestedReplies: [],
        inputPlaceholder: 'Type a product or question...',
        showBranding: true,
        themeMode: 'light',
      },
      behaviorConfig: {
        systemInstructions: 'Answer using online store catalog JSON and policy docs.',
        persona: 'E-commerce Concierge',
        language: 'English',
        responseStyle: 'friendly',
        maxAnswerLength: 400,
        fallbackMessage: 'I could not find that item in stock. Let me connect you with support.',
        allowedTopics: [],
        prohibitedTopics: [],
        confidenceThreshold: 0.3,
        showSourceCitations: true,
        humanHandoffEnabled: true,
        humanHandoffTriggerKeywords: ['agent', 'human'],
      },
      modelConfig: {
        provider: 'mock',
        modelName: 'default-fast',
        temperature: 0.2,
        maxTokens: 500,
        allowGeneralKnowledgeFallback: false,
      },
      allowedDomains: ['*'],
    },
    sampleKnowledge: [
      { title: 'Standard Return Policy', content: '30-day money back guarantee.', category: 'Policy' },
      { title: 'Free Shipping Threshold', content: 'Free standard shipping on orders over $50.', category: 'Shipping' }
    ],
    price: 0,
    isPublic: true,
    installCount: 142,
    rating: 4.9,
    reviewCount: 28,
    createdAt: now,
  });

  console.log('✅ Hola.ai database seed completed successfully!');
}
