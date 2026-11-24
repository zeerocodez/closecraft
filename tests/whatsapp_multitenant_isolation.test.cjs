require('tsx/cjs');
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

test('Phase 2 & 4: WhatsApp Multi-Tenant Architecture & Delivery Isolation Acceptance Tests', async (t) => {
  const routePath = path.join(__dirname, '../src/app/api/webhooks/whatsapp/route.ts');
  const routeContent = fs.readFileSync(routePath, 'utf8');

  await t.test('1. Static Code Analysis: Strict Isolation & No Generic Fallback', () => {
    // Verify removal of any hardcoded workspace fallback
    assert.strictEqual(
      routeContent.includes("slug: 'zeerocodes'"),
      false,
      'Must NOT contain hardcoded zeerocodes fallback'
    );
    assert.strictEqual(
      routeContent.includes("findFirst({ where: { status: 'APPROVED' } })"),
      false,
      'Must NOT fall back to arbitrary first approved organization'
    );
    assert.ok(
      routeContent.includes('whatsappPhoneNumberId'),
      'Must resolve tenant by whatsappPhoneNumberId'
    );
    assert.ok(
      routeContent.includes('messages.quarantined'),
      'Must quarantine unmapped incoming WhatsApp messages'
    );
    assert.ok(
      routeContent.includes('x-hub-signature-256'),
      'Must verify HMAC-SHA256 signature from Meta'
    );
    assert.ok(
      routeContent.includes('optedOutOfMarketing'),
      'Must support opt-out keywords (STOP / UNSUBSCRIBE)'
    );
  });

  // Dynamic Integration Testing
  const timestamp = Date.now();
  let testOrgA;
  let testOrgB;
  const phoneNumberIdA = `phone_id_${timestamp}_a`;
  const phoneNumberIdB = `phone_id_${timestamp}_b`;
  const testSecret = 'test_meta_app_secret_12345';
  const verifyToken = 'test_verify_token_54321';

  process.env.WHATSAPP_APP_SECRET = testSecret;
  process.env.WHATSAPP_VERIFY_TOKEN = verifyToken;

  const { GET, POST } = require('../src/app/api/webhooks/whatsapp/route.ts');

  await t.test('2. Setup Test Organizations with Scoped Phone IDs', async () => {
    testOrgA = await db.organization.create({
      data: {
        name: `Tenant Alpha Corp ${timestamp}`,
        slug: `tenant-alpha-${timestamp}`,
        whatsappPhoneNumberId: phoneNumberIdA,
        whatsappNumber: `+234800000${timestamp.toString().slice(-4)}`,
        status: 'APPROVED',
      },
    });

    testOrgB = await db.organization.create({
      data: {
        name: `Tenant Beta LLC ${timestamp}`,
        slug: `tenant-beta-${timestamp}`,
        whatsappPhoneNumberId: phoneNumberIdB,
        whatsappNumber: `+234900000${timestamp.toString().slice(-4)}`,
        status: 'APPROVED',
      },
    });

    assert.ok(testOrgA.id);
    assert.ok(testOrgB.id);
  });

  await t.test('3. Verification Challenge Handling (GET)', async () => {
    // Valid challenge
    const validUrl = `https://closecraft.test/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=${verifyToken}&hub.challenge=CHALLENGE_ACCEPTED_99`;
    const res = await GET(new Request(validUrl, { method: 'GET' }));
    assert.strictEqual(res.status, 200);
    const body = await res.text();
    assert.strictEqual(body, 'CHALLENGE_ACCEPTED_99');

    // Invalid challenge token
    const invalidUrl = `https://closecraft.test/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=WRONG_TOKEN&hub.challenge=CHALLENGE_FAILED`;
    const invalidRes = await GET(new Request(invalidUrl, { method: 'GET' }));
    assert.strictEqual(invalidRes.status, 403);
  });

  await t.test('4. HMAC Signature Enforcement (POST)', async () => {
    const rawPayload = JSON.stringify({ object: 'whatsapp_business_account', entry: [] });

    // Missing signature
    const missingSigReq = new Request('https://closecraft.test/api/webhooks/whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: rawPayload,
    });
    const missingSigRes = await POST(missingSigReq);
    assert.strictEqual(missingSigRes.status, 401);

    // Invalid signature
    const invalidSigReq = new Request('https://closecraft.test/api/webhooks/whatsapp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hub-signature-256': 'sha256=invalidhexsignature00000000000000000000000000000000000000000000',
      },
      body: rawPayload,
    });
    const invalidSigRes = await POST(invalidSigReq);
    assert.strictEqual(invalidSigRes.status, 401);
  });

  function makeSignedRequest(payloadObj) {
    const rawBody = JSON.stringify(payloadObj);
    const signature = 'sha256=' + crypto.createHmac('sha256', testSecret).update(rawBody).digest('hex');
    return new Request('https://closecraft.test/api/webhooks/whatsapp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hub-signature-256': signature,
      },
      body: rawBody,
    });
  }

  const prospectPhone = `+23470${timestamp.toString().slice(-8)}`;
  const messageId1 = `wamid.HBgM${timestamp}A1`;

  await t.test('5. Multi-Tenant Ingestion: Resolves to Org A, strictly isolated from Org B', async () => {
    const waPayload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: 'WABA_123',
          changes: [
            {
              value: {
                messaging_product: 'whatsapp',
                metadata: {
                  display_phone_number: '234800000000',
                  phone_number_id: phoneNumberIdA, // Targeted to Org A
                },
                contacts: [{ profile: { name: 'Dr. Adeyemi Adeleke' }, wa_id: prospectPhone }],
                messages: [
                  {
                    from: prospectPhone,
                    id: messageId1,
                    timestamp: Math.floor(Date.now() / 1000).toString(),
                    type: 'text',
                    text: {
                      body: 'Hello, we want to deploy your revenue recovery system for our 15 consulting partners.',
                    },
                  },
                ],
              },
              field: 'messages',
            },
          ],
        },
      ],
    };

    const res = await POST(makeSignedRequest(waPayload));
    assert.strictEqual(res.status, 200);

    // Verify lead created strictly in Org A
    const leadInOrgA = await db.lead.findFirst({
      where: { organizationId: testOrgA.id, phone: prospectPhone },
      include: { conversations: { include: { messages: true } } },
    });
    assert.ok(leadInOrgA, 'Lead must exist in Org A');
    assert.strictEqual(leadInOrgA.name, 'Dr. Adeyemi Adeleke');

    // Verify conversation & message
    const conversation = leadInOrgA.conversations[0];
    assert.ok(conversation, 'Conversation must be created');
    assert.strictEqual(conversation.organizationId, testOrgA.id);

    const message = conversation.messages.find((m) => m.providerMessageId === messageId1);
    assert.ok(message, 'Message must be stored with providerMessageId');
    assert.strictEqual(message.status, 'DELIVERED');

    // Verify Org B received ZERO leads or conversations
    const leadsInOrgB = await db.lead.count({ where: { organizationId: testOrgB.id } });
    assert.strictEqual(leadsInOrgB, 0, 'Tenant isolation violation: Org B must have 0 leads');
    const convsInOrgB = await db.conversation.count({ where: { organizationId: testOrgB.id } });
    assert.strictEqual(convsInOrgB, 0, 'Tenant isolation violation: Org B must have 0 conversations');
  });

  await t.test('6. Idempotency Protection: Duplicate Message ID is skipped', async () => {
    const duplicatePayload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: 'WABA_123',
          changes: [
            {
              value: {
                messaging_product: 'whatsapp',
                metadata: {
                  display_phone_number: '234800000000',
                  phone_number_id: phoneNumberIdA,
                },
                contacts: [{ profile: { name: 'Dr. Adeyemi Adeleke' }, wa_id: prospectPhone }],
                messages: [
                  {
                    from: prospectPhone,
                    id: messageId1, // Same message ID
                    timestamp: Math.floor(Date.now() / 1000).toString(),
                    type: 'text',
                    text: {
                      body: 'DUPLICATE RETRY: Hello, we want to deploy your revenue recovery system.',
                    },
                  },
                ],
              },
              field: 'messages',
            },
          ],
        },
      ],
    };

    const res = await POST(makeSignedRequest(duplicatePayload));
    assert.strictEqual(res.status, 200);

    // Total messages in conversation must still be exactly 1
    const messagesCount = await db.message.count({
      where: { providerMessageId: messageId1 },
    });
    assert.strictEqual(messagesCount, 1, 'Duplicate message ID must not create second record');
  });

  await t.test('7. Quarantine Unmapped Phone Numbers: Never cross-contaminate', async () => {
    const unknownPhoneId = `unmapped_phone_${timestamp}`;
    const unmappedMsgId = `wamid.UNKNOWN_${timestamp}`;
    const unmappedPayload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: 'WABA_UNMAPPED',
          changes: [
            {
              value: {
                messaging_product: 'whatsapp',
                metadata: {
                  display_phone_number: '234999999999',
                  phone_number_id: unknownPhoneId, // Unmapped phone ID
                },
                contacts: [{ profile: { name: 'Unknown Stranger' }, wa_id: '+234000000000' }],
                messages: [
                  {
                    from: '+234000000000',
                    id: unmappedMsgId,
                    timestamp: Math.floor(Date.now() / 1000).toString(),
                    type: 'text',
                    text: { body: 'This message has no registered workspace!' },
                  },
                ],
              },
              field: 'messages',
            },
          ],
        },
      ],
    };

    const res = await POST(makeSignedRequest(unmappedPayload));
    assert.strictEqual(res.status, 200); // Meta expects 200 acknowledged

    // Verify unmapped message is quarantined in WebhookEvent
    const quarantinedEvent = await db.webhookEvent.findUnique({
      where: { eventId: unmappedMsgId },
    });
    assert.ok(quarantinedEvent, 'Quarantined event must be recorded in WebhookEvent');
    assert.strictEqual(quarantinedEvent.eventType, 'messages.quarantined');
    assert.strictEqual(quarantinedEvent.status, 'IGNORED');

    // Confirm neither Org A nor Org B received the unknown message
    const leakLead = await db.lead.findFirst({
      where: { phone: '+234000000000' },
    });
    assert.strictEqual(leakLead, null, 'Unmapped lead must NEVER be created in any workspace');
  });

  await t.test('8. Opt-Out Compliance: STOP Keyword Sets optedOutOfMarketing', async () => {
    const optOutMsgId = `wamid.OPTOUT_${timestamp}`;
    const optOutPayload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: 'WABA_123',
          changes: [
            {
              value: {
                messaging_product: 'whatsapp',
                metadata: {
                  display_phone_number: '234800000000',
                  phone_number_id: phoneNumberIdA,
                },
                contacts: [{ profile: { name: 'Dr. Adeyemi Adeleke' }, wa_id: prospectPhone }],
                messages: [
                  {
                    from: prospectPhone,
                    id: optOutMsgId,
                    timestamp: Math.floor(Date.now() / 1000).toString(),
                    type: 'text',
                    text: { body: 'STOP' },
                  },
                ],
              },
              field: 'messages',
            },
          ],
        },
      ],
    };

    const res = await POST(makeSignedRequest(optOutPayload));
    assert.strictEqual(res.status, 200);

    const lead = await db.lead.findFirst({
      where: { organizationId: testOrgA.id, phone: prospectPhone },
    });
    assert.ok(lead);
    assert.strictEqual(lead.optedOutOfMarketing, true, 'Lead must have optedOutOfMarketing = true');
    assert.ok(lead.optedOutAt, 'Lead must have optedOutAt timestamp');
  });

  await t.test('9. Cleanup Test Records', async () => {
    // Delete messages, conversations, leads, webhookEvents, and orgs
    await db.message.deleteMany({
      where: { providerMessageId: { in: [messageId1, `wamid.OPTOUT_${timestamp}`] } },
    });
    await db.conversation.deleteMany({
      where: { organizationId: { in: [testOrgA.id, testOrgB.id] } },
    });
    await db.lead.deleteMany({
      where: { organizationId: { in: [testOrgA.id, testOrgB.id] } },
    });
    await db.webhookEvent.deleteMany({
      where: {
        eventId: {
          in: [messageId1, `wamid.UNKNOWN_${timestamp}`, `wamid.OPTOUT_${timestamp}`],
        },
      },
    });
    await db.organization.deleteMany({
      where: { id: { in: [testOrgA.id, testOrgB.id] } },
    });
    await db.$disconnect();
  });
});
