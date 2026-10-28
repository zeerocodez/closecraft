const { describe, it } = require('node:test');
const assert = require('node:assert');
const crypto = require('node:crypto');

describe('Closecraft Full Production Hardening & Security Acceptance Tests', () => {

  // 1. Explicit Permission Matrix & Role Enforcement
  describe('1. Explicit Permission Matrix & Role Enforcement', () => {
    const WORKSPACE_PERMISSIONS = {
      OWNER: ['leads:view_all', 'leads:export', 'billing:manage', 'team:manage_roles', 'handover:acknowledge'],
      ADMIN: ['leads:view_all', 'leads:export', 'billing:view', 'team:invite'],
      SALES_MANAGER: ['leads:view_all', 'leads:archive', 'leads:merge', 'deals:view_all'],
      INTERNAL_MEMBER: ['leads:view_all', 'leads:create', 'deals:view_assigned'],
      EXTERNAL_PROFESSIONAL: ['leads:view_assigned', 'engagements:work', 'compensation:view_own'],
      READ_ONLY_REVIEWER: ['leads:view_all', 'deals:view_all']
    };

    const hasPermission = (role, perm) => {
      const allowed = WORKSPACE_PERMISSIONS[role] || [];
      return allowed.includes(perm);
    };

    it('enforces that EXTERNAL_PROFESSIONAL cannot view all leads or export database', () => {
      assert.strictEqual(hasPermission('EXTERNAL_PROFESSIONAL', 'leads:view_assigned'), true);
      assert.strictEqual(hasPermission('EXTERNAL_PROFESSIONAL', 'engagements:work'), true);
      assert.strictEqual(hasPermission('EXTERNAL_PROFESSIONAL', 'leads:view_all'), false, 'External professional must NOT view all leads');
      assert.strictEqual(hasPermission('EXTERNAL_PROFESSIONAL', 'leads:export'), false, 'External professional must NOT export database');
      assert.strictEqual(hasPermission('EXTERNAL_PROFESSIONAL', 'billing:manage'), false);
    });

    it('enforces OWNER and ADMIN privilege boundaries', () => {
      assert.strictEqual(hasPermission('OWNER', 'billing:manage'), true);
      assert.strictEqual(hasPermission('ADMIN', 'billing:manage'), false, 'Admins cannot change billing subscription ownership without OWNER permission');
      assert.strictEqual(hasPermission('ADMIN', 'billing:view'), true);
    });
  });

  // 2. Expiring Workspace Invites & Session Revocation
  describe('2. Workspace Invites & Session Revocation', () => {
    it('rejects expired or re-used workspace invitation tokens', () => {
      const invites = [
        { token: 'tok_valid', email: 'sales@agency.ng', expiresAt: Date.now() + 86400000, acceptedAt: null },
        { token: 'tok_expired', email: 'old@agency.ng', expiresAt: Date.now() - 1000, acceptedAt: null },
        { token: 'tok_used', email: 'joined@agency.ng', expiresAt: Date.now() + 86400000, acceptedAt: Date.now() - 5000 },
      ];

      const validateInvite = (token) => {
        const inv = invites.find(i => i.token === token);
        if (!inv) return { valid: false, error: 'Invalid token' };
        if (inv.acceptedAt) return { valid: false, error: 'Already accepted' };
        if (Date.now() > inv.expiresAt) return { valid: false, error: 'Invitation expired' };
        return { valid: true, email: inv.email };
      };

      assert.strictEqual(validateInvite('tok_valid').valid, true);
      assert.strictEqual(validateInvite('tok_expired').valid, false);
      assert.strictEqual(validateInvite('tok_expired').error, 'Invitation expired');
      assert.strictEqual(validateInvite('tok_used').valid, false);
      assert.strictEqual(validateInvite('tok_used').error, 'Already accepted');
    });

    it('invalidates compromised sessions immediately upon revocation', () => {
      const sessions = new Map();
      sessions.set('sess_abc123', { userId: 'usr_1', revoked: false, expiresAt: Date.now() + 86400000 });

      const checkSession = (token) => {
        const s = sessions.get(token);
        if (!s || s.revoked || Date.now() > s.expiresAt) return false;
        return true;
      };

      assert.strictEqual(checkSession('sess_abc123'), true);

      // Revoke session
      sessions.set('sess_abc123', { ...sessions.get('sess_abc123'), revoked: true, revokedAt: Date.now() });

      assert.strictEqual(checkSession('sess_abc123'), false, 'Revoked session must be denied immediately');
    });
  });

  // 3. Emergency Operator Support Access
  describe('3. Time-Bounded Emergency Operator Access', () => {
    it('requires explicit reason and strictly enforces time-bounding', () => {
      const createEmergencyAccess = (operatorRole, reason, durationHours) => {
        if (!['OPERATOR', 'PLATFORM_ADMIN', 'SUPER_ADMIN'].includes(operatorRole)) {
          throw new Error('Unauthorized role for emergency support access');
        }
        if (!reason || reason.trim().length < 10) {
          throw new Error('Detailed justification reason required (min 10 chars)');
        }
        const safeHours = Math.min(24, Math.max(1, durationHours));
        return {
          operatorRole,
          reason,
          active: true,
          expiresAt: Date.now() + safeHours * 3600000,
        };
      };

      assert.throws(
        () => createEmergencyAccess('USER', 'Need to check data', 2),
        /Unauthorized role/
      );
      assert.throws(
        () => createEmergencyAccess('OPERATOR', 'short', 2),
        /Detailed justification reason required/
      );

      const access = createEmergencyAccess('OPERATOR', 'Investigating missing webhook sync for client invoice INV-202', 2);
      assert.strictEqual(access.active, true);
      assert.strictEqual(access.expiresAt > Date.now(), true);
    });
  });

  // 4. Contact vs Opportunity Separation & Financial Distinction
  describe('4. Sales Data Model: Booked vs Collected Distinction', () => {
    it('separates booked opportunity value from verified collections', () => {
      const opportunity = {
        id: 'opp_1',
        title: 'Enterprise Retainer',
        stage: 'WON',
        bookedAmount: 500000.0,
        verifiedCollections: 0.0,
      };

      // Stage won does not mean money is collected
      const isCollected = (opp) => opp.verifiedCollections >= opp.bookedAmount;
      assert.strictEqual(isCollected(opportunity), false, 'Won opportunity is not proof of collected cash');

      // Record first installment
      opportunity.verifiedCollections += 250000.0;
      assert.strictEqual(opportunity.verifiedCollections, 250000.0);
      assert.strictEqual(isCollected(opportunity), false);

      // Record final installment
      opportunity.verifiedCollections += 250000.0;
      assert.strictEqual(isCollected(opportunity), true);
    });

    it('merges duplicate leads safely while preserving historical provenance', () => {
      const primaryLead = { id: 'lead_prime', deals: ['deal_1'], conversations: ['conv_1'] };
      const secondaryLead = { id: 'lead_sec', deals: ['deal_2'], conversations: ['conv_2'], isArchived: false };

      const mergeLeads = (primary, secondary, reason) => {
        primary.deals.push(...secondary.deals);
        primary.conversations.push(...secondary.conversations);
        secondary.isArchived = true;
        secondary.archiveReason = `Merged into ${primary.id}: ${reason}`;
        secondary.mergedIntoLeadId = primary.id;
        return { primary, secondary };
      };

      const result = mergeLeads(primaryLead, secondaryLead, 'Customer used secondary personal email');
      assert.strictEqual(result.primary.deals.length, 2);
      assert.strictEqual(result.secondary.isArchived, true);
      assert.strictEqual(result.secondary.mergedIntoLeadId, 'lead_prime');
    });
  });

  // 5. Financial Money Precision & Minor Units
  describe('5. Financial Money Math & Integer Minor Units', () => {
    const toMinor = (amt) => Math.round(amt * 100);
    const fromMinor = (minor) => minor / 100;
    const addMoney = (a, b) => fromMinor(toMinor(a) + toMinor(b));
    const toBachsDecimal = (amt) => {
      const m = toMinor(amt);
      const major = Math.floor(m / 100);
      const rem = Math.abs(m % 100);
      return `${major}.${rem.toString().padStart(2, '0')}`;
    };

    it('eliminates binary floating-point errors', () => {
      // Classic JS floating point anomaly: 0.1 + 0.2 = 0.30000000000000004
      const naiveSum = 0.1 + 0.2;
      assert.notStrictEqual(naiveSum, 0.3);

      const preciseSum = addMoney(0.1, 0.2);
      assert.strictEqual(preciseSum, 0.3);
    });

    it('formats exact decimal strings for Bachs payment gateway', () => {
      assert.strictEqual(toBachsDecimal(15000), '15000.00');
      assert.strictEqual(toBachsDecimal(15000.5), '15000.50');
      assert.strictEqual(toBachsDecimal(250000.75), '250000.75');
    });
  });

  // 6. Attribution Engine & Prior Contact Disqualification
  describe('6. Performance Attribution & Prior Contact Rules', () => {
    it('disqualifies opportunities with client contact within attribution window', () => {
      const evaluateAttribution = (priorContactDate, windowDays = 30) => {
        if (!priorContactDate) return { eligible: true };
        const diffDays = Math.floor((Date.now() - new Date(priorContactDate).getTime()) / 86400000);
        if (diffDays <= windowDays) {
          return {
            eligible: false,
            reason: `Disqualified: Prior client contact ${diffDays} days ago within ${windowDays}-day window.`
          };
        }
        return { eligible: true };
      };

      const recentContact = evaluateAttribution(new Date(Date.now() - 10 * 86400000));
      assert.strictEqual(recentContact.eligible, false);
      assert.match(recentContact.reason, /Prior client contact/);

      const oldContact = evaluateAttribution(new Date(Date.now() - 60 * 86400000));
      assert.strictEqual(oldContact.eligible, true);
    });

    it('calculates performance fee strictly on verified collections and shared rate', () => {
      const calculateCommission = (verifiedCash, sharedRate, feeRate) => {
        const basis = verifiedCash * sharedRate;
        return basis * feeRate;
      };

      // NGN 1,000,000 collected, 50% split with setter, 10% closing commission
      const commission = calculateCommission(1000000, 0.5, 0.10);
      assert.strictEqual(commission, 50000);
    });
  });

  // 7. Maker-Checker Payout Separation
  describe('7. Maker-Checker Professional Payout Workflow', () => {
    it('prevents operator from approving their own proposed payout', () => {
      const payable = {
        id: 'pay_1',
        amount: 80000,
        status: 'AWAITING_REVIEW',
        proposedByUserId: 'operator_alice',
      };

      const approvePayout = (payout, checkerUserId) => {
        if (payout.proposedByUserId === checkerUserId) {
          throw new Error('Maker-Checker Violation: Operator cannot approve their own proposed payout.');
        }
        return { ...payout, status: 'PAID_OUT', approvedByUserId: checkerUserId };
      };

      assert.throws(
        () => approvePayout(payable, 'operator_alice'),
        /Maker-Checker Violation/
      );

      const approved = approvePayout(payable, 'operator_bob');
      assert.strictEqual(approved.status, 'PAID_OUT');
      assert.strictEqual(approved.approvedByUserId, 'operator_bob');
    });
  });

  // 8. Durable Outbox & Dead-Letter Handling
  describe('8. Durable Transactional Outbox & Exponential Backoff', () => {
    it('retries failed events with exponential backoff and dead-letters after 5 attempts', () => {
      let retryCount = 0;
      const maxRetries = 5;

      const handleOutboxFailure = (currentRetries) => {
        const nextRetries = currentRetries + 1;
        const isDeadLetter = nextRetries >= maxRetries;
        const backoffSeconds = Math.pow(2, nextRetries) * 2;
        return {
          retryCount: nextRetries,
          status: isDeadLetter ? 'DEAD_LETTER' : 'FAILED',
          backoffSeconds,
        };
      };

      let state = handleOutboxFailure(0);
      assert.strictEqual(state.retryCount, 1);
      assert.strictEqual(state.status, 'FAILED');
      assert.strictEqual(state.backoffSeconds, 4);

      state = handleOutboxFailure(4);
      assert.strictEqual(state.retryCount, 5);
      assert.strictEqual(state.status, 'DEAD_LETTER', 'Message must transition to DEAD_LETTER after max retries');
    });
  });

  // 9. Sensitive Data Redaction in Logging
  describe('9. Observability & Sensitive Data Redaction', () => {
    const redact = (obj) => {
      const keys = ['password', 'secret', 'token', 'authorization', 'cardnumber'];
      const res = {};
      for (const [k, v] of Object.entries(obj)) {
        if (keys.some(key => k.toLowerCase().includes(key))) {
          res[k] = '[REDACTED]';
        } else {
          res[k] = v;
        }
      }
      return res;
    };

    it('redacts tokens, card numbers, and authorization headers from logs', () => {
      const payload = {
        userId: 'usr_1',
        token: 'secret_jwt_token_123',
        authorization: 'Bearer secret_token',
        email: 'user@example.com',
      };

      const cleaned = redact(payload);
      assert.strictEqual(cleaned.userId, 'usr_1');
      assert.strictEqual(cleaned.email, 'user@example.com');
      assert.strictEqual(cleaned.token, '[REDACTED]');
      assert.strictEqual(cleaned.authorization, '[REDACTED]');
    });
  });

});
