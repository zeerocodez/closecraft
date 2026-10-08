// @ts-nocheck
import { inngest } from './client';
import { db } from '@/lib/db';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

// Background Job: AI Assessor for DSS Submissions
export const gradeSubmission = inngest.createFunction(
  { id: 'grade-dss-submission' },
  { event: 'dss/assessment.submitted' },
  async ({ event, step }) => {
    const { submissionId, studentId, moduleId } = event.data;

    // 1. Fetch submission and rubric
    const submission = await step.run('fetch-submission', async () => {
      return await db.submission.findUnique({
        where: { id: submissionId },
        include: { assignment: true }
      });
    });

    if (!submission) throw new Error("Submission not found");

    // 2. Grade using AI
    const assessment = await step.run('ai-grading', async () => {
      const result = await generateObject({
        model: openai('gpt-4o'),
        schema: z.object({
          score: z.number().min(0).max(100),
          feedback: z.string(),
          passed: z.boolean(),
          identifiedWeaknesses: z.array(z.string())
        }),
        system: `You are an expert Sales Coach grading a trainee's assignment. 
                 Assignment Context: ${submission.assignment.description}
                 Rubric: ${submission.assignment.rubric || 'Standard B2B Sales evaluation'}`,
        prompt: `Evaluate this submission from the student: \n\n${submission.content}`
      });

      return result.object;
    });

    // 3. Save Grade & Potentially Unlock Next Module
    await step.run('save-grade-and-unlock', async () => {
      await db.assessmentScore.create({
        data: {
          score: assessment.score,
          feedback: assessment.feedback,
          passed: assessment.passed,
          submissionId,
          studentId
        }
      });

      if (assessment.passed) {
        // Find next module and unlock it
        const currentModule = await db.module.findUnique({ where: { id: moduleId }});
        if (currentModule) {
          const nextModule = await db.module.findFirst({
            where: { courseId: currentModule.courseId, orderIndex: { gt: currentModule.orderIndex } },
            orderBy: { orderIndex: 'asc' }
          });

          if (nextModule) {
            await db.moduleProgress.upsert({
              where: { studentId_moduleId: { studentId, moduleId: nextModule.id } },
              update: { isUnlocked: true },
              create: { studentId, moduleId: nextModule.id, isUnlocked: true }
            });
          }
        }
      }
    });

    return { success: true, assessment };
  }
);
