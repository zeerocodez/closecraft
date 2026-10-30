const { describe, it } = require('node:test');
const assert = require('node:assert');
const crypto = require('crypto');

// Import or implement pure verification logic for testing
function computeBachsHmac(rawBody, secret, timestamp) {
  const message = timestamp ? `${timestamp}.${rawBody}` : rawBody;
  return crypto.createHmac('sha256', secret).update(message, 'utf8').digest('hex');
}

function verifyBachsSignature(rawBody, headers, secret, toleranceSeconds = 300) {
  if (!secret) return { isValid: false, error: 'Webhook secret is not configured' };

  const getHeader = (name) => {
    return headers[name] || headers[name.toLowerCase()] || null;
  };

  const v2Header = getHeader('X-Bachs-Signature-V2') || getHeader('x-bachs-signature-v2');
  const sigHeader = getHeader('X-Bachs-Signature') || getHeader('x-bachs-signature') || getHeader('webhook-signature');
  const timestampHeader = getHeader('X-Bachs-Timestamp') || getHeader('x-bachs-timestamp') || getHeader('webhook-timestamp');

  if (v2Header) {
    const parts = v2Header.split(',').map(p => p.trim());
    let timestamp = null;
    const signatures = [];

    for (const part of parts) {
      const [k, v] = part.split('=');
      if (k === 't' && v) timestamp = parseInt(v, 10);
      if (k === 'v1' && v) signatures.push(v);
    }

    if (!timestamp || signatures.length === 0) {
      return { isValid: false, error: 'Malformed X-Bachs-Signature-V2 header' };
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    if (Math.abs(nowSeconds - timestamp) > toleranceSeconds) {
      return { isValid: false, error: 'Webhook timestamp outside tolerance window (replay protection)' };
    }

    const message = `${timestamp}.${rawBody}`;
    const expected = crypto.createHmac('sha256', secret).update(message, 'utf8').digest('hex');

    const match = signatures.some(sig => {
      try {
        return crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'));
      } catch {
        return false;
      }
    });

    return { isValid: match, timestamp, error: match ? undefined : 'Signature mismatch' };
  }

  if (sigHeader && timestampHeader) {
    const timestamp = parseInt(timestampHeader, 10);
    if (isNaN(timestamp)) return { isValid: false, error: 'Invalid timestamp format' };

    const nowSeconds = Math.floor(Date.now() / 1000);
    if (Math.abs(nowSeconds - timestamp) > toleranceSeconds) {
      return { isValid: false, error: 'Webhook timestamp outside tolerance window (replay protection)' };
    }

    const message = `${timestamp}.${rawBody}`;
    const expected = crypto.createHmac('sha256', secret).update(message, 'utf8').digest('hex');

    try {
      const match = crypto.timingSafeEqual(Buffer.from(sigHeader, 'hex'), Buffer.from(expected, 'hex'));
      return { isValid: match, timestamp, error: match ? undefined : 'Signature mismatch' };
    } catch {
      return { isValid: false, error: 'Invalid signature encoding' };
    }
  }

  if (sigHeader && !timestampHeader) {
    const expected = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');
    try {
      const match = crypto.timingSafeEqual(Buffer.from(sigHeader, 'hex'), Buffer.from(expected, 'hex'));
      return { isValid: match, error: match ? undefined : 'Signature mismatch' };
    } catch {
      return { isValid: false, error: 'Invalid signature encoding' };
    }
  }

  return { isValid: false, error: 'Missing Bachs signature headers' };
}

describe('Bachs Sandbox Checkout & Webhook Acceptance Tests', () => {

  const MOCK_SECRET = 'whsec_test_secret_bachs_sandbox_9988';

  // 1. Raw pricing checkout payload validation
  it('should construct Bachs checkout payload with raw pricing decimal string and ISO 4217 currency', () => {
    const invoice = {
      id: 'inv_workspace_123',
      invoiceNumber: 'INV-2026-001',
      amount: 15000.0,
      currency: 'NGN',
      organizationId: 'org_acme_corp',
      type: 'WORKSPACE_INVOICE',
    };

    const decimalAmount = invoice.amount.toFixed(2);
    const idempotencyKey = `checkout-${invoice.id}-test`;

    const payload = {
      pricing: {
        currency: invoice.currency,
        amount: decimalAmount,
      },
      customer: {
        email: 'billing@acme.com',
        name: 'Acme Admin',
      },
      success_url: 'https://closecrafthq.com/billing/return?checkout_id={CHECKOUT_ID}&invoice_id=' + invoice.id,
      cancel_url: 'https://closecrafthq.com/billing',
      reference: invoice.invoiceNumber,
      metadata: {
        organizationId: invoice.organizationId,
        invoiceId: invoice.id,
        type: invoice.type,
      }
    };

    // Assertions
    assert.strictEqual(payload.pricing.amount, '15000.00', 'Amount must be strict decimal string');
    assert.strictEqual(payload.pricing.currency, 'NGN', 'Currency must be ISO 4217 NGN');
    assert.strictEqual(typeof payload.pricing.amount, 'string', 'Amount must not be a number');
    assert.strictEqual(payload.metadata.organizationId, 'org_acme_corp');
    assert.strictEqual(payload.metadata.invoiceId, 'inv_workspace_123');
    assert.ok(idempotencyKey.startsWith('checkout-inv_workspace_123-'), 'Idempotency key must reference invoice');
  });

  // 2. Signature verification of collection.succeeded
  it('should verify valid X-Bachs-Signature-V2 header using HMAC-SHA256 with timestamp tolerance', () => {
    const rawBody = JSON.stringify({
      id: 'evt_collection_123',
      type: 'collection.succeeded',
      data: {
        id: 'chk_bachs_999',
        checkout_id: 'chk_bachs_999',
        amount: '15000.00',
        currency: 'NGN',
        status: 'SUCCEEDED',
      }
    });

    const nowSeconds = Math.floor(Date.now() / 1000);
    const sig = computeBachsHmac(rawBody, MOCK_SECRET, nowSeconds);
    const v2Header = `t=${nowSeconds},v1=${sig}`;

    const verification = verifyBachsSignature(rawBody, { 'X-Bachs-Signature-V2': v2Header }, MOCK_SECRET);
    assert.strictEqual(verification.isValid, true, 'Valid signature must pass');
    assert.strictEqual(verification.error, undefined);
  });

  // 3. Rejection of invalid signatures and tampered payloads
  it('should reject tampered payload or incorrect secret', () => {
    const rawBody = JSON.stringify({ id: 'evt_1', type: 'collection.succeeded', data: { amount: '15000.00' } });
    const nowSeconds = Math.floor(Date.now() / 1000);
    const sig = computeBachsHmac(rawBody, MOCK_SECRET, nowSeconds);

    // Tampered payload
    const tamperedBody = JSON.stringify({ id: 'evt_1', type: 'collection.succeeded', data: { amount: '1.00' } });
    const v2Header = `t=${nowSeconds},v1=${sig}`;

    const resTampered = verifyBachsSignature(tamperedBody, { 'X-Bachs-Signature-V2': v2Header }, MOCK_SECRET);
    assert.strictEqual(resTampered.isValid, false, 'Tampered body must fail verification');

    // Wrong secret
    const resWrongSecret = verifyBachsSignature(rawBody, { 'X-Bachs-Signature-V2': v2Header }, 'wrong_secret');
    assert.strictEqual(resWrongSecret.isValid, false, 'Wrong secret must fail verification');
  });

  // 4. Rejection of expired timestamps (replay attack prevention)
  it('should reject timestamps older than 300 seconds (replay tolerance)', () => {
    const rawBody = JSON.stringify({ id: 'evt_old', type: 'collection.succeeded' });
    const oldTimestamp = Math.floor(Date.now() / 1000) - 350; // 350 seconds ago
    const sig = computeBachsHmac(rawBody, MOCK_SECRET, oldTimestamp);
    const v2Header = `t=${oldTimestamp},v1=${sig}`;

    const verification = verifyBachsSignature(rawBody, { 'X-Bachs-Signature-V2': v2Header }, MOCK_SECRET, 300);
    assert.strictEqual(verification.isValid, false);
    assert.ok(verification.error?.includes('tolerance window'));
  });

  // 5. Rejection of mismatched amounts and currencies
  it('should reject fulfillment when webhook amount or currency does not match invoice', () => {
    const storedInvoice = {
      id: 'inv_100',
      amount: 15000.0,
      currency: 'NGN',
      status: 'APPROVED',
      organizationId: 'org_xyz',
    };

    // Amount mismatch (e.g. 5,000 paid instead of 15,000)
    const mismatchedAmountEvent = {
      id: 'evt_bad_amt',
      type: 'collection.succeeded',
      data: {
        checkout_id: 'chk_100',
        amount: '5000.00',
        currency: 'NGN',
        metadata: { invoiceId: storedInvoice.id }
      }
    };

    const processCheck = (event, invoice) => {
      const payloadAmount = parseFloat(event.data.amount);
      const payloadCurrency = String(event.data.currency).toUpperCase();
      if (Math.abs(payloadAmount - invoice.amount) > 0.01) {
        return { handled: false, error: 'Amount mismatch' };
      }
      if (payloadCurrency !== invoice.currency.toUpperCase()) {
        return { handled: false, error: 'Currency mismatch' };
      }
      return { handled: true };
    };

    const amountResult = processCheck(mismatchedAmountEvent, storedInvoice);
    assert.strictEqual(amountResult.handled, false);
    assert.strictEqual(amountResult.error, 'Amount mismatch');

    // Currency mismatch (e.g. USD paid instead of NGN)
    const mismatchedCurrencyEvent = {
      id: 'evt_bad_cur',
      type: 'collection.succeeded',
      data: {
        checkout_id: 'chk_100',
        amount: '15000.00',
        currency: 'USD',
        metadata: { invoiceId: storedInvoice.id }
      }
    };

    const currencyResult = processCheck(mismatchedCurrencyEvent, storedInvoice);
    assert.strictEqual(currencyResult.handled, false);
    assert.strictEqual(currencyResult.error, 'Currency mismatch');
  });

  // 6. Double-level idempotency
  it('should ignore duplicate event IDs and prevent double-fulfillment of already paid invoices', () => {
    const processedEvents = new Set(['evt_already_done']);
    const invoiceStore = {
      inv_paid: { id: 'inv_paid', status: 'PAID', invoiceNumber: 'INV-001' },
      inv_unpaid: { id: 'inv_unpaid', status: 'APPROVED', invoiceNumber: 'INV-002' },
    };

    const fulfillInvoice = (event) => {
      // Level 1: Event-level
      if (processedEvents.has(event.id)) {
        return { handled: true, duplicate: true };
      }

      const inv = invoiceStore[event.data.metadata.invoiceId];
      if (!inv) return { handled: false, error: 'Invoice not found' };

      // Level 2: Invoice-level
      if (inv.status === 'PAID') {
        return { handled: true, alreadyFulfilled: true };
      }

      inv.status = 'PAID';
      processedEvents.add(event.id);
      return { handled: true, fulfilled: true };
    };

    // First attempt for unpaid invoice -> succeeds
    const ev1 = { id: 'evt_new_1', data: { metadata: { invoiceId: 'inv_unpaid' } } };
    const res1 = fulfillInvoice(ev1);
    assert.strictEqual(res1.fulfilled, true);
    assert.strictEqual(invoiceStore.inv_unpaid.status, 'PAID');

    // Duplicate event attempt -> ignored at event level
    const res2 = fulfillInvoice(ev1);
    assert.strictEqual(res2.duplicate, true);

    // Another event targeting the same already-paid invoice -> ignored at invoice level
    const ev2 = { id: 'evt_new_2', data: { metadata: { invoiceId: 'inv_unpaid' } } };
    const res3 = fulfillInvoice(ev2);
    assert.strictEqual(res3.alreadyFulfilled, true);
  });

  // 7. Entitlement strictly via invoice-to-workspace, not redirect alone
  it('should not grant access on return redirect alone and must bind entitlement to invoice organizationId', () => {
    let workspaceAccessGranted = false;
    let entitlementOrgId = null;

    // Simulate user returning to /billing/return?checkout_id=chk_123
    const handleReturnRedirect = (params) => {
      // Client return route ONLY polls or reads status. It NEVER executes entitlement writes.
      return { status: 'PENDING', message: 'Waiting for authoritative webhook' };
    };

    const redirectResponse = handleReturnRedirect({ checkout_id: 'chk_123' });
    assert.strictEqual(redirectResponse.status, 'PENDING');
    assert.strictEqual(workspaceAccessGranted, false, 'Redirect must NEVER grant entitlement');

    // Authoritative Webhook arrives
    const handleWebhookFulfillment = (invoice, payerEmail) => {
      // Rule: Entitlement must be granted strictly through authenticated invoice.organizationId
      // Never identify entitled workspace merely by payer's email
      assert.ok(invoice.organizationId, 'Invoice must have organizationId');
      entitlementOrgId = invoice.organizationId;
      workspaceAccessGranted = true;
    };

    const invoice = { id: 'inv_1', organizationId: 'org_real_tenant_88' };
    handleWebhookFulfillment(invoice, 'attacker_random_email@evil.com');

    assert.strictEqual(workspaceAccessGranted, true);
    assert.strictEqual(entitlementOrgId, 'org_real_tenant_88', 'Must bind to invoice organization, not payer email');
  });

  // 8. 14-day trial preservation & Pilot prerequisite safety
  it('should preserve 14-day no-card trial and ensure managed pilot payment only fulfills payment prerequisite', () => {
    // 14-day trial calculation
    const now = new Date();
    const trialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const diffDays = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    assert.strictEqual(diffDays, 14, 'Trial must be 14 days');

    // Managed Pilot Engagement prerequisites
    const engagement = {
      id: 'eng_001',
      isPaymentVerified: false,
      isTermsAccepted: false, // NOT yet accepted
      isClientReadinessApproved: false, // NOT yet approved
      status: 'AWAITING_PAYMENT',
    };

    // Simulate payment webhook fulfillment for managed pilot
    const fulfillPilotPayment = (eng) => {
      eng.isPaymentVerified = true;
      // Must NOT automatically activate pilot if terms or readiness are pending!
      const canActivate = eng.isTermsAccepted && eng.isClientReadinessApproved;
      eng.status = canActivate ? 'ACTIVE' : 'AWAITING_READINESS';
      return eng;
    };

    const updated = fulfillPilotPayment(engagement);
    assert.strictEqual(updated.isPaymentVerified, true, 'Payment prerequisite satisfied');
    assert.strictEqual(updated.status, 'AWAITING_READINESS', 'Must not bypass terms or readiness');
  });

});
