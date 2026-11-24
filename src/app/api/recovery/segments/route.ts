import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getOrganizationSegmentSummaries } from '@/lib/recovery/segmentationService';

export async function GET(req: Request) {
  try {
    const session = await auth();
    const organizationId = (session as any)?.organizationId;
    if (!session?.user?.id || !organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const segments = await getOrganizationSegmentSummaries(organizationId);
    return NextResponse.json({ success: true, segments });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch segments' }, { status: 500 });
  }
}
