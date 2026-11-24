import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organizationId = (session as any)?.organizationId;
    if (!organizationId) {
      return NextResponse.json({ error: 'Organization context required' }, { status: 400 });
    }

    const body = await req.json();
    const { formId, isActive, targetStage, targetAssigneeId, fieldMapping } = body;

    if (!formId) {
      return NextResponse.json({ error: 'formId is required' }, { status: 400 });
    }

    // Tenant boundary security: Verify that the form belongs to the user's organization
    const form = await db.metaLeadForm.findFirst({
      where: {
        formId,
        organizationId,
      },
    });

    if (!form) {
      return NextResponse.json({ error: 'Lead form not found or unauthorized' }, { status: 404 });
    }

    const updateData: any = {};
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (typeof targetStage === 'string') updateData.targetStage = targetStage;
    if (targetAssigneeId !== undefined) updateData.targetAssigneeId = targetAssigneeId || null;
    if (fieldMapping !== undefined) {
      updateData.fieldMapping = typeof fieldMapping === 'string' ? fieldMapping : JSON.stringify(fieldMapping);
    }

    const updated = await db.metaLeadForm.update({
      where: { id: form.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, form: updated });
  } catch (err: any) {
    console.error('[Meta Lead Form Toggle] Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
