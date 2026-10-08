import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.organizationId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { leads } = await req.json();

    if (!Array.isArray(leads) || leads.length === 0) {
      return new NextResponse('No leads provided', { status: 400 });
    }

    const createdLeads = await db.$transaction(
      leads.map((lead: any) => {
        return db.lead.create({
          data: {
            organizationId: session.organizationId,
            name: `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Unknown',
            email: lead.email,
            phone: lead.phone || null,
            source: 'CSV_IMPORT',
            status: 'NEW',
            buyingIntent: lead.buyingIntent ? parseInt(lead.buyingIntent, 10) : 50,
            message: lead.notes || 'Imported via CSV',
          }
        });
      })
    );

    return NextResponse.json({ count: createdLeads.length });
  } catch (error) {
    console.error('CSV Import error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
