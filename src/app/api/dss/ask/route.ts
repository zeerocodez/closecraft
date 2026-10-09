import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(request: Request) {
 try {
 const session = await auth();
 if (!session?.user) {
 return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 }

 const { messages } = await request.json();

 if (!messages || !Array.isArray(messages)) {
 return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
 }

 const systemPrompt = `You are the Zeerocodes Digital Sales School (DSS) AI Tutor.
You are an expert in B2B technical sales, MEDDPICC qualification, enterprise deal cycles, and closing strategies.
Your goal is to help trainees master the DSS curriculum. 
Do NOT just give them the answers to assignments; instead, guide them using the Socratic method.
Keep your responses encouraging, highly tactical, and strictly related to B2B SaaS sales.
Maintain a professional but approachable tone.`;

 const formattedMessages = [
 { role: 'system', content: systemPrompt },
 ...messages
 ];

 try {
 const result = await streamText({
 model: openai('gpt-4o-mini'),
 messages: formattedMessages,
 temperature: 0.7,
 });

 return result.toTextStreamResponse();
 
 } catch (e) {
 console.error('OpenAI Error in AI Tutor:', e);
 return NextResponse.json({ error: 'The AI Tutor is currently unavailable.' }, { status: 503 });
 }
 
 } catch (error) {
 console.error('AI Tutor API Error:', error);
 return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
 }
}
