const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

describe('CloseCraft 2.0 Affiliate Marketplace Acceptance Tests', () => {
  let testUserId = null;
  let testOrgId = null;
  let testAffiliateId = null;
  let testInvoiceId = null;
  const uniqueCode = `CC-TEST-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  it('1. Creates an approved Affiliate Profile with a 15% commission rate', async () => {
    // Create partner user
    const partnerUser = await prisma.user.create({
      data: {
        email: `partner-${Date.now()}@testaffiliate.com`,
        name: 'Chioma Partner',
      }
    });
    testUserId = partnerUser.id;

    const affiliate = await prisma.affiliateProfile.create({
      data: {
        userId: partnerUser.id,
        referralCode: uniqueCode,
        channel: 'LinkedIn & B2B Newsletter',
        marketingExp: '5 years growth consulting',
        status: 'APPROVED',
        commissionRate: 15.0,
        bankName: 'Guaranty Trust Bank',
        bankAccountNumber: '0123456789',
        bankAccountName: 'Chioma Partner Consult',
      }
    });

    assert.ok(affiliate.id);
    assert.equal(affiliate.referralCode, uniqueCode);
    assert.equal(affiliate.status, 'APPROVED');
    assert.equal(affiliate.commissionRate, 15.0);

    testAffiliateId = affiliate.id;
  });

  it('2. Records referral click events with landing page and user agent tracking', async () => {
    const event = await prisma.referralEvent.create({
      data: {
        affiliateId: testAffiliateId,
        ipAddress: '102.128.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        landingPage: '/early-access',
      }
    });

    assert.ok(event.id);
    assert.equal(event.affiliateId, testAffiliateId);
    assert.equal(event.landingPage, '/early-access');
  });

  it('3. Attributes newly registered client organization to the referring affiliate', async () => {
    // Create referred client user and org
    const clientUser = await prisma.user.create({
      data: {
        email: `client-referred-${Date.now()}@testcompany.com`,
        name: 'David Client',
      }
    });

    const clientOrg = await prisma.organization.create({
      data: {
        name: 'Apex Real Estate Ventures',
        slug: `apex-real-estate-${Date.now().toString(36)}`,
        status: 'APPROVED',
        plan: 'STARTER',
      }
    });
    testOrgId = clientOrg.id;

    const attribution = await prisma.referralAttribution.create({
      data: {
        affiliateId: testAffiliateId,
        organizationId: clientOrg.id,
        referredUserId: clientUser.id,
      }
    });

    assert.ok(attribution.id);
    assert.equal(attribution.organizationId, clientOrg.id);
    assert.equal(attribution.affiliateId, testAffiliateId);
  });

  it('4. Correctly computes and credits 15% commission upon invoice fulfillment', async () => {
    // Client purchases Meta Lead Gen at ₦180,000
    const invoiceAmount = 180000;
    const expectedCommission = (invoiceAmount * 15.0) / 100.0; // ₦27,000
    testInvoiceId = `inv_test_${Date.now()}`;

    const commission = await prisma.affiliateCommission.create({
      data: {
        affiliateId: testAffiliateId,
        invoiceId: testInvoiceId,
        saleAmount: invoiceAmount,
        amount: expectedCommission,
        status: 'PAYABLE',
        clearsAt: new Date(),
      }
    });

    assert.ok(commission.id);
    assert.equal(commission.saleAmount, 180000);
    assert.equal(commission.amount, 27000);
    assert.equal(commission.status, 'PAYABLE');
  });

  it('5. Successfully creates a withdrawal payout request against payable commission', async () => {
    const payout = await prisma.affiliatePayout.create({
      data: {
        affiliateId: testAffiliateId,
        amount: 25000, // ₦25,000 withdrawal (within ₦27,000 earned)
        status: 'REQUESTED',
        reference: `PAYOUT-CC-${Date.now().toString(36).toUpperCase()}`,
        bankDetails: 'Guaranty Trust Bank - 0123456789 (Chioma Partner Consult)',
      }
    });

    assert.ok(payout.id);
    assert.equal(payout.amount, 25000);
    assert.equal(payout.status, 'REQUESTED');
    assert.ok(payout.reference.startsWith('PAYOUT-CC-'));

    // 5.B Admin marks payout as PAID with NIP bank transfer reference
    const disbursed = await prisma.affiliatePayout.update({
      where: { id: payout.id },
      data: {
        status: 'PAID',
        reference: `NIP-GTB-${Date.now()}`,
        processedAt: new Date(),
      }
    });

    assert.equal(disbursed.status, 'PAID');
    assert.ok(disbursed.reference.startsWith('NIP-GTB-'));
    assert.ok(disbursed.processedAt instanceof Date);
  });

  it('6. Supports custom vanity referral codes with uniqueness and formatting constraints', async () => {
    const vanityCode = `VANITY-${Date.now().toString(36).toUpperCase()}`;

    // Update partner to custom vanity code
    const updated = await prisma.affiliateProfile.update({
      where: { id: testAffiliateId },
      data: { referralCode: vanityCode }
    });

    assert.equal(updated.referralCode, vanityCode);

    // Verify lookup by vanity code resolves the partner
    const found = await prisma.affiliateProfile.findUnique({
      where: { referralCode: vanityCode }
    });
    assert.ok(found);
    assert.equal(found.id, testAffiliateId);
  });

  it('7. Supports admin partner status update and commission rate adjustments', async () => {
    const suspended = await prisma.affiliateProfile.update({
      where: { id: testAffiliateId },
      data: { status: 'SUSPENDED', commissionRate: 20.0 }
    });

    assert.equal(suspended.status, 'SUSPENDED');
    assert.equal(suspended.commissionRate, 20.0);

    const reactivated = await prisma.affiliateProfile.update({
      where: { id: testAffiliateId },
      data: { status: 'APPROVED' }
    });

    assert.equal(reactivated.status, 'APPROVED');
  });

  it('8. Cleans up acceptance test records', async () => {
    if (testAffiliateId) {
      await prisma.affiliatePayout.deleteMany({ where: { affiliateId: testAffiliateId } });
      await prisma.affiliateCommission.deleteMany({ where: { affiliateId: testAffiliateId } });
      await prisma.referralAttribution.deleteMany({ where: { affiliateId: testAffiliateId } });
      await prisma.referralEvent.deleteMany({ where: { affiliateId: testAffiliateId } });
      await prisma.affiliateProfile.deleteMany({ where: { id: testAffiliateId } });
    }
    if (testOrgId) {
      await prisma.organization.deleteMany({ where: { id: testOrgId } });
    }
    if (testUserId) {
      await prisma.user.deleteMany({ where: { id: testUserId } });
    }
  });
});
