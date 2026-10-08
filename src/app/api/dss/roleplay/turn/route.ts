import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { sessionId, message, history } = await req.json();

    const roleplaySession = await db.roleplaySession.findUnique({
      where: { id: sessionId },
      include: { scenario: true }
    });

    if (!roleplaySession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
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
