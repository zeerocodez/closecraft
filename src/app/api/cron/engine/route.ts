import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendTransactionalEmail } from '@/lib/email';

export async function GET(request: Request) {
 try {
 console.log('[RevenueEngine Cron] Starting automation tick...');

 // 1. Fetch pending automation actions
 const pendingActions = await db.revenueAction.findMany({
 where: {
 status: 'PENDING',
 recommendedActor: { in: ['AUTOMATION', 'SYSTEM'] }
 },
 include: {
 lead: true,
 organization: true
 },
 take: 10 // Batch size
 });

 if (pendingActions.length === 0) {
 return NextResponse.json({ success: true, message: 'No pending actions' });
 }

 console.log(`[RevenueEngine Cron] Found ${pendingActions.length} pending actions`);

 for (const action of pendingActions) {
 // Mark as executing
 await db.revenueAction.update({
 where: { id: action.id },
 data: { status: 'EXECUTING' }
 });

 try {
 if (action.type === 'SEND_NURTURE_SEQUENCE') {
 // Execute automated email
 await sendTransactionalEmail({
 to: action.lead.email,
 subject: 'Can we help with your Revenue Engine?',
 html: `
 <p>Hi ${action.lead.name.split(' ')[0]},</p>
 <p>I saw you requested some information from ${action.organization.name}. We help companies scale their sales operations using AI-driven qualification.</p>
 <p>Are you open to a quick chat this week?</p>
 <p>Thanks!</p>
 `
 });

 // Mark completed
 await db.revenueAction.update({
 where: { id: action.id },
 data: { 
 status: 'COMPLETED',
 executedAt: new Date(),
 result: 'Nurture email sent successfully'
 }
 });
 } else {
 // Unsupported action type
 await db.revenueAction.update({
 where: { id: action.id },
 data: { 
 status: 'FAILED',
 result: 'Unsupported action type for AUTOMATION'
 }
 });
 }
 } catch (error) {
 console.error(`[RevenueEngine Cron] Failed to execute action ${action.id}:`, error);
 await db.revenueAction.update({
 where: { id: action.id },
 data: { 
 status: 'FAILED',
 result: error instanceof Error ? error.message : 'Unknown error'
 }
 });
 }
 }

 return NextResponse.json({ success: true, processed: pendingActions.length });
 } catch (error) {
 console.error('[RevenueEngine Cron] Tick failed:', error);
 return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
 }
}
