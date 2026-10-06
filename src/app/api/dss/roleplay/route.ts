import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import OpenAI from 'openai';
import { db } from '@/lib/db';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'mock-key-for-local',
});

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

    // In a real system, you would look up the specific scenario the student is playing
    const systemPrompt = `You are a B2B SaaS prospect (CTO) roleplaying with a junior sales rep. 
Your goal is to be realistic, slightly skeptical, and resistant to pitching too early. 
Do not make it too easy for the rep. If they pitch features before understanding your problems, push back.
Your main problem: Data silos causing you to lose enterprise deals to competitors who move faster.
Your budget: Tight this quarter, requiring board approval for new tools, but you are the technical decision maker.
Keep responses concise, conversational, and under 3 sentences.`;

    // Format history for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(history || []).map((h: any) => ({
        role: h.role === 'student' ? 'user' : 'assistant',
        content: h.content
      })),
      { role: 'user', content: message }
    ] as any[];

    let reply = "";

    try {
      if (process.env.OPENAI_API_KEY) {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages,
          temperature: 0.7,
        });
        reply = response.choices[0].message.content || "I see. Go on.";
      } else {
        // Fallback mock if no API key is set
        reply = "[Mock Mode - No API Key] That sounds interesting, but we don't have the budget for it right now unless you can show clear ROI.";
        await new Promise(r => setTimeout(r, 1000));
      }
    } catch (e) {
      console.error('OpenAI Error:', e);
      reply = "[Error] The AI prospect is currently unavailable.";
    }

    return NextResponse.json({ reply });
    
  } catch (error) {
    console.error('Roleplay API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
