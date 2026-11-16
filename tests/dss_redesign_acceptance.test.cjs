const { describe, it: test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

describe('CloseCraft HQ Phase 6: Digital Sales School (DSS) & LMS Redesign Acceptance Tests', () => {

  test('1. Trainee Navigation provides mobile-responsive drawer and desktop sidebar', () => {
    const navClientPath = path.join(ROOT, 'src/app/dss/(trainee)/TraineeNavClient.tsx');
    const layoutPath = path.join(ROOT, 'src/app/dss/(trainee)/layout.tsx');
    assert.ok(fs.existsSync(navClientPath), 'TraineeNavClient must exist');
    assert.ok(fs.existsSync(layoutPath), 'Trainee layout must exist');

    const navContent = fs.readFileSync(navClientPath, 'utf8');
    const layoutContent = fs.readFileSync(layoutPath, 'utf8');

    // Mobile drawer & header
    assert.match(navContent, /md:hidden flex items-center justify-between/, 'Mobile header bar present');
    assert.match(navContent, /mobileMenuOpen/, 'State for mobile drawer menu toggle');
    assert.match(navContent, /translate-x-full md:translate-x-0/, 'Responsive slide-over drawer transition');

    // Core links
    assert.match(navContent, /\/dss\/dashboard/, 'Dashboard link');
    assert.match(navContent, /\/dss\/courses/, 'Courses link');
    assert.match(navContent, /\/dss\/roleplay/, 'Practice Studio link');
    assert.match(navContent, /\/dss\/examinations/, 'Assessments link');

    // Dual-role workspace switcher
    assert.match(navContent, /businessMembership/, 'Supports workspace switching for dual-role users');
    assert.match(layoutContent, /TraineeNavClient/, 'Layout wraps trainee experience in TraineeNavClient');
  });

  test('2. Student Hub Dashboard answers "What should I do right now?" with Attention Pod', () => {
    const dashPath = path.join(ROOT, 'src/app/dss/(trainee)/dashboard/page.tsx');
    assert.ok(fs.existsSync(dashPath), 'Dashboard page must exist');
    const content = fs.readFileSync(dashPath, 'utf8');

    // Attention Pod
    assert.match(content, /Recommended Next Action/, 'Attention Pod answers what to do right now');
    assert.match(content, /Resume Lesson/, 'Direct resume CTA button');
    assert.match(content, /AI Buyer Practice/, 'AI practice shortcut');

    // 4-Sprint curriculum roadmap
    assert.match(content, /Curriculum Roadmap \(4-Week Sprint\)/, 'Visual 4-sprint progression track');
    assert.match(content, /SPRINT_WEEKS/, 'Imports and maps sprint weeks');

    // AI roleplay and competency radar
    assert.match(content, /Practice Studio (?:&|&amp;) AI Buyer Roleplay/, 'AI Practice Studio widget');
    assert.match(content, /DSS 8-Criterion/, 'Displays 8-criterion rubric reference');
    assert.match(content, /16 pts/, 'Displays 16-point scale');
  });

  test('3. Course Directory and Curriculum enforces sequential prerequisite locking', () => {
    const coursesPath = path.join(ROOT, 'src/app/dss/(trainee)/courses/page.tsx');
    const courseDetailPath = path.join(ROOT, 'src/app/dss/(trainee)/courses/[slug]/page.tsx');
    assert.ok(fs.existsSync(coursesPath), 'Courses page must exist');
    assert.ok(fs.existsSync(courseDetailPath), 'Course detail page must exist');

    const coursesContent = fs.readFileSync(coursesPath, 'utf8');
    const detailContent = fs.readFileSync(courseDetailPath, 'utf8');

    assert.match(coursesContent, /Training Programs (?:&|&amp;) Courses/, 'Editorial curriculum catalog header');
    assert.match(coursesContent, /Modules/, 'Displays module counts');

    // Gated sequential progression
    assert.match(detailContent, /Sequential Progression Gated \(N &rarr; N\+1\)/, 'States sequential gating rule');
    assert.match(detailContent, /isLocked/, 'Evaluates lock status dynamically');
    assert.match(detailContent, /Module Locked/, 'Shows locked visual badge');
  });

  test('4. Distraction-free Module Player supports video, lesson locking, and AI practice launch', () => {
    const modulePath = path.join(ROOT, 'src/app/dss/(trainee)/module/[id]/page.tsx');
    assert.ok(fs.existsSync(modulePath), 'Module player page must exist');
    const content = fs.readFileSync(modulePath, 'utf8');

    // Sequential lesson locking
    assert.match(content, /const isLocked = index > 0 && !completedLessonIds\.has/, 'Lesson N locked until Lesson N-1 completed');
    assert.match(content, /Locked \(Sequential\)/, 'Displays sequential lock indicator');

    // Server Action
    assert.match(content, /async function completeLesson/, 'Server-authoritative completion action');
    assert.match(content, /db\.lessonProgress\.upsert/, 'Persists lesson completion server-side');
    assert.match(content, /db\.moduleProgress\.upsert/, 'Unlocks module progress upon completing all lessons');

    // Deep link to practice drill
    assert.match(content, /\/dss\/roleplay\?scenarioId=/, 'Deep links directly to matching AI scenario');
    assert.match(content, /Practise this skill/, 'Shows practice CTA');
  });

  test('5. Practice Studio integrates 8-criterion rubric and multi-turn buyer simulation', () => {
    const roleplayPath = path.join(ROOT, 'src/app/dss/(trainee)/roleplay/page.tsx');
    assert.ok(fs.existsSync(roleplayPath), 'Roleplay page must exist');
    const content = fs.readFileSync(roleplayPath, 'utf8');

    // Sprints
    assert.match(content, /Sprint 1: Positioning (?:&|&amp;) Diagnosis/, 'Sprint 1 filter');
    assert.match(content, /Sprint 4: Closing (?:&|&amp;) Capstone/, 'Sprint 4 filter');

    // 8-criterion rubric passing threshold
    assert.match(content, /LaunchDrillButton/, 'Embeds interactive drill launcher');
    assert.match(content, /16/, '16-point scale');
    assert.match(content, /buyerPersona/, 'Exposes realistic buyer persona context');
  });

  test('6. Examinations enforces full curriculum prerequisite and authoritative oversight', () => {
    const examPath = path.join(ROOT, 'src/app/dss/(trainee)/examinations/page.tsx');
    assert.ok(fs.existsSync(examPath), 'Examinations page must exist');
    const content = fs.readFileSync(examPath, 'utf8');

    // Prerequisite check
    assert.match(content, /const isEligible = totalModules > 0 && completedModules >= totalModules;/, 'Server-side completion verification');
    assert.match(content, /Assessment Locked/, 'Locked state when modules remain');
    assert.match(content, /Authoritative Human Oversight/, 'Human faculty review for high-stakes credentialing');
    assert.match(content, /8-Criterion Rubric|8 Rubrics/, 'References 8-criterion rubric standard');
    assert.match(content, /12\/16 Passing Score/, 'Defines 12/16 passing threshold');
  });

  test('7. Faculty & Trainer Operations provides curriculum builder and student grading desk', () => {
    const adminPath = path.join(ROOT, 'src/app/dss/admin/page.tsx');
    const studentsPath = path.join(ROOT, 'src/app/dss/admin/students/page.tsx');
    assert.ok(fs.existsSync(adminPath), 'Admin curriculum builder exists');
    assert.ok(fs.existsSync(studentsPath), 'Admin student progress desk exists');

    const adminContent = fs.readFileSync(adminPath, 'utf8');
    const studentsContent = fs.readFileSync(studentsPath, 'utf8');

    assert.match(adminContent, /DSS Faculty Portal/, 'Faculty header');
    assert.match(adminContent, /Enforce Sequential Progression/, 'Sequential gating toggle');
    assert.match(studentsContent, /Student Progress (?:&|&amp;) Grades/, 'Student tracking portal');
    assert.match(studentsContent, /Module Progress/, 'Module progress column');
    assert.match(studentsContent, /Final AI Grade/, 'Final AI grade column');
  });
});
