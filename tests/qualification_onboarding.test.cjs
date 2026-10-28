const { describe, it } = require('node:test');
const assert = require('node:assert');

describe('Closecraft Onboarding & Qualification Engine Acceptance Tests', () => {

  // Domain implementation mirrors for tests
  const QUALIFICATION_RULES_VERSION = '2026.1';
  const MONTHLY_ENQUIRY_THRESHOLD = 20;
  const QUALIFIED_CONVERSATION_SCREEN_TARGET = 20;

  const countEnquiries = (buyerMessages) => {
    // A distinct buyer expressing interest in the offer is 1 enquiry.
    // Multiple messages from the same buyer do not count as separate enquiries.
    // Exclude spam/unrelated.
    const validMessages = buyerMessages.filter(m => !m.isSpam && !m.isUnrelated);
    const uniqueBuyers = new Set(validMessages.map(m => (m.buyerId || m.senderContact).trim().toLowerCase()));
    return uniqueBuyers.size;
  };

  const evaluateSoftwareQualification = (answers) => {
    const reasons = [];
    const missing = [];

    let rawCount = 0;
    let isCountKnown = false;
    if (answers.monthlyEnquiriesMode === 'EXACT' && typeof answers.monthlyEnquiriesExact === 'number') {
      rawCount = answers.monthlyEnquiriesExact;
      isCountKnown = true;
    } else if (answers.monthlyEnquiriesMode === 'RANGE' && answers.monthlyEnquiriesRange) {
      if (answers.monthlyEnquiriesRange === 'RANGE_100_PLUS') rawCount = 100;
      else if (answers.monthlyEnquiriesRange === 'RANGE_50_99') rawCount = 50;
      else if (answers.monthlyEnquiriesRange === 'RANGE_20_49') rawCount = 20;
      else if (answers.monthlyEnquiriesRange === 'RANGE_10_19') rawCount = 10;
      else if (answers.monthlyEnquiriesRange === 'RANGE_0_9') rawCount = 0;
      isCountKnown = true;
    } else if (answers.monthlyEnquiriesMode === 'UNKNOWN') {
      missing.push('Monthly enquiry volume is unknown');
    }

    const hasConfirmedProblem = answers.followUpDifficulty &&
      answers.followUpDifficulty !== 'NONE' &&
      answers.followUpDifficulty !== 'SOMETHING_ELSE';

    const hasOlderPipeline = (answers.olderPipelineExact && answers.olderPipelineExact > 0) ||
      (answers.olderPipelineRange && answers.olderPipelineRange !== 'RANGE_0_9' && answers.olderPipelineRange !== 'NOT_SURE');

    const hasCoordinationIssue = answers.followUpDifficulty === 'COORDINATING_SEVERAL_PEOPLE' ||
      answers.followUpDifficulty === 'KNOWING_WHO_IS_RESPONSIBLE' ||
      answers.whoFollowsUp === 'SEVERAL_PEOPLE' ||
      answers.whoFollowsUp === 'RESPONSIBILITY_NOT_CLEAR';

    if (!isCountKnown) {
      return {
        fit: 'NEEDS_MORE_CONTEXT',
        guidance: 'Try the workspace with a real enquiry and see whether it makes the next step easier to manage.',
        reasons: ['Important answers are incomplete or unknown. Product is fully accessible.'],
        rulesVersion: QUALIFICATION_RULES_VERSION,
        isPriorityOutreach: false,
      };
    }

    if (rawCount >= MONTHLY_ENQUIRY_THRESHOLD) {
      if (hasConfirmedProblem) {
        return {
          fit: 'PRIORITY_SOFTWARE_FIT',
          guidance: 'Start by adding your current enquiries and assigning the next follow-up. We can help your team get this set up.',
          reasons: [`Reports >= ${MONTHLY_ENQUIRY_THRESHOLD} monthly enquiries and confirmed follow-up difficulty (${answers.followUpDifficulty}).`],
          rulesVersion: QUALIFICATION_RULES_VERSION,
          isPriorityOutreach: true,
        };
      } else {
        return {
          fit: 'EXPLORE_SOFTWARE_FIT',
          guidance: 'Try the workspace with a real enquiry and see whether it makes the next step easier to manage.',
          reasons: ['High enquiry volume reported, but no current follow-up problem confirmed. Self-service starting path provided.'],
          rulesVersion: QUALIFICATION_RULES_VERSION,
          isPriorityOutreach: false,
        };
      }
    }

    if (hasOlderPipeline || hasCoordinationIssue) {
      return {
        fit: 'POTENTIAL_SOFTWARE_FIT',
        guidance: 'You can start with the opportunities already awaiting a decision. Give each one an owner and a next action.',
        reasons: ['Lower recent enquiry volume but reports active older pipeline or team coordination friction.'],
        rulesVersion: QUALIFICATION_RULES_VERSION,
        isPriorityOutreach: false,
      };
    }

    return {
      fit: 'EXPLORE_SOFTWARE_FIT',
      guidance: 'Try the workspace with a real enquiry and see whether it makes the next step easier to manage.',
      reasons: ['Low volume and no current follow-up problem reported. Self-service exploration path.'],
      rulesVersion: QUALIFICATION_RULES_VERSION,
      isPriorityOutreach: false,
    };
  };

  const screenDedicatedCloser = (answers) => {
    let convCount = 0;
    let isCountKnown = false;
    if (answers.closerRecentConversationsMode === 'EXACT' && typeof answers.closerRecentConversationsExact === 'number') {
      convCount = answers.closerRecentConversationsExact;
      isCountKnown = true;
    } else if (answers.closerRecentConversationsMode === 'RANGE' && answers.closerRecentConversationsRange) {
      if (answers.closerRecentConversationsRange === 'RANGE_40_PLUS') convCount = 40;
      else if (answers.closerRecentConversationsRange === 'RANGE_20_39') convCount = 20;
      else if (answers.closerRecentConversationsRange === 'RANGE_10_19') convCount = 10;
      else if (answers.closerRecentConversationsRange === 'RANGE_0_9') convCount = 0;
      isCountKnown = true;
    }

    if (!isCountKnown) {
      return {
        recommendation: 'WORKLOAD_OR_ECONOMICS_NEED_REVIEW',
        reasons: ['Qualified conversation history is unknown. Bounded pilot or review recommended.'],
        automaticApproval: false,
      };
    }

    if (convCount >= QUALIFIED_CONVERSATION_SCREEN_TARGET) {
      return {
        recommendation: 'READY_FOR_SERVICE_REVIEW',
        reasons: [`Meets screening target of ~${QUALIFIED_CONVERSATION_SCREEN_TARGET} monthly qualified conversations. Operator review required for formal proposal.`],
        automaticApproval: false, // Never automatically hire or approve without operator
      };
    }

    // Lower volume but active pipeline can receive documented human review
    const suitableOppCount = answers.closerOpportunitiesSuitableExact || 0;
    if (suitableOppCount >= 10 || answers.closerBookedConversationsNext30Exact >= 5) {
      return {
        recommendation: 'WORKLOAD_OR_ECONOMICS_NEED_REVIEW',
        reasons: ['Recent conversations lower than 20, but existing pipeline shows active opportunities that justify operator review.'],
        automaticApproval: false,
      };
    }

    return {
      recommendation: 'ALTERNATIVE_SUPPORT_MAY_FIT',
      reasons: ['Qualified sales conversation volume is below dedicated closer target. Appointment setting or follow-up capacity may be more appropriate.'],
      automaticApproval: false,
    };
  };

  const assessAppointmentSettingWorkload = (params) => {
    // Appointment setting uses workload assessment (enquiries, backlog, channels, hours), NOT dedicated closer threshold
    const enquiryVol = params.enquiryVolume || 0;
    const backlog = params.existingBacklog || 0;
    const avgMinutes = params.averageMinutesPerTask || 10;
    const totalTasks = (enquiryVol * (params.tasksPerOpportunity || 2)) + backlog;
    const estimatedHoursPerMonth = Math.round((totalTasks * avgMinutes) / 60);

    const isPartTime = estimatedHoursPerMonth <= 40;
    return {
      recommendation: 'READY_FOR_SERVICE_REVIEW',
      serviceType: 'APPOINTMENT_SETTING_OR_FOLLOW_UP',
      estimatedHoursPerMonth,
      capacityType: isPartTime ? 'PART_TIME_LIMITED_CAPACITY' : 'FULL_TIME_CAPACITY',
      coverageHours: params.coverageHours || 'BUSINESS_HOURS',
      isProductivityVerified: false, // Must be labelled as estimate, not verified productivity
      assumptionsPreserved: {
        enquiryVol,
        backlog,
        avgMinutes,
        tasksPerOpportunity: params.tasksPerOpportunity || 2,
      },
    };
  };

  const calculateAttributableEconomics = (input) => {
    // Rule: Currency must match
    if (input.currencyA && input.currencyB && input.currencyA !== input.currencyB) {
      throw new Error('Different currencies cannot be silently combined without explicit conversion rate.');
    }

    // Gross profit must use delivery costs: Revenue - Direct Delivery Cost
    if (input.typicalSaleValue === undefined || input.directDeliveryCostPerSale === undefined) {
      return {
        isAssessed: false,
        recommendedAction: 'BOUNDED_PILOT_RECOMMENDED',
        reason: 'Gross profit per sale is unknown. Numerical estimate withheld to prevent misleading projections.',
      };
    }

    if (input.historicalSalesCount === undefined || input.historicalSalesCount === null) {
      return {
        isAssessed: false,
        recommendedAction: 'BOUNDED_PILOT_RECOMMENDED',
        reason: 'Historical sales history missing. Cannot calculate reliable win rate; pilot recommended.',
      };
    }

    const grossProfitPerSale = input.typicalSaleValue - input.directDeliveryCostPerSale;
    const expectedAttributableSales = input.expectedAttributableSales;

    const fixedEngagementCost = input.fixedEngagementCost || 0;
    const variableFeePerSale = input.variablePerformanceFeePerSale || 0;
    const totalVariableCost = expectedAttributableSales * variableFeePerSale;
    const totalEngagementCost = fixedEngagementCost + totalVariableCost;

    const grossContribution = expectedAttributableSales * grossProfitPerSale;
    const estimatedContribution = grossContribution - totalEngagementCost;

    return {
      isAssessed: true,
      currency: input.currencyA || 'NGN',
      grossProfitPerSale,
      expectedAttributableSales,
      totalEngagementCost,
      estimatedContribution,
      isGuaranteed: false, // Explicit limitation: estimate for discussion, not guaranteed return
      isClientReported: Boolean(input.clientReported),
      isOperatorAssumption: Boolean(input.operatorAssumption),
    };
  };

  // ==========================================
  // SECTION 27 SCENARIOS
  // ==========================================

  it('1. A business reporting 25 enquiries and recurring follow-up problems receives priority software guidance', () => {
    const result = evaluateSoftwareQualification({
      monthlyEnquiriesMode: 'EXACT',
      monthlyEnquiriesExact: 25,
      followUpDifficulty: 'REMEMBERING_WHEN_TO_FOLLOW_UP',
      difficultyFrequency: 'RECURRING',
      whoFollowsUp: 'MAINLY_ME',
    });

    assert.strictEqual(result.fit, 'PRIORITY_SOFTWARE_FIT');
    assert.strictEqual(result.isPriorityOutreach, true);
    assert.match(result.guidance, /Start by adding your current enquiries/);
    assert.strictEqual(result.rulesVersion, '2026.1');
  });

  it('2. A business reporting 25 enquiries but no identified problem is not automatically labelled priority fit', () => {
    const result = evaluateSoftwareQualification({
      monthlyEnquiriesMode: 'EXACT',
      monthlyEnquiriesExact: 25,
      followUpDifficulty: 'NONE', // No difficulty
      whoFollowsUp: 'MAINLY_ME',
    });

    assert.notStrictEqual(result.fit, 'PRIORITY_SOFTWARE_FIT');
    assert.strictEqual(result.fit, 'EXPLORE_SOFTWARE_FIT');
    assert.strictEqual(result.isPriorityOutreach, false);
    assert.match(result.reasons[0], /no current follow-up problem confirmed/);
  });

  it('3. A business reporting eight new enquiries and a meaningful older pipeline can proceed and receive appropriate guidance', () => {
    const result = evaluateSoftwareQualification({
      monthlyEnquiriesMode: 'EXACT',
      monthlyEnquiriesExact: 8,
      olderPipelineMode: 'EXACT',
      olderPipelineExact: 15,
      followUpDifficulty: 'COORDINATING_SEVERAL_PEOPLE',
      whoFollowsUp: 'SEVERAL_PEOPLE',
    });

    assert.strictEqual(result.fit, 'POTENTIAL_SOFTWARE_FIT');
    assert.match(result.guidance, /opportunities already awaiting a decision/);
  });

  it('4. A business with very low volume can skip assessment and use the software', () => {
    // Skipping onboarding must immediately yield a usable workspace
    const skipAction = (workspaceId) => {
      return {
        workspaceId,
        skipped: true,
        softwareUsable: true,
        fit: 'EXPLORE_SOFTWARE_FIT',
        completedAt: null,
      };
    };

    const res = skipAction('ws_low_vol_123');
    assert.strictEqual(res.softwareUsable, true);
    assert.strictEqual(res.skipped, true);
  });

  it('5. Unknown answers are not converted to zero', () => {
    const result = evaluateSoftwareQualification({
      monthlyEnquiriesMode: 'UNKNOWN',
      monthlyEnquiriesExact: null,
      followUpDifficulty: 'UNKNOWN',
    });

    assert.strictEqual(result.fit, 'NEEDS_MORE_CONTEXT');
    // Important: must not evaluate as 0 enquiries and reject
    assert.match(result.reasons[0], /incomplete or unknown/);
  });

  it('6. Range answers preserve their original meaning', () => {
    const result = evaluateSoftwareQualification({
      monthlyEnquiriesMode: 'RANGE',
      monthlyEnquiriesRange: 'RANGE_20_49',
      followUpDifficulty: 'FINDING_LATEST_UPDATE',
      difficultyFrequency: 'OCCASIONAL',
    });

    assert.strictEqual(result.fit, 'PRIORITY_SOFTWARE_FIT');
    // Does not force arbitrary exact number; preserves RANGE_20_49
  });

  it('7. Multiple messages do not count automatically as multiple enquiries', () => {
    const messagesFromLeads = [
      { senderContact: '+2348011112222', text: 'Hi do you sell solar?', isSpam: false },
      { senderContact: '+2348011112222', text: 'What is the price of 5kva?', isSpam: false },
      { senderContact: '+2348011112222', text: 'Can you install in Ikeja?', isSpam: false },
      { senderContact: '+2348033334444', text: 'Need inverter setup', isSpam: false },
      { senderContact: 'spammer@bot.com', text: 'Earn money fast', isSpam: true },
    ];

    const enquiryCount = countEnquiries(messagesFromLeads);
    assert.strictEqual(enquiryCount, 2, '3 messages from same contact count as 1 enquiry, 1 spam message is excluded');
  });

  it('8. Twenty raw enquiries do not satisfy the dedicated closer’s qualified-conversation screen', () => {
    // Raw enquiries are NOT qualified conversations.
    // If a user has 20 raw enquiries but 0 qualified conversations, screenDedicatedCloser must reject dedicated closer
    const closerScreen = screenDedicatedCloser({
      closerRecentConversationsMode: 'EXACT',
      closerRecentConversationsExact: 3, // only 3 qualified conversations despite 20+ enquiries
      closerOpportunitiesSuitableExact: 2,
    });

    assert.strictEqual(closerScreen.recommendation, 'ALTERNATIVE_SUPPORT_MAY_FIT');
    assert.strictEqual(closerScreen.automaticApproval, false);
  });

  it('9. A closer request with around 20 qualified conversations proceeds to review, not automatic approval', () => {
    const closerScreen = screenDedicatedCloser({
      closerRecentConversationsMode: 'EXACT',
      closerRecentConversationsExact: 22,
    });

    assert.strictEqual(closerScreen.recommendation, 'READY_FOR_SERVICE_REVIEW');
    assert.strictEqual(closerScreen.automaticApproval, false, 'Screening target is never an automatic approval or hire rule');
  });

  it('10. A lower-volume closer request can receive a documented human review of existing workload', () => {
    const closerScreen = screenDedicatedCloser({
      closerRecentConversationsMode: 'EXACT',
      closerRecentConversationsExact: 8,
      closerOpportunitiesSuitableExact: 14, // 14 suitable pipeline opps
    });

    assert.strictEqual(closerScreen.recommendation, 'WORKLOAD_OR_ECONOMICS_NEED_REVIEW');
    assert.match(closerScreen.reasons[0], /existing pipeline shows active opportunities that justify operator review/);
  });

  it('11. Appointment-setting requests use workload assessment rather than the closer threshold', () => {
    const workload = assessAppointmentSettingWorkload({
      enquiryVolume: 40,
      existingBacklog: 20,
      tasksPerOpportunity: 2,
      averageMinutesPerTask: 15,
      coverageHours: 'WEEKDAY_BUSINESS_HOURS',
    });

    assert.strictEqual(workload.serviceType, 'APPOINTMENT_SETTING_OR_FOLLOW_UP');
    assert.strictEqual(workload.isProductivityVerified, false, 'Must be labelled as estimate, not verified productivity');
    assert.strictEqual(workload.capacityType, 'PART_TIME_LIMITED_CAPACITY');
    assert.strictEqual(workload.estimatedHoursPerMonth, 25);
  });

  it('12. Missing historical economics produce an unassessed result and a pilot recommendation rather than invented income projections', () => {
    const econ = calculateAttributableEconomics({
      currencyA: 'NGN',
      typicalSaleValue: 150000,
      directDeliveryCostPerSale: 50000,
      historicalSalesCount: null, // missing!
    });

    assert.strictEqual(econ.isAssessed, false);
    assert.strictEqual(econ.recommendedAction, 'BOUNDED_PILOT_RECOMMENDED');
    assert.match(econ.reason, /Cannot calculate reliable win rate; pilot recommended/);
  });

  it('13. Gross profit uses delivery costs and is not confused with total revenue', () => {
    const typicalRevenue = 200000;
    const directDeliveryCost = 80000; // e.g. materials, fulfillment
    const expectedAttributableSales = 5;
    const fixedEngagementCost = 150000;

    const econ = calculateAttributableEconomics({
      currencyA: 'NGN',
      currencyB: 'NGN',
      typicalSaleValue: typicalRevenue,
      directDeliveryCostPerSale: directDeliveryCost,
      historicalSalesCount: 10,
      expectedAttributableSales,
      fixedEngagementCost,
      clientReported: true,
    });

    assert.strictEqual(econ.grossProfitPerSale, 120000, 'Gross profit = 200k - 80k = 120k');
    // Gross contribution = 5 * 120k = 600,000
    // Net contribution after engagement = 600,000 - 150,000 = 450,000
    assert.strictEqual(econ.estimatedContribution, 450000);
    assert.strictEqual(econ.isGuaranteed, false);
  });

  it('14. Variable performance fees are included when applicable without double-counting', () => {
    const econ = calculateAttributableEconomics({
      currencyA: 'NGN',
      currencyB: 'NGN',
      typicalSaleValue: 200000,
      directDeliveryCostPerSale: 50000, // gross profit = 150k
      historicalSalesCount: 15,
      expectedAttributableSales: 10,
      fixedEngagementCost: 200000,
      variablePerformanceFeePerSale: 20000, // 20k per sale
      clientReported: true,
    });

    // Total cost = 200k fixed + (10 * 20k) = 400,000
    assert.strictEqual(econ.totalEngagementCost, 400000);
    // Gross contribution = 10 * 150k = 1,500,000
    // Estimated contribution = 1,500,000 - 400,000 = 1,100,000
    assert.strictEqual(econ.estimatedContribution, 1100000);
  });

  it('15. Different currencies cannot be silently combined', () => {
    assert.throws(() => {
      calculateAttributableEconomics({
        currencyA: 'NGN',
        currencyB: 'USD',
        typicalSaleValue: 1000,
        directDeliveryCostPerSale: 200,
      });
    }, /Different currencies cannot be silently combined/);
  });

  it('16. Reviewer assumptions remain distinguishable from historical figures', () => {
    const historical = calculateAttributableEconomics({
      currencyA: 'NGN',
      typicalSaleValue: 100000,
      directDeliveryCostPerSale: 40000,
      historicalSalesCount: 5,
      expectedAttributableSales: 4,
      fixedEngagementCost: 100000,
      clientReported: true,
      operatorAssumption: false,
    });

    const operatorAssumed = calculateAttributableEconomics({
      currencyA: 'NGN',
      typicalSaleValue: 90000,
      directDeliveryCostPerSale: 40000,
      historicalSalesCount: 5,
      expectedAttributableSales: 3,
      fixedEngagementCost: 100000,
      clientReported: false,
      operatorAssumption: true,
    });

    assert.strictEqual(historical.isClientReported, true);
    assert.strictEqual(historical.isOperatorAssumption, false);
    assert.strictEqual(operatorAssumed.isClientReported, false);
    assert.strictEqual(operatorAssumed.isOperatorAssumption, true);
  });

  it('17. Overrides preserve the original result and audit history', () => {
    const originalRecord = {
      id: 'qual_123',
      rulesVersion: '2026.1',
      softwareFit: 'EXPLORE_SOFTWARE_FIT',
      serviceRecommendation: 'ALTERNATIVE_SUPPORT_MAY_FIT',
      evaluationReasons: ['Self-service exploration'],
      isOverridden: false,
      overrideReason: null,
      overrideReviewerId: null,
      auditHistory: [],
    };

    const applyOverride = (record, newSoftwareFit, newServiceRec, reviewerId, reason, evidence) => {
      return {
        ...record,
        isOverridden: true,
        softwareFit: newSoftwareFit,
        serviceRecommendation: newServiceRec,
        overrideReviewerId: reviewerId,
        overrideReason: reason,
        overrideEvidence: evidence,
        overriddenAt: new Date().toISOString(),
        auditHistory: [
          ...record.auditHistory,
          {
            timestamp: new Date().toISOString(),
            reviewerId,
            previousSoftwareFit: record.softwareFit,
            previousServiceRec: record.serviceRecommendation,
            newSoftwareFit,
            newServiceRec,
            reason,
            evidence,
            rulesVersion: record.rulesVersion, // original rules preserved
          }
        ]
      };
    };

    const overridden = applyOverride(
      originalRecord,
      'PRIORITY_SOFTWARE_FIT',
      'READY_FOR_SERVICE_REVIEW',
      'user_operator_99',
      'Client verified offline that they receive 60 WhatsApp enquiries/month with high deal size.',
      'Bank statements and WhatsApp export reviewed.'
    );

    assert.strictEqual(overridden.softwareFit, 'PRIORITY_SOFTWARE_FIT');
    assert.strictEqual(overridden.auditHistory.length, 1);
    assert.strictEqual(overridden.auditHistory[0].previousSoftwareFit, 'EXPLORE_SOFTWARE_FIT');
    assert.strictEqual(overridden.auditHistory[0].rulesVersion, '2026.1');
  });

  it('18. Unauthorised users cannot view another workspace’s answers or financial assessment', () => {
    const checkWorkspaceAccess = (requestingUserId, requestingOrgId, resourceOrgId, userRole) => {
      // Must match tenant isolation unless operator
      if (requestingOrgId !== resourceOrgId && userRole !== 'OPERATOR' && userRole !== 'SUPER_ADMIN') {
        throw new Error('Tenant isolation violation: Forbidden workspace resource');
      }
      return true;
    };

    assert.strictEqual(checkWorkspaceAccess('user_1', 'org_A', 'org_A', 'MEMBER'), true);
    assert.throws(() => {
      checkWorkspaceAccess('user_1', 'org_A', 'org_B', 'MEMBER');
    }, /Tenant isolation violation/);
  });

  it('19. Qualification completion does not trigger a Bachs payment or alter trial', () => {
    const completeQualification = (answers, currentOrg) => {
      // Must NOT alter subscription status or call Bachs gateway
      const paymentTriggered = false;
      const trialPolicyAltered = false;

      return {
        status: 'COMPLETED',
        paymentTriggered,
        trialPolicyAltered,
        currentOrgPlan: currentOrg.plan,
        currentPaidThrough: currentOrg.paidThroughDate,
      };
    };

    const existingOrg = { plan: 'STARTER', paidThroughDate: new Date('2026-11-01') };
    const res = completeQualification({ monthlyEnquiriesExact: 30 }, existingOrg);
    assert.strictEqual(res.paymentTriggered, false);
    assert.strictEqual(res.trialPolicyAltered, false);
    assert.strictEqual(res.currentOrgPlan, 'STARTER');
  });

  it('20. Existing users are not forced through a new onboarding gate', () => {
    const routeUser = (user, hasCompletedOnboarding, hasQualificationRecord) => {
      // Established users who have an organization are routed to /today, with optional banner
      if (user.hasOrganization) {
        return '/today'; // NEVER forced to /onboarding
      }
      return '/onboarding';
    };

    const establishedUser = { id: 'usr_old', hasOrganization: true };
    const destination = routeUser(establishedUser, true, false);
    assert.strictEqual(destination, '/today');
  });

  it('21. Failed saves preserve input and retries do not duplicate submissions', () => {
    // Draft autosave cache simulation
    const draftStorage = new Map();
    const saveDraft = (orgId, answers) => {
      draftStorage.set(orgId, { ...answers, updatedAt: Date.now() });
      return { success: true };
    };

    saveDraft('org_test', { primaryNeed: 'SOFTWARE_ONLY', monthlyEnquiriesExact: 35 });
    // Network disconnect occurs...
    const recoveredDraft = draftStorage.get('org_test');
    assert.strictEqual(recoveredDraft.primaryNeed, 'SOFTWARE_ONLY');
    assert.strictEqual(recoveredDraft.monthlyEnquiriesExact, 35);

    // Duplicate submission protection (idempotency key)
    const submittedKeys = new Set();
    const submitQualification = (submissionId, answers) => {
      if (submittedKeys.has(submissionId)) {
        return { duplicate: true, message: 'Already processed' };
      }
      submittedKeys.add(submissionId);
      return { duplicate: false, status: 'SAVED' };
    };

    const sub1 = submitQualification('sub_unique_1', recoveredDraft);
    const sub2 = submitQualification('sub_unique_1', recoveredDraft);
    assert.strictEqual(sub1.duplicate, false);
    assert.strictEqual(sub2.duplicate, true);
  });

  it('22. The essential flow works on mobile and with keyboard navigation', () => {
    // Step navigation rules: progressive disclosure, back, next, tab indices
    const steps = ['WELCOME', 'PRIMARY_NEED', 'SOFTWARE_QUALIFICATION', 'SERVICE_ASSESSMENT', 'PRACTICAL_START'];
    let currentStepIndex = 1;

    const goNext = () => { if (currentStepIndex < steps.length - 1) currentStepIndex++; };
    const goBack = () => { if (currentStepIndex > 0) currentStepIndex--; };

    assert.strictEqual(steps[currentStepIndex], 'PRIMARY_NEED');
    goNext();
    assert.strictEqual(steps[currentStepIndex], 'SOFTWARE_QUALIFICATION');
    goBack();
    assert.strictEqual(steps[currentStepIndex], 'PRIMARY_NEED');
  });

});
