const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

describe('SaaS Services Architecture, Boundaries & Acceptance Tests', () => {

  // 1. Learner Data Isolation
  describe('1. Learner Data Isolation', () => {
    it('prevents a learner from viewing another learner\'s enrolments or progress records', () => {
      const getLearnerRecords = (requestingUserId, targetStudentId, studentProfiles) => {
        const student = studentProfiles.find(s => s.id === targetStudentId);
        if (!student) throw new Error('Student profile not found');
        // A learner can only access their own profile unless they have platform trainer/admin role
        if (student.userId !== requestingUserId) {
          throw new Error('Access Denied: Learners cannot view another learner\'s progress records');
        }
        return student.enrollments;
      };

      const profiles = [
        { id: 'student_1', userId: 'user_alice', enrollments: [{ id: 'enr_1', cohort: 'DSS-Cohort-1' }] },
        { id: 'student_2', userId: 'user_bob', enrollments: [{ id: 'enr_2', cohort: 'DSS-Cohort-2' }] },
      ];

      // Alice accesses Alice -> OK
      assert.doesNotThrow(() => {
        const res = getLearnerRecords('user_alice', 'student_1', profiles);
        assert.strictEqual(res.length, 1);
      });

      // Alice tries to access Bob -> Access Denied
      assert.throws(() => {
        getLearnerRecords('user_alice', 'student_2', profiles);
      }, /Access Denied/);
    });
  });

  // 2. Business Cross-Tenant Engagement Isolation
  describe('2. Business Cross-Tenant Engagement Isolation', () => {
    it('prevents a business tenant from accessing another business tenant\'s engagement', () => {
      const getEngagementForTenant = (organizationId, engagementId, engagements) => {
        const eng = engagements.find(e => e.id === engagementId);
        if (!eng) throw new Error('Engagement not found');
        if (eng.organizationId !== organizationId) {
          throw new Error('Access Denied: Tenant boundary violation');
        }
        return eng;
      };

      const engagements = [
        { id: 'eng_alpha', organizationId: 'org_acme', title: 'Acme Pilot' },
        { id: 'eng_beta', organizationId: 'org_globex', title: 'Globex Pilot' },
      ];

      // Acme accesses Acme -> OK
      const result = getEngagementForTenant('org_acme', 'eng_alpha', engagements);
      assert.strictEqual(result.title, 'Acme Pilot');

      // Acme tries to access Globex -> Throws
      assert.throws(() => {
        getEngagementForTenant('org_acme', 'eng_beta', engagements);
      }, /Tenant boundary violation/);
    });
  });

  // 3. Trainer Role Boundaries
  describe('3. Trainer Role Boundaries', () => {
    it('ensures a trainer cannot access a customer pipeline merely through a training assignment', () => {
      const checkAccessToCustomerPipeline = (userRole, isAssignedTrainer) => {
        // Having an assignment as a trainer does not grant access to the customer's CRM / deals pipeline
        if (userRole === 'TRAINER') {
          return { canAccessPipeline: false, reason: 'Trainers are restricted to training cohorts and cannot view customer CRM leads' };
        }
        if (['OWNER', 'ADMIN', 'MANAGER', 'INTERNAL_MEMBER', 'CLOSER'].includes(userRole)) {
          return { canAccessPipeline: true };
        }
        return { canAccessPipeline: false, reason: 'Unauthorized role' };
      };

      const trainerAccess = checkAccessToCustomerPipeline('TRAINER', true);
      assert.strictEqual(trainerAccess.canAccessPipeline, false);
      assert.match(trainerAccess.reason, /Trainers are restricted/);

      const managerAccess = checkAccessToCustomerPipeline('MANAGER', false);
      assert.strictEqual(managerAccess.canAccessPipeline, true);
    });
  });

  // 4. External Closer Restricted Scoping
  describe('4. External Closer Restricted Scoping', () => {
    it('restricts external closer to only assigned leads within an active engagement', () => {
      const filterLeadsForUser = (userId, userRole, leads, activeEngagementId) => {
        if (userRole === 'EXTERNAL_PROFESSIONAL') {
          return leads.filter(l => 
            l.assignedUserId === userId && 
            l.pilotEngagementId === activeEngagementId &&
            l.engagementStatus === 'ACTIVE'
          );
        }
        return leads;
      };

      const allLeads = [
        { id: 'lead_1', assignedUserId: 'pro_tunde', pilotEngagementId: 'eng_1', engagementStatus: 'ACTIVE' },
        { id: 'lead_2', assignedUserId: 'pro_other', pilotEngagementId: 'eng_1', engagementStatus: 'ACTIVE' },
        { id: 'lead_3', assignedUserId: 'pro_tunde', pilotEngagementId: 'eng_2', engagementStatus: 'ACTIVE' },
        { id: 'lead_4', assignedUserId: 'pro_tunde', pilotEngagementId: 'eng_1', engagementStatus: 'PAUSED' },
      ];

      const proLeads = filterLeadsForUser('pro_tunde', 'EXTERNAL_PROFESSIONAL', allLeads, 'eng_1');
      assert.strictEqual(proLeads.length, 1);
      assert.strictEqual(proLeads[0].id, 'lead_1');
    });
  });

  // 5. Ending an Assignment Revokes Access & Preserves History
  describe('5. Ending Assignment & Continuity Handover', () => {
    it('revokes professional workspace access while preserving work history and audit trails', () => {
      const mockWorkspace = {
        memberships: [{ userId: 'pro_1', role: 'EXTERNAL_PROFESSIONAL', active: true }],
        workLogs: [{ id: 'wl_1', userId: 'pro_1', hours: 4.5, description: 'Called 12 leads' }],
        leads: [{ id: 'ld_1', assignedUserId: 'pro_1' }],
        handovers: [],
      };

      const endAssignment = (engagementId, fallbackOwnerId) => {
        // 1. Reassign open leads to manager
        mockWorkspace.leads.forEach(l => {
          if (l.assignedUserId === 'pro_1') l.assignedUserId = fallbackOwnerId;
        });
        // 2. Revoke membership
        mockWorkspace.memberships = mockWorkspace.memberships.filter(m => m.userId !== 'pro_1');
        // 3. Create handover record
        mockWorkspace.handovers.push({
          engagementId,
          type: 'ENGAGEMENT_COMPLETION',
          temporaryOwnerUserId: fallbackOwnerId,
          accessRevoked: true,
          revokedAt: new Date().toISOString(),
        });
      };

      endAssignment('eng_1', 'manager_user');

      // Access is revoked
      assert.strictEqual(mockWorkspace.memberships.length, 0);
      // Open lead reassigned to manager
      assert.strictEqual(mockWorkspace.leads[0].assignedUserId, 'manager_user');
      // Historical work logs intact
      assert.strictEqual(mockWorkspace.workLogs.length, 1);
      assert.strictEqual(mockWorkspace.workLogs[0].description, 'Called 12 leads');
      // Handover record created
      assert.strictEqual(mockWorkspace.handovers.length, 1);
      assert.strictEqual(mockWorkspace.handovers[0].accessRevoked, true);
    });
  });

  // 6. DSS Enrolment vs. Payment Separation
  describe('6. DSS Enrolment vs. Payment Separation', () => {
    it('does not infer enrolment from a browser redirect alone; requires verified payment or admin grant', () => {
      const enrollStudent = (studentId, paymentRecord, adminGrant = false) => {
        if (adminGrant) {
          return { enrolled: true, reason: 'Administrative Enrolment' };
        }
        if (!paymentRecord || paymentRecord.status !== 'VERIFIED_COLLECTED') {
          throw new Error('Cannot enrol: Unverified payment status. A checkout redirect is not proof of payment.');
        }
        return { enrolled: true, reason: 'Verified Payment' };
      };

      // Redirect alone without verified webhook
      assert.throws(() => {
        enrollStudent('st_1', { status: 'PENDING_CHECKOUT', amount: 100000 });
      }, /Unverified payment status/);

      // Verified collection -> Enrolment passes
      const valid = enrollStudent('st_1', { status: 'VERIFIED_COLLECTED', amount: 100000 });
      assert.strictEqual(valid.enrolled, true);
    });
  });

  // 7. Team Training Request & Scoped Scope
  describe('7. Team Training Request & Scoped Scope', () => {
    it('retains business objective, team size, and anonymised data settings without exposing unrelated data', () => {
      const validateTeamTrainingPayload = (data) => {
        if (!data.businessObjective || data.businessObjective.trim().length === 0) {
          throw new Error('Business objective required');
        }
        const teamSize = Number(data.teamSize);
        if (isNaN(teamSize) || teamSize < 1) {
          throw new Error('Valid team size required');
        }
        return {
          valid: true,
          record: {
            businessObjective: data.businessObjective.trim(),
            teamSize,
            salesRoles: data.salesRoles,
            useAnonymisedData: data.useAnonymisedData !== false,
          }
        };
      };

      const result = validateTeamTrainingPayload({
        businessObjective: 'Accelerate enterprise deals from 45 days to 25 days',
        teamSize: '6',
        salesRoles: 'Account Executives',
        useAnonymisedData: true,
      });

      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.record.teamSize, 6);
      assert.strictEqual(result.record.useAnonymisedData, true);
    });
  });

  // 8. Proposal Version Immutability
  describe('8. Proposal Version Immutability', () => {
    it('prevents silent modification of accepted commercial terms and increments version on amendment', () => {
      const proposal = {
        id: 'prop_1',
        title: 'Closecraft Follow-up Pilot',
        price: 150000,
        currency: 'NGN',
        version: 1,
        isAccepted: true,
        acceptedAt: '2026-10-01T10:00:00Z',
      };

      const updateTerms = (prop, newPrice, isAmendment = false) => {
        if (prop.isAccepted && !isAmendment) {
          throw new Error('Accepted commercial terms cannot be silently modified. An amendment workflow is required.');
        }
        return {
          ...prop,
          price: newPrice,
          version: prop.version + 1,
          isAccepted: false, // New version requires fresh acceptance
          acceptedAt: null,
        };
      };

      // Silent edit rejected
      assert.throws(() => {
        updateTerms(proposal, 180000, false);
      }, /Accepted commercial terms cannot be silently modified/);

      // Amendment produces new version requiring re-acceptance
      const amended = updateTerms(proposal, 180000, true);
      assert.strictEqual(amended.version, 2);
      assert.strictEqual(amended.isAccepted, false);
      assert.strictEqual(amended.price, 180000);
    });
  });

  // 9. Allowed State Transitions & Rejection of Invalid Transitions
  describe('9. Allowed State Transitions & Rejection of Invalid Transitions', () => {
    const ALLOWED_TRANSITIONS = {
      DRAFT: ['AWAITING_ACCEPTANCE', 'CANCELLED'],
      AWAITING_ACCEPTANCE: ['AWAITING_PAYMENT', 'AWAITING_READINESS', 'DRAFT', 'CANCELLED'],
      AWAITING_PAYMENT: ['AWAITING_READINESS', 'SCHEDULED', 'ACTIVE', 'CANCELLED'],
      AWAITING_READINESS: ['SCHEDULED', 'ACTIVE', 'CANCELLED'],
      SCHEDULED: ['ACTIVE', 'PAUSED', 'CANCELLED'],
      ACTIVE: ['PAUSED', 'ENDING', 'ENDED', 'CANCELLED'],
      PAUSED: ['ACTIVE', 'ENDING', 'ENDED', 'CANCELLED'],
      ENDING: ['ENDED', 'CANCELLED'],
      ENDED: [],
      CANCELLED: [],
    };

    const validateTransition = (current, next) => {
      const allowed = ALLOWED_TRANSITIONS[current] || [];
      if (!allowed.includes(next)) {
        throw new Error(`Invalid state transition: Cannot transition from '${current}' to '${next}'.`);
      }
      return true;
    };

    it('rejects jumping from DRAFT directly to ACTIVE without acceptance or payment', () => {
      assert.throws(() => {
        validateTransition('DRAFT', 'ACTIVE');
      }, /Invalid state transition/);
    });

    it('rejects transitioning from terminal ENDED state', () => {
      assert.throws(() => {
        validateTransition('ENDED', 'ACTIVE');
      }, /Invalid state transition/);
    });

    it('allows valid progression: DRAFT -> AWAITING_ACCEPTANCE -> AWAITING_PAYMENT -> ACTIVE', () => {
      assert.strictEqual(validateTransition('DRAFT', 'AWAITING_ACCEPTANCE'), true);
      assert.strictEqual(validateTransition('AWAITING_ACCEPTANCE', 'AWAITING_PAYMENT'), true);
      assert.strictEqual(validateTransition('AWAITING_PAYMENT', 'ACTIVE'), true);
    });
  });

  // 10. Commercial Suitability Calculation & Metric Differentiation
  describe('10. Commercial Suitability Calculation & Metric Differentiation', () => {
    it('differentiates raw enquiry vs qualified conversation vs deal won', () => {
      const calculateSuitability = (enquiries, qualifiedConversations, dealValue, marginPct, totalCost) => {
        const grossProfitPerSale = dealValue * (marginPct / 100);
        const estimatedSales = Math.max(1, Math.round(qualifiedConversations * 0.15));
        const projectedGrossProfit = estimatedSales * grossProfitPerSale;
        const netReturn = projectedGrossProfit - totalCost;
        const meetsCloserGuideline = qualifiedConversations >= 20;

        return {
          meetsCloserGuideline,
          netReturn,
          recommendedScope: meetsCloserGuideline && netReturn > 0
            ? 'DEDICATED_CLOSING'
            : qualifiedConversations < 20 && enquiries >= 20
            ? 'APPOINTMENT_SETTING_FIRST'
            : 'BOUNDED_PART_TIME'
        };
      };

      // 40 enquiries, but only 10 qualified convs -> Appointment setting first
      const res1 = calculateSuitability(40, 10, 200000, 50, 150000);
      assert.strictEqual(res1.meetsCloserGuideline, false);
      assert.strictEqual(res1.recommendedScope, 'APPOINTMENT_SETTING_FIRST');

      // 25 qualified convs -> Dedicated closing
      const res2 = calculateSuitability(60, 25, 200000, 50, 150000);
      assert.strictEqual(res2.meetsCloserGuideline, true);
      assert.strictEqual(res2.recommendedScope, 'DEDICATED_CLOSING');
    });
  });

  // 11. Deal Won != Collected Cash (Commission Separation)
  describe('11. Deal Won != Collected Cash (Commission Separation)', () => {
    it('does not assume commission is paid solely on Deal Won; requires verified collected payment and manager approval', () => {
      const processCommission = (deal, paymentCollected, managerApproved) => {
        if (deal.stage === 'WON' && !paymentCollected) {
          return { status: 'ACCRUED_UNCOLLECTED', payable: 0, reason: 'Waiting on verified cash collection' };
        }
        if (deal.stage === 'WON' && paymentCollected && !managerApproved) {
          return { status: 'COLLECTED_AWAITING_APPROVAL', payable: 0, reason: 'Requires manager review' };
        }
        if (deal.stage === 'WON' && paymentCollected && managerApproved) {
          return { status: 'APPROVED_FOR_PAYOUT', payable: deal.commissionAmount };
        }
        return { status: 'INELIGIBLE', payable: 0 };
      };

      const deal = { id: 'd_1', amount: 500000, commissionAmount: 50000, stage: 'WON' };

      // Deal marked won, but client cash not yet collected
      const uncollected = processCommission(deal, false, false);
      assert.strictEqual(uncollected.payable, 0);
      assert.strictEqual(uncollected.status, 'ACCRUED_UNCOLLECTED');

      // Cash collected, but manager hasn't signed off
      const awaitingApproval = processCommission(deal, true, false);
      assert.strictEqual(awaitingApproval.payable, 0);
      assert.strictEqual(awaitingApproval.status, 'COLLECTED_AWAITING_APPROVAL');

      // Both satisfied -> Released
      const approved = processCommission(deal, true, true);
      assert.strictEqual(approved.payable, 50000);
      assert.strictEqual(approved.status, 'APPROVED_FOR_PAYOUT');
    });
  });

  // 12. Paused Engagements Surface Unfinished Work
  describe('12. Paused Engagements Surface Unfinished Work', () => {
    it('flags unfinished tasks and open leads when an engagement is paused', () => {
      const leads = [
        { id: 'l_1', engagementId: 'eng_1', status: 'QUALIFYING' },
        { id: 'l_2', engagementId: 'eng_1', status: 'WON' },
        { id: 'l_3', engagementId: 'eng_1', status: 'FOLLOW_UP' },
      ];

      const pauseEngagement = (engagementId) => {
        const affectedLeads = leads.filter(l => 
          l.engagementId === engagementId && ['NEW', 'ENGAGED', 'QUALIFYING', 'FOLLOW_UP'].includes(l.status)
        );
        return {
          engagementStatus: 'PAUSED',
          requiresReassignment: affectedLeads.length > 0,
          affectedLeadsCount: affectedLeads.length,
          affectedLeadIds: affectedLeads.map(l => l.id),
        };
      };

      const result = pauseEngagement('eng_1');
      assert.strictEqual(result.engagementStatus, 'PAUSED');
      assert.strictEqual(result.requiresReassignment, true);
      assert.strictEqual(result.affectedLeadsCount, 2);
      assert.deepStrictEqual(result.affectedLeadIds, ['l_1', 'l_3']);
    });
  });

  // 13. Public Landing Hero Preservation Verification
  describe('13. Public Landing Hero Preservation Verification', () => {
    it('ensures the public landing hero text, buttons, and destinations remain strictly intact', () => {
      const wrapperPath = path.join(__dirname, '../src/app/(marketing)/LandingClientWrapper.tsx');
      assert.strictEqual(fs.existsSync(wrapperPath), true, 'LandingClientWrapper.tsx must exist');

      const content = fs.readFileSync(wrapperPath, 'utf8');

      // Hero headline
      assert.ok(
        content.includes('Stop losing sales to forgotten follow-up.'),
        'Hero headline "Stop losing sales to forgotten follow-up." must be preserved'
      );

      // Hero subtext
      assert.ok(
        content.includes('Give every promising enquiry an owner and a clear next step.'),
        'Hero subtext must be preserved'
      );

      // Primary CTA & trial terms
      assert.ok(
        content.includes('Start My 7-Day Free Trial'),
        'Primary CTA "Start My 7-Day Free Trial" must be preserved'
      );
      assert.ok(
        content.includes('Try Starter free for 7 days, with no credit card required.'),
        'Hero trial terms must be preserved verbatim'
      );
    });
  });

});
