const { describe, it } = require('node:test');
const assert = require('node:assert');

describe('CloseCraft Free Pilot & Revenue Engine Integrity', () => {
  const parseAmount = (text) => {
    const mMatch = text.match(/(?:₦|NGN|\$|€|£)?\s*(\d+[\d,.]*)\s*(?:m|million)\b/i);
    if (mMatch) {
      const val = parseFloat(mMatch[1].replace(/,/g, ''));
      if (!isNaN(val)) return val * 1000000;
    }
    const kMatch = text.match(/(?:₦|NGN|\$|€|£)?\s*(\d+[\d,.]*)\s*(?:k|thousand)\b/i);
    if (kMatch) {
      const val = parseFloat(kMatch[1].replace(/,/g, ''));
      if (!isNaN(val)) return val * 1000;
    }
    const currencyMatch = text.match(/(?:₦|NGN|\$|€|£)\s*(\d+[\d,.]*)/i);
    if (currencyMatch) {
      const val = parseFloat(currencyMatch[1].replace(/,/g, ''));
      if (!isNaN(val)) return val;
    }
    const budgetKeywordMatch = text.match(/(?:budget|amount|worth|cost|spend|paying)(?:\s*(?:is|of|:|-)?\s*)(?:₦|NGN|\$)?\s*(\d+[\d,.]*)/i);
    if (budgetKeywordMatch) {
      const val = parseFloat(budgetKeywordMatch[1].replace(/,/g, ''));
      if (!isNaN(val)) return val;
    }
    return null;
  };

  it('should not inflate valuation for unspecified leads (Pending Discovery)', () => {
    const unspecifiedLeadText = "Hello, I am interested in your software for our 10-person team.";
    const leadAmount = parseAmount(unspecifiedLeadText);
    const estimatedValue = leadAmount ?? 0;

    assert.strictEqual(estimatedValue, 0, 'Unspecified budget leads must have 0 estimated value (Pending Discovery)');
  });

  it('should accurately extract explicit budget with currency or budget keyword', () => {
    const explicitWithSymbol = "Our budget for this quarter is ₦500,000 for sales automation.";
    const amount1 = parseAmount(explicitWithSymbol);
    assert.strictEqual(amount1, 500000, 'Currency symbol budget parsed correctly');

    const explicitWithK = "Looking for a solution under 250k";
    const amount2 = parseAmount(explicitWithK);
    assert.strictEqual(amount2, 250000, 'Suffix k parsed correctly');

    const explicitWithM = "Enterprise budget around 2.5m";
    const amount3 = parseAmount(explicitWithM);
    assert.strictEqual(amount3, 2500000, 'Suffix m parsed correctly');
  });

  it('should validate phone-only leads without dummy emails', () => {
    const validateLeadPayload = (payload) => {
      if (!payload.name || payload.name.trim().length === 0) {
        return { valid: false, error: 'Name is required' };
      }
      const hasPhone = Boolean(payload.phone && payload.phone.trim().length > 0);
      const hasEmail = Boolean(payload.email && payload.email.trim().length > 0);

      if (!hasPhone && !hasEmail) {
        return { valid: false, error: 'Either email or phone is required' };
      }
      return {
        valid: true,
        record: {
          name: payload.name.trim(),
          email: payload.email ? payload.email.trim() : "",
          phone: payload.phone ? payload.phone.trim() : null
        }
      };
    };

    const phoneOnly = validateLeadPayload({ name: "Tunde Bakare", phone: "+2348012345678" });
    assert.strictEqual(phoneOnly.valid, true);
    assert.strictEqual(phoneOnly.record.email, "");
    assert.strictEqual(phoneOnly.record.phone, "+2348012345678");

    const neither = validateLeadPayload({ name: "Anonymous" });
    assert.strictEqual(neither.valid, false);
  });

  it('should verify webhook authorization tokens', () => {
    const isWebhookAuthorized = (authHeader, webhookSecret) => {
      if (!webhookSecret || webhookSecret.trim().length === 0) {
        return false;
      }
      return authHeader === `Bearer ${webhookSecret}`;
    };

    const secret = "test-pilot-secret-key-123";
    assert.strictEqual(isWebhookAuthorized(`Bearer ${secret}`, secret), true);
    assert.strictEqual(isWebhookAuthorized(`Bearer wrong-token`, secret), false);
    assert.strictEqual(isWebhookAuthorized(null, secret), false);
    assert.strictEqual(isWebhookAuthorized(`Bearer ${secret}`, ""), false);
  });

  it('should format WhatsApp outreach links safely with country code', () => {
    const normalizeWhatsAppNumber = (rawPhone) => {
      if (!rawPhone || typeof rawPhone !== 'string') return null;
      let digits = rawPhone.replace(/[^0-9]/g, '');
      if (!digits) return null;
      if (digits.length === 11 && digits.startsWith('0')) {
        return '234' + digits.slice(1);
      }
      if (digits.length === 10 && /^[789]/.test(digits)) {
        return '234' + digits;
      }
      if (digits.startsWith('234') && digits.length === 13) {
        return digits;
      }
      if (digits.length >= 7 && digits.length <= 15) {
        return digits;
      }
      return null;
    };

    const buildWhatsAppUrl = (phone, openerText) => {
      const cleanPhone = normalizeWhatsAppNumber(phone);
      if (!cleanPhone) return null;
      return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(openerText)}`;
    };

    // 1. 11-digit local format with leading 0
    const rawPhone11 = "0803 123 4567";
    const opener = "Hello Emmanuel, following up from your inquiry!";
    const url1 = buildWhatsAppUrl(rawPhone11, opener);
    assert.ok(url1.startsWith("https://wa.me/2348031234567"));
    assert.ok(url1.includes("Hello%20Emmanuel"));

    // 2. 10-digit local format without leading 0 (as in user screenshot 8103262248)
    const rawPhone10 = "8103262248";
    const url2 = buildWhatsAppUrl(rawPhone10, opener);
    assert.ok(url2.startsWith("https://wa.me/2348103262248"));

    // 3. International prefix +234
    const rawPhone234 = "+234 810 326 2248";
    const url3 = buildWhatsAppUrl(rawPhone234, opener);
    assert.ok(url3.startsWith("https://wa.me/2348103262248"));
  });
});
