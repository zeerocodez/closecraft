import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { inngest } from '@/lib/inngest/client';
import { z } from 'zod';

const LeadIngestionSchema = z.object({
 name: z.string().min(1),
 email: z.string().email(),
 phone: z.string().optional(),
 message: z.string().optional(),
 source: z.string().default('Marketing Website'),
 organizationId: z.string() // The tenant this lead belongs to
});

export async function POST(req: Request) {
 try {
 const body = await req.json();
 
 // Validate the incoming payload
 const validatedData = LeadIngestionSchema.parse(body);

 // Verify the organization exists
 const organization = await db.organization.findUnique({
 where: { id: validatedData.organizationId }
 });

 if (!organization) {
 return NextResponse.json({ error: 'Invalid organization ID' }, { status: 400 });
 }

 // 1. Ingest the Lead into the core Revenue Engine
 const lead = await db.lead.create({
 data: {
 name: validatedData.name,
 email: validatedData.email,
 phone: validatedData.phone,
 message: validatedData.message,
 source: validatedData.source,
 status: 'NEW', // All ingested leads start as NEW
 organizationId: validatedData.organizationId,
 }
 });

 // 2. Fire the Background Event 
 // This decouples the fast web request from the slow AI qualification
 await inngest.send({
 name: 'lead/created',
 data: {
 leadId: lead.id,
 source: lead.source || 'Unknown'
 }
 });

 return NextResponse.json({ success: true, leadId: lead.id }, { status: 201 });

 } catch (error) {
 console.error('Error ingesting lead:', error);
 return NextResponse.json({ error: 'Failed to ingest lead' }, { status: 500 });
 }
}
