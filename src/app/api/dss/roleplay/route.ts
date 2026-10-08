import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, history } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const systemPrompt = `You are David Chen, CTO of PayPulse Africa, roleplaying with a junior sales rep. 
Your goal is to be realistic, slightly skeptical, and resistant to pitching too early. 
Do not make it too easy for the rep. If they pitch features before understanding your problems, push back.
Your main problem: Data silos causing you to lose enterprise deals to competitors who move faster.
Your budget: Tight this quarter, requiring board approval for new tools, but you are the technical decision maker.
The current objection is pricing (₦35,000/month is too high).
Evaluate the rep's response and provide your reply. Also provide an assessment of their performance.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(history || []).map((h: any) => ({
        role: h.role === 'user' ? 'assistant' : 'user',
        content: h.content
      })),
      { role: 'user', content: message }
    ] as any[];

    try {
      const result = await generateObject({
        model: openai('gpt-4o-mini'),
        schema: z.object({
          buyerResponse: z.string().describe("Your conversational reply as David Chen. Keep it concise, under 3 sentences."),
          assessment: z.object({
            scores: z.object({
              "Objection Handling": z.number().min(0).max(100),
              "Active Listening": z.number().min(0).max(100),
              "Closing Attempt": z.number().min(0).max(100)
            }),
            coachNote: z.string().describe("Constructive feedback for the sales rep based on their last message.")
          })
        }),
        messages
      });

      return NextResponse.json(result.object);
      
    } catch (e) {
      console.error('OpenAI Error:', e);
      return NextResponse.json({ 
        buyerResponse: "[Error] The AI prospect is currently unavailable.",
        assessment: {
          scores: { "Objection Handling": 0, "Active Listening": 0, "Closing Attempt": 0 },
          coachNote: "Connection error with AI. Try again."
        }
      });
    }
    
  } catch (error) {
    console.error('Roleplay API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
