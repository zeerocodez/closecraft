import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const MAX_IMPORT_BATCH = 500;

const ImportItemSchema = z.object({
  firstName: z.string().max(80).optional(),
  lastName: z.string().max(80).optional(),
  email: z.string().email("Invalid lead email").max(180),
  phone: z.string().max(40).optional(),
  buyingIntent: z.union([z.number(), z.string()]).optional(),
  notes: z.string().max(1000).optional(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    const organizationId = (session as any)?.organizationId;
    if (!session?.user || !organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body || !Array.isArray(body.leads) || body.leads.length === 0) {
      return NextResponse.json({ error: 'No valid leads provided' }, { status: 400 });
    }

    if (body.leads.length > MAX_IMPORT_BATCH) {
      return NextResponse.json(
        { error: `Batch size exceeds the limit of ${MAX_IMPORT_BATCH} leads per import.` },
        { status: 400 }
      );
    }

    const validatedLeads: {
      name: string;
      email: string;
      phone: string | null;
      buyingIntent: number;
      message: string;
    }[] = [];

    for (let i = 0; i < body.leads.length; i++) {
      const parsed = ImportItemSchema.safeParse(body.leads[i]);
      if (!parsed.success) {
        return NextResponse.json(
          { error: `Row ${i + 1} validation failed: ${parsed.error.issues[0]?.message}` },
          { status: 400 }
        );
      }
      const item = parsed.data;
      const fullName = `${item.firstName || ''} ${item.lastName || ''}`.trim() || 'Imported Lead';
      let parsedIntent = 50;
      if (item.buyingIntent !== undefined) {
        const rawNum = typeof item.buyingIntent === 'number' ? item.buyingIntent : parseInt(item.buyingIntent, 10);
        if (!isNaN(rawNum)) {
          parsedIntent = Math.min(100, Math.max(0, rawNum));
        }
      }

      validatedLeads.push({
        name: fullName,
        email: item.email.toLowerCase().trim(),
        phone: item.phone?.trim() || null,
        buyingIntent: parsedIntent,
        message: item.notes?.trim() || 'Imported via CSV',
      });
    }

    const createdLeads = await db.$transaction(
      validatedLeads.map((lead) => {
        return db.lead.create({
          data: {
            organizationId,
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            source: 'CSV_IMPORT',
            status: 'NEW',
            buyingIntent: lead.buyingIntent,
            message: lead.message,
          },
        });
      })
    );

    return NextResponse.json({ count: createdLeads.length });
  } catch (error) {
    console.error('CSV Import error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
