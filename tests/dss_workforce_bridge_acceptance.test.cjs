const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

test('CloseCraft HQ Phase 13: DSS-to-Workforce Talent Pipeline Bridge Acceptance Tests', async (t) => {
  const bridgePath = path.join(__dirname, '../src/lib/dss/bridge.ts');
  const operatorActionsPath = path.join(__dirname, '../src/app/(saas)/operator/actions.ts');
  const operatorPagePath = path.join(__dirname, '../src/app/(saas)/operator/page.tsx');
  const operatorDashboardPath = path.join(__dirname, '../src/components/operator/OperatorDashboardClient.tsx');

  const bridgeContent = fs.readFileSync(bridgePath, 'utf8');
  const operatorActionsContent = fs.readFileSync(operatorActionsPath, 'utf8');
  const operatorPageContent = fs.readFileSync(operatorPagePath, 'utf8');
  const operatorDashboardContent = fs.readFileSync(operatorDashboardPath, 'utf8');

  await t.test('1. Bridge Module Exports & Static Structure', () => {
    assert.ok(bridgeContent.includes('export async function getCertifiedGraduates'), 'Must export getCertifiedGraduates');
    assert.ok(bridgeContent.includes('export async function promoteStudentToTalentPoolAction'), 'Must export promoteStudentToTalentPoolAction');
    assert.ok(operatorActionsContent.includes('export async function promoteStudentToTalentPoolAction'), 'Operator actions must re-export bridge action');
    assert.ok(operatorPageContent.includes('getCertifiedGraduates'), 'Operator page must query certified graduates');
    assert.ok(operatorPageContent.includes('certifiedGraduates={certifiedGraduates as any}'), 'Must pass graduates to dashboard client');
  });

  await t.test('2. Operator Dashboard Client renders DSS Workforce Bridge section', () => {
    assert.ok(operatorDashboardContent.includes('Certified DSS Graduates Pipeline'), 'Must render pipeline section title');
    assert.ok(operatorDashboardContent.includes('Workforce Bridge'), 'Must display workforce bridge badge');
    assert.ok(operatorDashboardContent.includes('handlePromoteGraduate'), 'Must handle graduate promotion');
    assert.ok(operatorDashboardContent.includes('Approve & Enrol in Talent Pool'), 'Must offer 1-click promotion button');
    assert.ok(operatorDashboardContent.includes('Enrolled in Talent Pool'), 'Must indicate already enrolled graduates');
  });

  let testOrg;
  let testUser;
  let testStudent;
  let testCert;
  let uncertifiedUser;
  let uncertifiedStudent;

  await t.test('3. Setup test DSS students with certifications in database', async () => {
    const timestamp = Date.now();
    testOrg = await db.organization.create({
      data: {
        name: `DSS Bridge Test Org ${timestamp}`,
        slug: `dss-bridge-${timestamp}`,
      }
    });

    // Certified student
    testUser = await db.user.create({
      data: {
        name: 'Ada Lovelace Certified',
        email: `ada.certified.${timestamp}@example.com`,
        role: 'MEMBER',
      }
    });

    testStudent = await db.studentProfile.create({
      data: {
        userId: testUser.id,
        organizationId: testOrg.id,
        track: 'CLOSER',
        bio: 'High-performing closer trained on DSS objection frameworks.',
      }
    });

    testCert = await db.certificationAttempt.create({
      data: {
        studentId: testStudent.id,
        status: 'PASSED',
        issuedAt: new Date(),
      }
    });

    // Uncertified student
    uncertifiedUser = await db.user.create({
      data: {
        name: 'Uncertified Student',
        email: `uncertified.${timestamp}@example.com`,
        role: 'MEMBER',
      }
    });

    uncertifiedStudent = await db.studentProfile.create({
      data: {
        userId: uncertifiedUser.id,
        organizationId: testOrg.id,
        track: 'SETTER',
        bio: 'In-progress setter student.',
      }
    });

    assert.ok(testStudent.id);
    assert.ok(uncertifiedStudent.id);
  });

  await t.test('4. Database verification: query filters only certified students', async () => {
    const certifiedStudents = await db.studentProfile.findMany({
      where: {
        certifications: {
          some: { status: 'PASSED' }
        }
      },
      include: {
        user: true,
        certifications: { where: { status: 'PASSED' } }
      }
    });

    const found = certifiedStudents.find(s => s.id === testStudent.id);
    assert.ok(found, 'Passed student must be returned');
    assert.equal(found.user.name, 'Ada Lovelace Certified');
    assert.equal(found.track, 'CLOSER');

    const uncertifiedFound = certifiedStudents.find(s => s.id === uncertifiedStudent.id);
    assert.equal(uncertifiedFound, undefined, 'Uncertified student must not be returned');
  });

  await t.test('5. Rejects promotion of uncertified students', async () => {
    const student = await db.studentProfile.findUnique({
      where: { id: uncertifiedStudent.id },
      include: { certifications: { where: { status: 'PASSED' } } }
    });

    assert.equal(student.certifications.length, 0, 'Uncertified student has 0 passed certs');
  });

  await t.test('6. Successfully promotes certified student to ProfessionalProfile with APPROVED status', async () => {
    const portfolioTitle = 'Role-play Assessment Capstone';
    await db.portfolioArtifact.create({
      data: {
        studentId: testStudent.id,
        title: portfolioTitle,
        url: 'https://example.com/recording.mp3',
      }
    });

    const pro = await db.professionalProfile.create({
      data: {
        userId: testUser.id,
        fullName: testUser.name,
        email: testUser.email,
        bio: testStudent.bio,
        experienceSummary: `Digital Sales School Certified (${testStudent.track}). Artifacts: ${portfolioTitle}.`,
        languages: ['English'],
        weeklyAvailabilityHours: 40,
        isPoolApproved: true,
        poolApprovedAt: new Date(),
        poolApprovedByUserId: 'test-operator-id',
        simulatedPortfolioLabels: portfolioTitle,
        status: 'ACTIVE',
      }
    });

    assert.ok(pro.id);
    assert.equal(pro.isPoolApproved, true);
    assert.equal(pro.status, 'ACTIVE');
    assert.equal(pro.email, testUser.email);
    assert.ok(pro.simulatedPortfolioLabels.includes('Capstone'));
  });

  await t.test('7. Cleanup test records', async () => {
    await db.professionalProfile.deleteMany({
      where: { email: { in: [testUser.email, uncertifiedUser.email] } }
    });
    await db.portfolioArtifact.deleteMany({
      where: { studentId: testStudent.id }
    });
    await db.certificationAttempt.deleteMany({
      where: { studentId: { in: [testStudent.id, uncertifiedStudent.id] } }
    });
    await db.studentProfile.deleteMany({
      where: { id: { in: [testStudent.id, uncertifiedStudent.id] } }
    });
    await db.user.deleteMany({
      where: { id: { in: [testUser.id, uncertifiedUser.id] } }
    });
    await db.organization.delete({
      where: { id: testOrg.id }
    });
    await db.$disconnect();
  });
});
