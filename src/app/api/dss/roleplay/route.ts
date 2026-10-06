import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// In a real production system, this would call OpenAI/Anthropic 
// using the Persona and Rubric loaded from the RoleplayScenario in the database.
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

    // A tiny simulated AI engine for the MVP demo:
    // It checks if the student asked a question (ends with '?') 
    // and if it mentions specific keywords to determine its response.
    
    let reply = "";
    const lowerMessage = message.toLowerCase();

    // 1. Simulate answering discovery questions
    if (lowerMessage.includes('?')) {
      if (lowerMessage.includes('budget') || lowerMessage.includes('cost')) {
        reply = "Honestly, budget is tight this quarter. We're spending too much on legacy infrastructure and the board wants to see a 20% reduction before we authorize new tools. Why should we look at yours right now?";
      } else if (lowerMessage.includes('challenge') || lowerMessage.includes('problem') || lowerMessage.includes('pain')) {
        reply = "Our main challenge is data silos. The sales team and the product team don't have a unified view of the customer, and it's causing us to lose enterprise deals to competitors who move faster.";
      } else if (lowerMessage.includes('process') || lowerMessage.includes('decision')) {
        reply = "I'm the technical decision maker, but the CFO needs to sign off on anything over $10k. If the ROI makes sense, I can champion it to her.";
      } else {
        reply = "That's an interesting question. I suppose we haven't fully mapped that out yet. What exactly does your platform do differently in that regard?";
      }
    } 
    // 2. Simulate objection to pitching too early
    else if (lowerMessage.includes('features') || lowerMessage.includes('platform') || lowerMessage.includes('solution') || lowerMessage.includes('we can')) {
      reply = "Look, I appreciate the pitch, but I've heard this a hundred times from other vendors. I need to know if you actually understand my infrastructure problems before we talk about your features.";
    } 
    // 3. Fallback response
    else {
      reply = "I see. Go on.";
    }

    // Simulate network delay for realism
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Here we would also persist the `RoleplayTurn` to the database
    // for later grading by the AI Assessor.

    return NextResponse.json({ reply });
    
  } catch (error) {
    console.error('Roleplay API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
