import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { RevenueEngine } from '@/lib/revenue-engine/engine';

const MAX_IMPORT_BATCH = 500;

const ImportItemSchema = z.object({
  name: z.string().max(160).optional(),
  firstName: z.string().max(80).optional(),
  lastName: z.string().max(80).optional(),
  email: z.string().email("Invalid lead email").max(180).optional().or(z.literal('')),
  phone: z.string().max(40).optional().or(z.literal('')),
  company: z.string().max(120).optional(),
  business: z.string().max(120).optional(),
  buyingIntent: z.union([z.number(), z.string()]).optional(),
  intent: z.union([z.number(), z.string()]).optional(),
  notes: z.string().max(1500).optional(),
  message: z.string().max(1500).optional(),
  dealValue: z.union([z.number(), z.string()]).optional(),
}).refine(data => Boolean((data.email && data.email.trim()) || (data.phone && data.phone.trim())), {
  message: "Either email or phone number is required for each lead."
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
      company?: string;
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
      const explicitName = item.name?.trim();
      const splitName = `${item.firstName || ''} ${item.lastName || ''}`.trim();
      const fullName = explicitName || splitName || 'Imported Lead';
      
      const rawIntent = item.buyingIntent ?? item.intent;
      let parsedIntent = 55;
      if (rawIntent !== undefined) {
        const rawNum = typeof rawIntent === 'number' ? rawIntent : parseInt(rawIntent, 10);
        if (!isNaN(rawNum)) {
          parsedIntent = Math.min(100, Math.max(0, rawNum));
        }
      }

      const noteText = item.notes?.trim() || item.message?.trim() || '';
      const companyName = item.company?.trim() || item.business?.trim() || '';
      const leadMessage = noteText 
        ? (companyName ? `[${companyName}] ${noteText}` : noteText)
        : (companyName ? `Inquiry from ${companyName}` : 'Imported via CSV');

      validatedLeads.push({
        name: fullName,
        email: item.email ? item.email.toLowerCase().trim() : '',
        phone: item.phone?.trim() || null,
        buyingIntent: parsedIntent,
        message: leadMessage,
        company: companyName,
      });
    }

    // 1. Bulk insert the leads in transaction
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

    // 2. Run the Revenue Engine across every imported lead to derive signals, Next Best Action, and pipeline deals
    console.log(`[CSV Import] Ingesting ${createdLeads.length} leads through Revenue Engine...`);
    for (const lead of createdLeads) {
      try {
        await RevenueEngine.processNewLead(lead.id);
      } catch (engineErr) {
        console.error(`[CSV Import] RevenueEngine evaluation error for lead ${lead.id}:`, engineErr);
      }
    }

    return NextResponse.json({ 
      success: true, 
      count: createdLeads.length,
      leads: createdLeads.map(l => ({ id: l.id, name: l.name, email: l.email }))
    });
  } catch (error) {
    console.error('CSV Import error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

