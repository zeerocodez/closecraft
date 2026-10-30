import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { rateLimit, clientIp } from '@/lib/rateLimit';
import { z } from 'zod';

const TurnSchema = z.object({
  sessionId: z.string().min(1),
  message: z.string().min(1, 'Message is required').max(1500, 'Message is too long'),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().max(1500)
  })).max(20).optional().default([]),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const identifier = session.user.id || clientIp(req);
    const limiter = await rateLimit(`dss-roleplay-turn:${identifier}`, 25, 5 * 60 * 1000);
    if (!limiter.allowed) {
      return NextResponse.json(
        { error: 'You are roleplaying too rapidly. Please slow down.' },
        { status: 429 }
      );
    }

    const rawBody = await req.json().catch(() => null);
    const parsed = TurnSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 });
    }

    const { sessionId, message, history } = parsed.data;

    const roleplaySession = await db.roleplaySession.findUnique({
      where: { id: sessionId },
      include: { scenario: true, student: { select: { userId: true } } }
    });

    if (!roleplaySession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Enforce resource ownership: only session owner or platform operator can submit turns
    const isOwner = roleplaySession.student?.userId === session.user.id;
    const isPrivileged = (session.user as any)?.role === 'OPERATOR' || (session.user as any)?.role === 'SUPER_ADMIN';
    if (!isOwner && !isPrivileged) {
      return NextResponse.json({ error: 'Forbidden: You do not have permission to submit turns for this session.' }, { status: 403 });
    }

    // Prepare conversation history
    const messages = [
      {
        role: 'system',
        content: `You are participating in a sales roleplay simulation. 
Persona: ${roleplaySession.scenario.buyerPersona}
Context: ${roleplaySession.scenario.context}

You must act naturally as this persona. Do not break character. 
Keep responses concise, conversational, and realistic. 
If the salesperson handles your objections well, become more receptive. 
If they fail to address your core concerns, remain skeptical.`
      },
      ...history,
      { role: 'user', content: message }
    ];

 // Get AI Persona Response
 const response = await generateText({
 model: openai('gpt-4o'),
 messages: messages as any,
 });

 // Run AI Assessor in parallel or sequentially (we'll do sequentially for simplicity, but could be a separate prompt)
 const assessorPrompt = `
 Evaluate the student's latest message in this sales roleplay.
 Criteria: ${roleplaySession.scenario.rubric}
 
 Student Message: "${message}"
 Buyer Response: "${response.text}"
 
 Provide a JSON output with the following format exactly:
 {
 "scores": {
 "Objection Handling": 85,
 "Active Listening": 90,
 "Closing Attempt": 0
 },
 "coachNote": "Short, actionable advice on what they should say next."
 }
 Only return valid JSON. Do not use markdown blocks.
 `;

 const assessmentResponse = await generateText({
 model: openai('gpt-4o'),
 prompt: assessorPrompt,
 });

 let assessment = {
 scores: { "Objection Handling": 50, "Active Listening": 50, "Closing Attempt": 0 },
 coachNote: "Keep going, focus on their pain points."
 };

 try {
 const cleanedJson = assessmentResponse.text.replace(/```json/g, '').replace(/```/g, '').trim();
 assessment = JSON.parse(cleanedJson);
 } catch (e) {
 console.error("Failed to parse assessment JSON", e);
 }

 // Save turns to DB (Optional, skipping detailed DB write for now to focus on logic)
 // await db.roleplayTurn.create({ ... })

 return NextResponse.json({
 success: true,
 buyerResponse: response.text,
 assessment
 });

 } catch (error: any) {
 console.error("Roleplay AI Error:", error);
 return NextResponse.json({ success: false, error: error.message }, { status: 500 });
 }
}
