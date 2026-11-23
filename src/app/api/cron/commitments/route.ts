import { NextResponse } from 'next/server';
import { verifyCronAuth } from '@/lib/apiSecurity';
import { scanAndEscalateOverdueCommitments } from '@/lib/commitments/commitmentService';

export async function GET(request: Request) {
  const cronCheck = verifyCronAuth(request);
  if (!cronCheck.authorized) {
    return cronCheck.response || new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    console.log('[Commitments Cron] Scanning for overdue customer promises...');
    const result = await scanAndEscalateOverdueCommitments();
    console.log(`[Commitments Cron] Scan complete. Total overdue: ${result.totalOverdue}, new leaks: ${result.newLeaksCreated}`);
    
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    console.error('[Commitments Cron Error]:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
