import { NextResponse } from 'next/server';
import { inngest } from '@/lib/inngest/client';
import { timingSafeEqualString } from '@/lib/apiSecurity';
import { rateLimit, clientIp } from '@/lib/rateLimit';
import crypto from 'crypto';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.FACEBOOK_VERIFY_TOKEN;
  if (!verifyToken) {
    console.error('[Facebook Webhook] FACEBOOK_VERIFY_TOKEN is unconfigured.');
    return new NextResponse('Configuration error', { status: 500 });
  }

  if (mode === 'subscribe' && token && timingSafeEqualString(token, verifyToken)) {
    console.log('FACEBOOK_WEBHOOK_VERIFIED');
    return new NextResponse(challenge, { status: 200 });
  } else {
    return new NextResponse('Forbidden', { status: 403 });
  }
}

export async function POST(req: Request) {
  try {
    const ip = clientIp(req);
    const limiter = await rateLimit(`fb-webhook:${ip}`, 120, 60 * 1000);
    if (!limiter.allowed) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }

    const rawBody = await req.text();
    const signature = req.headers.get('x-hub-signature-256') || req.headers.get('x-hub-signature');
    const appSecret = process.env.FACEBOOK_APP_SECRET || process.env.META_APP_SECRET;

    if (appSecret) {
      if (!signature) {
        console.warn('[Facebook Webhook] Missing x-hub-signature');
        return new NextResponse('Missing signature', { status: 401 });
      }
      const expected256 = 'sha256=' + crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex');
      const expected1 = 'sha1=' + crypto.createHmac('sha1', appSecret).update(rawBody).digest('hex');
      const isValid = timingSafeEqualString(signature, expected256) || timingSafeEqualString(signature, expected1);
      if (!isValid) {
        console.warn('[Facebook Webhook] Invalid signature rejected');
        return new NextResponse('Invalid signature', { status: 401 });
      }
    } else if (process.env.NODE_ENV === 'production') {
      console.error('[Facebook Webhook] FACEBOOK_APP_SECRET / META_APP_SECRET unconfigured in production');
      return new NextResponse('Configuration error', { status: 500 });
    }

    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return new NextResponse('Invalid JSON payload', { status: 400 });
    }

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
