const { describe, it } = require('node:test');
const assert = require('node:assert');
const crypto = require('node:crypto');

describe('Closecraft Follow-up Pilot & Managed Operations Acceptance Tests', () => {

  // 1. Fast enquiry capture & validation
  describe('1. Fast Enquiry Capture & Validation', () => {
    const validateEnquiry = (payload) => {
      if (!payload.name || payload.name.trim().length === 0) {
        return { valid: false, error: 'Contact or business name is required' };
      }
      const hasEmail = Boolean(payload.email && payload.email.trim().length > 0);
      const hasPhone = Boolean(payload.phone && payload.phone.trim().length > 0);

      if (!hasEmail && !hasPhone) {
        return { valid: false, error: 'At least one contact method (email or phone) is required' };
      }

      if (hasEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(payload.email.trim())) {
          return { valid: false, error: 'Invalid email syntax (does not claim mailbox deliverability)' };
        }
      }

      let formattedPhone = null;
      if (hasPhone) {
        let clean = payload.phone.replace(/[^0-9+]/g, '');
        if (clean.startsWith('0') && clean.length === 11) {
          clean = '+234' + clean.slice(1);
        } else if (!clean.startsWith('+')) {
          clean = '+' + clean;
        }
        formattedPhone = clean;
      }

      return {
        valid: true,
        data: {
          name: payload.name.trim(),
          email: hasEmail ? payload.email.trim().toLowerCase() : null,
          phone: formattedPhone,
          estimatedValue: payload.estimatedValue ? Number(payload.estimatedValue) : null,
          currency: payload.currency || 'NGN',
        }
      };
    };

    it('validates contact name and at least one contact method', () => {
      assert.strictEqual(validateEnquiry({ name: '' }).valid, false);
      assert.strictEqual(validateEnquiry({ name: 'Adeola Services' }).valid, false);
      
      const phoneOnly = validateEnquiry({ name: 'Adeola Services', phone: '08031234567' });
      assert.strictEqual(phoneOnly.valid, true);
      assert.strictEqual(phoneOnly.data.phone, '+2348031234567');
      assert.strictEqual(phoneOnly.data.email, null);

      const emailOnly = validateEnquiry({ name: 'Chidi Corp', email: 'chidi@example.com' });
      assert.strictEqual(emailOnly.valid, true);
      assert.strictEqual(emailOnly.data.email, 'chidi@example.com');
      assert.strictEqual(emailOnly.data.phone, null);
    });

    it('rejects malformed email syntax without claiming deliverability', () => {
      const invalid = validateEnquiry({ name: 'Test', email: 'not-an-email' });
      assert.strictEqual(invalid.valid, false);
      assert.match(invalid.error, /Invalid email syntax/);
    });

    it('detects likely duplicate in workspace without silent merge', () => {
      const existingLeads = [
        { id: 'lead_1', email: 'tunde@agency.ng', phone: '+2348021112222', name: 'Tunde' },
        { id: 'lead_2', email: 'ngozi@design.ng', phone: '+2348033334444', name: 'Ngozi' },
      ];

      const checkDuplicate = (email, phone) => {
        const match = existingLeads.find(l => 
          (email && l.email && l.email.toLowerCase() === email.toLowerCase()) ||
          (phone && l.phone && l.phone === phone)
        );
        if (match) {
          return { isDuplicate: true, matchedLeadId: match.id, warning: `Likely duplicate of ${match.name}` };
        }
        return { isDuplicate: false };
      };

      const dupEmail = checkDuplicate('tunde@agency.ng', null);
      assert.strictEqual(dupEmail.isDuplicate, true);
      assert.strictEqual(dupEmail.matchedLeadId, 'lead_1');

      const dupPhone = checkDuplicate(null, '+2348033334444');
      assert.strictEqual(dupPhone.isDuplicate, true);
      assert.strictEqual(dupPhone.matchedLeadId, 'lead_2');

      const unique = checkDuplicate('new@client.ng', '+2348099998888');
      assert.strictEqual(unique.isDuplicate, false);
    });
  });

  // 2. Next actions, Today view & reminder invalidation
  describe('2. Next Actions & Reminder Invalidation', () => {
    it('invalidates obsolete reminder tasks upon rescheduling', () => {
      let reminders = [
        { id: 'rem_1', leadId: 'lead_1', dueAt: '2026-10-28T10:00:00Z', status: 'PENDING' },
        { id: 'rem_2', leadId: 'lead_2', dueAt: '2026-10-28T14:00:00Z', status: 'PENDING' }
      ];

      const rescheduleLeadFollowUp = (leadId, newDueAt) => {
        // Obsolete pending reminders for this lead are cancelled immediately
        reminders = reminders.map(r => 
          r.leadId === leadId && r.status === 'PENDING'
            ? { ...r, status: 'CANCELLED_OBSOLETE' }
            : r
        );
        // Create new reminder
        const newRem = { id: `rem_${Date.now()}`, leadId, dueAt: newDueAt, status: 'PENDING' };
        reminders.push(newRem);
        return newRem;
      };

      rescheduleLeadFollowUp('lead_1', '2026-10-30T10:00:00Z');

      const oldRem = reminders.find(r => r.id === 'rem_1');
      assert.strictEqual(oldRem.status, 'CANCELLED_OBSOLETE', 'Obsolete reminder must not fire after rescheduling');

      const activeRems = reminders.filter(r => r.leadId === 'lead_1' && r.status === 'PENDING');
      assert.strictEqual(activeRems.length, 1);
      assert.strictEqual(activeRems[0].dueAt, '2026-10-30T10:00:00Z');
    });

    it('generates WhatsApp draft link without auto-completing follow-up', () => {
      const buildWhatsAppDraft = (phone, name, businessName) => {
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        const message = encodeURIComponent(`Hello ${name}, this is following up from ${businessName}.`);
        return {
          label: 'Open WhatsApp',
          url: `https://wa.me/${cleanPhone}?text=${message}`,
          autoCompletesFollowUp: false,
        };
      };

      const action = buildWhatsAppDraft('+2348031234567', 'Bayo', 'Alpha Agency');
      assert.strictEqual(action.label, 'Open WhatsApp');
      assert.match(action.url, /^https:\/\/wa\.me\/2348031234567/);
      assert.strictEqual(action.autoCompletesFollowUp, false, 'Opening draft must NOT mark follow-up complete');
    });
  });

  // 3. Client Blockers ("Waiting on client")
  describe('3. Client Blockers ("Waiting on client")', () => {
    it('creates blocker without pausing unrelated leads or engagement', () => {
      const blockers = [];
      const createBlocker = (engagementId, leadId, whatIsNeeded, whoMustRespond, requiredResponseDate, affectedAction) => {
        const blocker = {
          id: `blk_${Date.now()}`,
          engagementId,
          leadId,
          whatIsNeeded,
          whoMustRespond,
          requestedAt: new Date(),
          requiredResponseDate: new Date(requiredResponseDate),
          affectedAction,
          status: 'OPEN',
          engagementPaused: false, // Must NOT automatically pause the whole engagement
        };
        blockers.push(blocker);
        return blocker;
      };

      const b = createBlocker(
        'eng_1',
        'lead_10',
        'Need approval on custom payment terms',
        'Client Managing Director',
        '2026-10-30',
        'Send revised invoice'
      );

      assert.strictEqual(b.status, 'OPEN');
      assert.strictEqual(b.engagementPaused, false, 'Blocker belongs to affected work and must not pause whole engagement');
      assert.strictEqual(b.whoMustRespond, 'Client Managing Director');
    });
  });

  // 4. Scoped Pilot Proposal Economics Worksheet
  describe('4. Scoped Proposal Contribution Worksheet', () => {
    const calculateEconomics = (params) => {
      const clientPrice = params.clientServicePrice || 0;
      const proComp = params.professionalCompensation || 0;
      const operatorEffortCost = (params.expectedOperatorEffortHours || 0) * (params.operatorHourlyCostRate || 3000);
      const directCosts = params.directDeliveryCosts || 0;

      // Bachs fee formula: 1.5% + NGN 100 capped at NGN 2000
      let estimatedBachsFee = (clientPrice * 0.015) + 100;
      if (estimatedBachsFee > 2000) estimatedBachsFee = 2000;

      const totalCosts = proComp + operatorEffortCost + directCosts + estimatedBachsFee;
      const expectedContribution = clientPrice - totalCosts;
      const isNegative = expectedContribution < 0;

      return {
        clientPrice,
        proComp,
        operatorEffortCost,
        directCosts,
        estimatedBachsFee,
        totalCosts,
        expectedContribution,
        isNegative,
      };
    };

    it('calculates expected contribution and fees correctly', () => {
      const eco = calculateEconomics({
        clientServicePrice: 150000,
        professionalCompensation: 80000,
        expectedOperatorEffortHours: 10,
        operatorHourlyCostRate: 3000,
        directDeliveryCosts: 5000,
      });

      // Bachs fee: 150000 * 0.015 + 100 = 2350 -> capped at 2000
      assert.strictEqual(eco.estimatedBachsFee, 2000);
      // Operator cost: 10 * 3000 = 30000
      assert.strictEqual(eco.operatorEffortCost, 30000);
      // Total costs: 80000 + 30000 + 5000 + 2000 = 117000
      assert.strictEqual(eco.totalCosts, 117000);
      // Expected contribution: 150000 - 117000 = 33000
      assert.strictEqual(eco.expectedContribution, 33000);
      assert.strictEqual(eco.isNegative, false);
    });

    it('flags negative contribution and requires explicit override reason', () => {
      const eco = calculateEconomics({
        clientServicePrice: 100000,
        professionalCompensation: 90000,
        expectedOperatorEffortHours: 10,
        operatorHourlyCostRate: 3000,
        directDeliveryCosts: 5000,
      });

      // Total costs = 90000 + 30000 + 5000 + 1600 = 126600
      // Contribution = 100000 - 126600 = -26600
      assert.strictEqual(eco.isNegative, true);

      const validateProposalSubmission = (proposal, economics) => {
        if (economics.isNegative && (!proposal.overrideReason || proposal.overrideReason.trim().length === 0)) {
          throw new Error('Negative expected contribution requires explicit authorized override reason');
        }
        return true;
      };

      assert.throws(
        () => validateProposalSubmission({ overrideReason: '' }, eco),
        /Negative expected contribution requires explicit authorized override reason/
      );

      assert.strictEqual(
        validateProposalSubmission({ overrideReason: 'Strategic initial pilot with high expansion likelihood' }, eco),
        true
      );
    });
  });

  // 5. Dual Approval: Talent Pool vs Client-Specific Readiness
  describe('5. Dual Professional Approvals & Activation Prerequisites', () => {
    it('talent pool approval does NOT bypass client-specific readiness', () => {
      const candidate = {
        id: 'pro_1',
        isPoolApproved: true, // Talent pool approval A passed
      };

      const clientReadiness = {
        briefReviewed: true,
        practiceConversationPassed: true,
        objectionHandlingPassed: true,
        commercialBoundariesConfirmed: true,
        operatorAssessmentApproved: true,
        clientApproved: false, // Client has not approved yet!
      };

      const isReadyToRepresentClient = (pro, readiness) => {
        if (!pro.isPoolApproved) return false;
        return (
          readiness.briefReviewed &&
          readiness.practiceConversationPassed &&
          readiness.objectionHandlingPassed &&
          readiness.commercialBoundariesConfirmed &&
          readiness.operatorAssessmentApproved &&
          readiness.clientApproved
        );
      };

      assert.strictEqual(
        isReadyToRepresentClient(candidate, clientReadiness),
        false,
        'Talent pool approval alone must not permit representing this specific client'
      );

      clientReadiness.clientApproved = true;
      assert.strictEqual(isReadyToRepresentClient(candidate, clientReadiness), true);
    });

    it('checks all 6 activation prerequisites before transitioning to ACTIVE', () => {
      const checkActivationPrerequisites = (params) => {
        const failures = [];
        if (!params.termsAccepted) failures.push('Accepted scope and terms required');
        if (!params.poolApproved) failures.push('Pool-approved professional required');
        if (!params.clientReadinessPassed) failures.push('Client-specific readiness approval required');
        if (!params.requiredMaterialsProvided) failures.push('Required client materials required');
        if (!params.initialPaymentVerified) failures.push('Verified initial Bachs payment required');
        if (!params.hasValidStartDate) failures.push('Valid start date required');

        return {
          canActivate: failures.length === 0,
          failures,
        };
      };

      const incomplete = checkActivationPrerequisites({
        termsAccepted: true,
        poolApproved: true,
        clientReadinessPassed: true,
        requiredMaterialsProvided: false, // Missing materials
        initialPaymentVerified: true,
        hasValidStartDate: true,
      });

      assert.strictEqual(incomplete.canActivate, false);
      assert.deepStrictEqual(incomplete.failures, ['Required client materials required']);

      const complete = checkActivationPrerequisites({
        termsAccepted: true,
        poolApproved: true,
        clientReadinessPassed: true,
        requiredMaterialsProvided: true,
        initialPaymentVerified: true,
        hasValidStartDate: true,
      });

      assert.strictEqual(complete.canActivate, true);
      assert.strictEqual(complete.failures.length, 0);
    });
  });

  // 6. Bachs Payments & Decimal Representation
  describe('6. Bachs Payment Conventions & Webhook Verification', () => {
    it('uses decimal string representations for currency amounts', () => {
      const formatBachsAmount = (amount) => {
        if (typeof amount !== 'number' || isNaN(amount)) throw new Error('Invalid amount');
        return amount.toFixed(2);
      };

      assert.strictEqual(formatBachsAmount(15000), '15000.00');
      assert.strictEqual(formatBachsAmount(150000), '150000.00');
      assert.strictEqual(formatBachsAmount(49.99), '49.99');
    });

    it('verifies Bachs webhook HMAC-SHA256 signature (V2 header)', () => {
      const secret = 'bachs_sec_test_abc123';
      const rawBody = JSON.stringify({
        id: 'evt_101',
        type: 'collection.succeeded',
        data: { amount: '15000.00', reference: 'INV-001' }
      });
      const timestamp = Math.floor(Date.now() / 1000);

      // Construct official Bachs V2 signature: t={timestamp},v1={hmac}
      const message = `${timestamp}.${rawBody}`;
      const signature = crypto.createHmac('sha256', secret).update(message, 'utf8').digest('hex');
      const v2Header = `t=${timestamp},v1=${signature}`;

      const verifySignature = (header, body, key, tolerance = 300) => {
        const parts = header.split(',');
        const tPart = parts.find(p => p.startsWith('t='));
        const v1Part = parts.find(p => p.startsWith('v1='));
        if (!tPart || !v1Part) return { isValid: false, error: 'Malformed header' };

        const t = parseInt(tPart.slice(2), 10);
        const sig = v1Part.slice(3);

        const now = Math.floor(Date.now() / 1000);
        if (Math.abs(now - t) > tolerance) {
          return { isValid: false, error: 'Timestamp outside replay tolerance window' };
        }

        const expected = crypto.createHmac('sha256', key).update(`${t}.${body}`, 'utf8').digest('hex');
        const match = crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'));
        return { isValid: match };
      };

      const validCheck = verifySignature(v2Header, rawBody, secret);
      assert.strictEqual(validCheck.isValid, true);

      // Replay attack with expired timestamp (older than 300s)
      const oldTimestamp = timestamp - 360;
      const oldMessage = `${oldTimestamp}.${rawBody}`;
      const oldSig = crypto.createHmac('sha256', secret).update(oldMessage, 'utf8').digest('hex');
      const oldHeader = `t=${oldTimestamp},v1=${oldSig}`;
      const replayCheck = verifySignature(oldHeader, rawBody, secret);
      assert.strictEqual(replayCheck.isValid, false);
      assert.strictEqual(replayCheck.error, 'Timestamp outside replay tolerance window');

      // Tampered body
      const tamperedCheck = verifySignature(v2Header, '{"tampered":true}', secret);
      assert.strictEqual(tamperedCheck.isValid, false);
    });

    it('processes webhook idempotently without duplicating access', () => {
      const processedEventIds = new Set();
      let subscriptionExtensions = 0;

      const handleWebhookIdempotent = (eventId) => {
        if (processedEventIds.has(eventId)) {
          return { handled: false, reason: 'Duplicate event already processed' };
        }
        processedEventIds.add(eventId);
        subscriptionExtensions++;
        return { handled: true };
      };

      const first = handleWebhookIdempotent('evt_bachs_999');
      assert.strictEqual(first.handled, true);
      assert.strictEqual(subscriptionExtensions, 1);

      const duplicate = handleWebhookIdempotent('evt_bachs_999');
      assert.strictEqual(duplicate.handled, false);
      assert.strictEqual(subscriptionExtensions, 1, 'Duplicate event must not extend subscription twice');
    });
  });

  // 7. Software Billing, Manual Renewal & Pilot Access Exemption
  describe('7. Software Billing, Manual Renewal & Pilot Exemption', () => {
    it('early renewal extends existing paid-through date by one calendar month', () => {
      const addCalendarMonth = (date) => {
        const d = new Date(date);
        d.setMonth(d.getMonth() + 1);
        return d;
      };

      // Existing subscription expires in 10 days
      const currentPaidThrough = new Date('2026-11-10T00:00:00Z');
      const renewedPaidThrough = addCalendarMonth(currentPaidThrough);

      assert.strictEqual(renewedPaidThrough.toISOString().startsWith('2026-12-10'), true);
    });

    it('active managed pilot grants PILOT_INCLUDED access without duplicate software charging', () => {
      const getSubscriptionStatus = (activePilot, standaloneSub) => {
        if (activePilot && activePilot.status === 'ACTIVE') {
          return {
            status: 'PILOT_INCLUDED',
            isAccessible: true,
            billingNote: 'Workspace access included under active Closecraft Follow-up Pilot. Duplicate standalone billing prevented.',
          };
        }
        return {
          status: standaloneSub.status,
          isAccessible: standaloneSub.isAccessible,
        };
      };

      const access = getSubscriptionStatus({ status: 'ACTIVE' }, { status: 'EXPIRED', isAccessible: false });
      assert.strictEqual(access.status, 'PILOT_INCLUDED');
      assert.strictEqual(access.isAccessible, true);
      assert.match(access.billingNote, /Duplicate standalone billing prevented/);
    });
  });

  // 8. Strict External Professional Data Quarantine
  describe('8. Strict External Professional Role & Tenant Isolation', () => {
    it('restricts external professional to assigned leads in active pilot engagements', () => {
      const allLeads = [
        { id: 'lead_1', orgId: 'org_a', assignedUserId: 'rep_1', pilotEngagementId: 'eng_active' },
        { id: 'lead_2', orgId: 'org_a', assignedUserId: 'rep_2', pilotEngagementId: 'eng_active' },
        { id: 'lead_3', orgId: 'org_a', assignedUserId: null, pilotEngagementId: null },
        { id: 'lead_4', orgId: 'org_b', assignedUserId: 'rep_1', pilotEngagementId: 'eng_other' },
      ];

      const queryLeadsForUser = (user, orgId, activeEngagementId) => {
        if (user.role === 'EXTERNAL_PROFESSIONAL') {
          return allLeads.filter(l => 
            l.orgId === orgId && 
            l.assignedUserId === user.id && 
            l.pilotEngagementId === activeEngagementId
          );
        }
        return allLeads.filter(l => l.orgId === orgId);
      };

      const repLeads = queryLeadsForUser(
        { id: 'rep_1', role: 'EXTERNAL_PROFESSIONAL' },
        'org_a',
        'eng_active'
      );

      assert.strictEqual(repLeads.length, 1);
      assert.strictEqual(repLeads[0].id, 'lead_1');

      // Internal manager sees all org_a leads including unassigned
      const managerLeads = queryLeadsForUser(
        { id: 'mgr_1', role: 'OWNER' },
        'org_a',
        'eng_active'
      );
      assert.strictEqual(managerLeads.length, 3);
    });
  });

});
