import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { extractCommitmentsFromText } from '@/lib/commitments/commitmentService';

export async function POST(req: Request) {
  try {
    const session = await auth();
    const organizationId = (session as any)?.organizationId;
    if (!session?.user?.id || !organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body || !body.text || typeof body.text !== 'string') {
      return NextResponse.json({ error: 'Conversation or note text is required' }, { status: 400 });
    }

    const suggestions = await extractCommitmentsFromText(body.text);

    return NextResponse.json({ success: true, suggestions });
  } catch (err: any) {
    console.error('[API /commitments/extract Error]:', err);
    return NextResponse.json({ error: err.message || 'Failed to extract commitments' }, { status: 500 });
  }
}
