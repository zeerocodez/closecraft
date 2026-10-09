import { NextResponse } from 'next/server';
import { inngest } from '@/lib/inngest/client';

const VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN || 'closecraft_fb_token_123';

export async function GET(req: Request) {
 const { searchParams } = new URL(req.url);
 const mode = searchParams.get('hub.mode');
 const token = searchParams.get('hub.verify_token');
 const challenge = searchParams.get('hub.challenge');

 if (mode === 'subscribe' && token === VERIFY_TOKEN) {
 console.log('WEBHOOK_VERIFIED');
 return new NextResponse(challenge, { status: 200 });
 } else {
 return new NextResponse('Forbidden', { status: 403 });
 }
}

export async function POST(req: Request) {
 try {
 const body = await req.json();

 if (body.object !== 'page') {
 return new NextResponse('Not Found', { status: 404 });
 }

 // Process each entry
 for (const entry of body.entry) {
 for (const change of entry.changes) {
 if (change.field === 'leadgen') {
 const leadData = change.value;
 
 // Rather than writing to DB synchronously, we push an event to the background bus
 await inngest.send({
 name: 'revenue/lead.created',
 data: {
 organizationId: 'zeerocodes_hq_or_default', // In reality, map Page ID to Org ID
 name: 'FB Lead',
 email: `fb_lead_${leadData.leadgen_id}@example.com`,
 source: 'FACEBOOK',
 message: 'Imported via Facebook Webhook'
 }
 });
 
 console.log('Dispatched FB lead to Inngest', leadData.leadgen_id);
 }
 }
 }

 return new NextResponse('EVENT_RECEIVED', { status: 200 });
 } catch (error) {
 console.error('Webhook error:', error);
 return new NextResponse('Internal Server Error', { status: 500 });
 }
}
