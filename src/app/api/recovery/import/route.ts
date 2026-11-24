import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { executeLeadRecoveryImport } from '@/lib/recovery/importService';
import { rateLimit } from '@/lib/rateLimit';

export async function POST(req: Request) {
  try {
    const session = await auth();
    const organizationId = (session as any)?.organizationId;
    if (!session?.user?.id || !organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const limiter = await rateLimit(`recovery-import:${organizationId}`, 10, 60 * 1000);
    if (!limiter.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded. Please wait a moment.' }, { status: 429 });
    }

    const body = await req.json().catch(() => null);
    if (!body || !Array.isArray(body.leads) || body.leads.length === 0) {
      return NextResponse.json({ error: 'No valid leads provided' }, { status: 400 });
    }

    const fileName = body.fileName || 'imported_leads.csv';
    const format = body.format || 'CSV';

    const result = await executeLeadRecoveryImport({
      organizationId,
      userId: session.user.id,
      fileName,
      format,
      leads: body.leads
    });

    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    console.error('[API /recovery/import Error]:', err);
    return NextResponse.json({ error: err.message || 'Failed to import recovery leads' }, { status: 500 });
  }
}
