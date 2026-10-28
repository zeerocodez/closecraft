const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { PrismaClient } = require(path.resolve(process.cwd(), 'node_modules/@prisma/client'));

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

// Helper to execute query under scoped transaction-local RLS context
async function runWithContext(ctx, queryFn) {
  return await prisma.$transaction(async (tx) => {
    // Set parameterised transaction-local variables safely
    await tx.$executeRaw`
      SELECT 
        set_config('closecraft.current_user_id', COALESCE(${ctx.userId ?? ''}, ''), true),
        set_config('closecraft.current_org_id', COALESCE(${ctx.organizationId ?? ''}, ''), true),
        set_config('closecraft.current_role', COALESCE(${ctx.role ?? ''}, ''), true),
        set_config('closecraft.is_operator', ${ctx.isOperator ? 'true' : 'false'}, true),
        set_config('closecraft.is_service_role', ${ctx.isServiceRole ? 'true' : 'false'}, true);
    `;

    // Drop to unprivileged role unless service_role or operator
    if (!ctx.isServiceRole && !ctx.isOperator) {
      await tx.$executeRaw`SET LOCAL ROLE closecraft_app;`;
    }

    return await queryFn(tx);
  }, { maxWait: 20000, timeout: 60000 });
}

describe('Closecraft Database Row-Level Security (RLS) Acceptance Tests', () => {
  // Test Fixtures
  const orgAId = `test_org_a_${Date.now()}`;
  const orgBId = `test_org_b_${Date.now()}`;

  const userAOwnerId = `usr_a_owner_${Date.now()}`;
  const userAMemberId = `usr_a_member_${Date.now()}`;
  const userAProfId = `usr_a_prof_${Date.now()}`;

  const userBOwnerId = `usr_b_owner_${Date.now()}`;

  const leadA1Id = `lead_a_1_${Date.now()}`;
  const leadA2UnassignedId = `lead_a_2_${Date.now()}`;
  const leadB1Id = `lead_b_1_${Date.now()}`;

  const contactAId = `cont_a_${Date.now()}`;
  const contactBId = `cont_b_${Date.now()}`;

  const invoiceAId = `inv_a_${Date.now()}`;
  const qualAId = `qual_a_${Date.now()}`;

  before(async () => {
    // Connect with retry
    for (let i = 0; i < 5; i++) {
      try {
        await prisma.$connect();
        break;
      } catch (e) {
        await new Promise(r => setTimeout(r, 1500));
      }
    }

    // 1. Create Organizations
    await prisma.organization.createMany({
      data: [
        { id: orgAId, name: 'Alpha Agency Ltd', slug: `alpha-${Date.now()}` },
        { id: orgBId, name: 'Beta Consulting Ltd', slug: `beta-${Date.now()}` }
      ]
    });

    // 2. Create Users
    await prisma.user.createMany({
      data: [
        { id: userAOwnerId, email: `${userAOwnerId}@example.com`, name: 'Owner Alpha' },
        { id: userAMemberId, email: `${userAMemberId}@example.com`, name: 'Member Alpha' },
        { id: userAProfId, email: `${userAProfId}@example.com`, name: 'Closer Somto' },
        { id: userBOwnerId, email: `${userBOwnerId}@example.com`, name: 'Owner Beta' }
      ]
    });

    // 3. Create Memberships
    await prisma.organizationMember.createMany({
      data: [
        { id: `mem_${userAOwnerId}`, userId: userAOwnerId, organizationId: orgAId, role: 'OWNER' },
        { id: `mem_${userAMemberId}`, userId: userAMemberId, organizationId: orgAId, role: 'MEMBER' },
        { id: `mem_${userAProfId}`, userId: userAProfId, organizationId: orgAId, role: 'EXTERNAL_PROFESSIONAL' },
        { id: `mem_${userBOwnerId}`, userId: userBOwnerId, organizationId: orgBId, role: 'OWNER' }
      ]
    });

    // 4. Create Contacts
    await prisma.contact.createMany({
      data: [
        { id: contactAId, organizationId: orgAId, name: 'Alpha Client Contact' },
        { id: contactBId, organizationId: orgBId, name: 'Beta Client Contact' }
      ]
    });

    // 5. Create Leads
    await prisma.lead.createMany({
      data: [
        {
          id: leadA1Id,
          organizationId: orgAId,
          name: 'High Intent Lead Assigned to Somto',
          email: 'lead_a1@prospect.ng',
          assignedUserId: userAProfId,
          contactId: contactAId,
          status: 'NEW'
        },
        {
          id: leadA2UnassignedId,
          organizationId: orgAId,
          name: 'Unassigned Internal Alpha Lead',
          email: 'lead_a2@prospect.ng',
          assignedUserId: null,
          status: 'NEW'
        },
        {
          id: leadB1Id,
          organizationId: orgBId,
          name: 'Beta Secret Lead',
          email: 'lead_b1@prospect.ng',
          contactId: contactBId,
          status: 'NEW'
        }
      ]
    });

    // 6. Create Bachs Invoice
    await prisma.bachsInvoice.create({
      data: {
        id: invoiceAId,
        organizationId: orgAId,
        invoiceNumber: `INV-TEST-${Date.now()}`,
        type: 'SOFTWARE_SUBSCRIPTION',
        amount: 20000.0,
        currency: 'NGN',
        status: 'ISSUED'
      }
    });

    // 7. Create Workspace Qualification with Reviewer Notes
    await prisma.workspaceQualification.create({
      data: {
        id: qualAId,
        organizationId: orgAId,
        userId: userAOwnerId,
        primaryNeed: 'SOFTWARE_ORGANIZING',
        status: 'COMPLETED',
        softwareFit: 'PRIORITY_SOFTWARE_FIT',
        reviewerPrivateNotes: 'OPERATOR ONLY: High potential enterprise account'
      }
    });
  });

  after(async () => {
    // Clean up fixtures
    try {
      await prisma.bachsInvoice.deleteMany({ where: { organizationId: { in: [orgAId, orgBId] } } });
      await prisma.workspaceQualification.deleteMany({ where: { organizationId: { in: [orgAId, orgBId] } } });
      await prisma.lead.deleteMany({ where: { organizationId: { in: [orgAId, orgBId] } } });
      await prisma.contact.deleteMany({ where: { organizationId: { in: [orgAId, orgBId] } } });
      await prisma.organizationMember.deleteMany({ where: { organizationId: { in: [orgAId, orgBId] } } });
      await prisma.user.deleteMany({ where: { id: { in: [userAOwnerId, userAMemberId, userAProfId, userBOwnerId] } } });
      await prisma.organization.deleteMany({ where: { id: { in: [orgAId, orgBId] } } });
    } catch (e) {
      // Ignore cleanup error
    } finally {
      await prisma.$disconnect();
    }
  });

  // 1. Cross-Tenant Read Isolation
  it('1. Organisation A cannot read records belonging to Organisation B', async () => {
    const leadsForA = await runWithContext({
      organizationId: orgAId,
      userId: userAOwnerId,
      role: 'OWNER'
    }, async (tx) => {
      return await tx.lead.findMany();
    });

    // Must see only Org A leads (leadA1Id, leadA2UnassignedId) and NEVER leadB1Id
    const foundB = leadsForA.some(l => l.id === leadB1Id || l.organizationId === orgBId);
    assert.strictEqual(foundB, false, 'Organisation A must NOT see any records from Organisation B');
    assert.strictEqual(leadsForA.length >= 2, true, 'Organisation A sees its own leads');
  });

  // 2. Cross-Tenant Insert Protection
  it('2. Cross-organisation inserts fail validation at the database level', async () => {
    await assert.rejects(
      async () => {
        await runWithContext({
          organizationId: orgAId,
          userId: userAOwnerId,
          role: 'OWNER'
        }, async (tx) => {
          // Attempting to insert a lead belonging to orgB while authenticated as orgA
          await tx.lead.create({
            data: {
              organizationId: orgBId,
              name: 'Malicious Injected Lead',
              email: 'hacked@beta.ng'
            }
          });
        });
      },
      /violates row-level security policy|Access Denied/i,
      'Inserting record into another organization must fail RLS WITH CHECK'
    );
  });

  // 3. Record Hijacking / Tenant Transfer Prevention
  it('3. Users cannot transfer records to another organisation via UPDATE', async () => {
    await assert.rejects(
      async () => {
        await runWithContext({
          organizationId: orgAId,
          userId: userAOwnerId,
          role: 'OWNER'
        }, async (tx) => {
          // Attempting to change organizationId from orgA to orgB on a lead with no contact
          await tx.lead.update({
            where: { id: leadA2UnassignedId },
            data: {
              organizationId: orgBId
            }
          });
        });
      },
      /violates row-level security policy|Cross-Tenant/i,
      'Updating a record organizationId to another organization must fail RLS WITH CHECK'
    );
  });

  // 4. Privilege Escalation Prevention (Self-Promotion)
  it('4. Ordinary members cannot promote themselves to OWNER or ADMIN', async () => {
    await assert.rejects(
      async () => {
        await runWithContext({
          organizationId: orgAId,
          userId: userAMemberId,
          role: 'MEMBER'
        }, async (tx) => {
          await tx.organizationMember.update({
            where: {
              userId_organizationId: {
                userId: userAMemberId,
                organizationId: orgAId
              }
            },
            data: {
              role: 'OWNER'
            }
          });
        });
      },
      /Access Denied: Ordinary workspace members cannot alter member roles|violates row-level security/i,
      'Trigger/policy must block ordinary member from promoting themselves'
    );
  });

  // 5. External Professional Boundary
  it('5. External professionals cannot read unassigned opportunities within the same organisation', async () => {
    const profLeads = await runWithContext({
      organizationId: orgAId,
      userId: userAProfId,
      role: 'EXTERNAL_PROFESSIONAL'
    }, async (tx) => {
      return await tx.lead.findMany();
    });

    const hasAssigned = profLeads.some(l => l.id === leadA1Id);
    const hasUnassigned = profLeads.some(l => l.id === leadA2UnassignedId);

    assert.strictEqual(hasAssigned, true, 'External professional can read their assigned lead');
    assert.strictEqual(hasUnassigned, false, 'External professional must NOT read unassigned leads');
  });

  // 6. Fail-Closed on Missing Request Context
  it('6. Missing request context fails closed (returns 0 private rows)', async () => {
    const anonymousLeads = await runWithContext({
      organizationId: null,
      userId: null,
      role: null
    }, async (tx) => {
      return await tx.lead.findMany();
    });

    assert.strictEqual(anonymousLeads.length, 0, 'Anonymous query without context must return 0 private rows');
  });

  // 7. Connection Pool Context Reset Verification
  it('7. Transaction-local variables do not leak across pooled connections', async () => {
    // 1. Transaction A sets context
    await runWithContext({
      organizationId: orgAId,
      userId: userAOwnerId,
      role: 'OWNER'
    }, async (tx) => {
      const org = await tx.$queryRaw`SELECT closecraft.current_org_id() as oid;`;
      assert.strictEqual(org[0].oid, orgAId);
    });

    // 2. Query outside transaction must have empty context
    const cleanContext = await prisma.$queryRaw`
      SELECT 
        closecraft.current_org_id() as oid,
        closecraft.current_user_id() as uid;
    `;
    assert.strictEqual(cleanContext[0].oid, null, 'Context must be completely null/empty outside transaction');
    assert.strictEqual(cleanContext[0].uid, null, 'User ID must be completely null/empty outside transaction');
  });

  // 8. Payment Settlement Tamper-Proofing
  it('8. Ordinary workspace owners cannot mark invoices as PAID without service-role webhook', async () => {
    await assert.rejects(
      async () => {
        await runWithContext({
          organizationId: orgAId,
          userId: userAOwnerId,
          role: 'OWNER'
        }, async (tx) => {
          // Malicious attempt by client owner to mark their own invoice as PAID
          await tx.bachsInvoice.update({
            where: { id: invoiceAId },
            data: { status: 'PAID' }
          });
        });
      },
      /Access Denied: Invoices can only be marked as paid through verified server-side payment webhooks/i,
      'Marking an invoice paid without service-role must be rejected by database trigger'
    );
  });

  // 9. Cross-Tenant Foreign Key Relationship Integrity
  it('9. Attaching an enquiry to another organisation contact fails database constraint', async () => {
    await assert.rejects(
      async () => {
        await runWithContext({
          organizationId: orgAId,
          userId: userAOwnerId,
          role: 'OWNER'
        }, async (tx) => {
          // Attaching Org A lead to Org B contact
          await tx.lead.create({
            data: {
              organizationId: orgAId,
              name: 'FK Attack Lead',
              email: 'fk_attack@test.ng',
              contactId: contactBId // Belongs to orgB!
            }
          });
        });
      },
      /Cross-Tenant Relationship Violation: Associated contact does not belong to the same organization/i,
      'Trigger must block associating a lead with another organization contact'
    );
  });

  // 10. Sensitive Column Protection (Reviewer Private Notes)
  it('10. Sensitive reviewer private notes cannot be modified by non-operators', async () => {
    await assert.rejects(
      async () => {
        await runWithContext({
          organizationId: orgAId,
          userId: userAOwnerId,
          role: 'OWNER'
        }, async (tx) => {
          await tx.workspaceQualification.update({
            where: { id: qualAId },
            data: { reviewerPrivateNotes: 'Client attempting to overwrite internal review' }
          });
        });
      },
      /Access Denied: Only authorized platform operators can modify reviewer private notes/i,
      'Non-operator must not modify reviewerPrivateNotes'
    );
  });

  // 11. Service Role Retains Required Access
  it('11. Service role (payment webhooks & background workers) can fulfill invoices and manage records', async () => {
    const updated = await runWithContext({
      isServiceRole: true
    }, async (tx) => {
      return await tx.bachsInvoice.update({
        where: { id: invoiceAId },
        data: {
          status: 'PAID',
          paidAt: new Date()
        }
      });
    });

    assert.strictEqual(updated.status, 'PAID', 'Verified webhook service role must be permitted to mark invoices paid');
  });
});
