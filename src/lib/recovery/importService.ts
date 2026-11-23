import { db } from '../db';
import { RevenueEngine } from '../revenue-engine/engine';
import { extractLeadIntelligence } from './intelligenceService';

export interface RawImportLead {
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  business?: string;
  notes?: string;
  message?: string;
  buyingIntent?: number | string;
  intent?: number | string;
  source?: string;
  date?: string;
  productInterest?: string;
}

export interface ImportValidationResult {
  valid: boolean;
  lead?: {
    name: string;
    email: string;
    phone: string | null;
    normalizedPhone: string | null;
    company: string;
    message: string;
    buyingIntent: number;
    source: string;
    productInterest?: string;
  };
  error?: string;
}

/**
 * Normalizes phone numbers to standard E.164 or canonical international format.
 * Defaults local 11-digit Nigerian numbers (080..., 081..., 070..., 090..., 091...) to +234.
 * Cleans international numbers (+1, +44, +27, +254, +233, etc.)
 */
export function normalizePhoneNumber(rawPhone?: string | null): string | null {
  if (!rawPhone) return null;
  const trimmed = rawPhone.trim();
  if (!trimmed) return null;

  // Remove non-digit chars except leading '+'
  const cleaned = trimmed.replace(/[^\d+]/g, '');

  if (cleaned.startsWith('+')) {
    // Already in international format
    return cleaned;
  }

  // Nigerian local formats: 080..., 081..., 070..., 090..., 091... (11 digits)
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return `+234${cleaned.slice(1)}`;
  }

  // If 10 digits starting with 7, 8, or 9, assume Nigeria without leading zero
  if (cleaned.length === 10 && /^[789]/.test(cleaned)) {
    return `+234${cleaned}`;
  }

  // 10 digits US/Canada format (e.g. 2125551234)
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }

  // Fallback: prepend '+' if valid length
  if (cleaned.length >= 7 && cleaned.length <= 15) {
    return `+${cleaned}`;
  }

  return cleaned;
}

/**
 * Validates and sanitizes an imported row
 */
export function validateImportRow(row: RawImportLead, rowIndex: number): ImportValidationResult {
  const explicitName = row.name?.trim();
  const splitName = `${row.firstName || ''} ${row.lastName || ''}`.trim();
  const fullName = explicitName || splitName || 'Imported Prospect';

  const rawEmail = row.email ? row.email.toLowerCase().trim() : '';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const hasValidEmail = rawEmail ? emailRegex.test(rawEmail) : false;

  const normalizedPhone = normalizePhoneNumber(row.phone);

  if (!hasValidEmail && !normalizedPhone) {
    return {
      valid: false,
      error: `Row ${rowIndex + 1}: Missing both a valid email and phone number.`
    };
  }

  const company = row.company?.trim() || row.business?.trim() || '';
  const note = row.notes?.trim() || row.message?.trim() || '';
  const message = note
    ? (company ? `[${company}] ${note}` : note)
    : (company ? `Enquiry from ${company}` : 'Historical Lead Import');

  let buyingIntent = 60;
  const rawIntent = row.buyingIntent ?? row.intent;
  if (rawIntent !== undefined) {
    const parsed = typeof rawIntent === 'number' ? rawIntent : parseInt(String(rawIntent), 10);
    if (!isNaN(parsed)) {
      buyingIntent = Math.min(100, Math.max(0, parsed));
    }
  }

  return {
    valid: true,
    lead: {
      name: fullName,
      email: hasValidEmail ? rawEmail : '',
      phone: row.phone?.trim() || null,
      normalizedPhone,
      company,
      message,
      buyingIntent,
      source: row.source?.trim() || 'REVENUE_RECOVERY_IMPORT',
      productInterest: row.productInterest?.trim()
    }
  };
}

/**
 * Parses raw WhatsApp chat export text into lead interaction history.
 * Format: [date, time] Sender: Message or date, time - Sender: Message
 */
export function parseWhatsAppChatExport(chatText: string): {
  customerName: string;
  phone: string | null;
  messageHistory: string;
  inferredInterest?: string;
} {
  const lines = chatText.split('\n').filter(l => l.trim().length > 0);
  let customerName = 'WhatsApp Prospect';
  let phone: string | null = null;
  const messages: string[] = [];

  for (const line of lines) {
    // Check for phone number in header or messages
    const phoneMatch = line.match(/\+?\d[\d\s\-\(\)]{8,}\d/);
    if (phoneMatch && !phone) {
      phone = normalizePhoneNumber(phoneMatch[0]);
    }

    // Try to extract sender
    const senderMatch = line.match(/[-–\]]\s*([^:]+):\s*(.*)$/);
    if (senderMatch) {
      const sender = senderMatch[1].trim();
      const text = senderMatch[2].trim();
      if (!sender.toLowerCase().includes('you') && customerName === 'WhatsApp Prospect' && !sender.includes('+')) {
        customerName = sender;
      }
      messages.push(`${sender}: ${text}`);
    } else {
      messages.push(line.trim());
    }
  }

  return {
    customerName,
    phone,
    messageHistory: messages.slice(-15).join('\n')
  };
}

/**
 * Main batch ingestion engine for Revenue Recovery Hub
 */
export async function executeLeadRecoveryImport(params: {
  organizationId: string;
  userId?: string;
  fileName: string;
  format: 'CSV' | 'EXCEL' | 'WHATSAPP_EXPORT' | 'MANUAL';
  leads: RawImportLead[];
}) {
  const { organizationId, userId, fileName, format, leads } = params;

  // 1. Fetch existing leads in this organization for deduplication
  const existingLeads = await db.lead.findMany({
    where: { organizationId },
    select: { id: true, email: true, phone: true }
  });

  const existingEmailSet = new Set(
    existingLeads.map(l => l.email?.toLowerCase().trim()).filter(Boolean)
  );
  const existingPhoneSet = new Set(
    existingLeads.map(l => normalizePhoneNumber(l.phone)).filter(Boolean)
  );

  const validRows: Array<NonNullable<ImportValidationResult['lead']>> = [];
  const errors: string[] = [];
  let duplicateCount = 0;

  for (let i = 0; i < leads.length; i++) {
    const res = validateImportRow(leads[i], i);
    if (!res.valid || !res.lead) {
      errors.push(res.error || `Row ${i + 1} is invalid.`);
      continue;
    }

    const { email, normalizedPhone } = res.lead;

    // Duplicate check
    const isDuplicateEmail = email && existingEmailSet.has(email);
    const isDuplicatePhone = normalizedPhone && existingPhoneSet.has(normalizedPhone);

    if (isDuplicateEmail || isDuplicatePhone) {
      duplicateCount++;
      continue;
    }

    // Add to local set to avoid duplicate entries within the same file
    if (email) existingEmailSet.add(email);
    if (normalizedPhone) existingPhoneSet.add(normalizedPhone);

    validRows.push(res.lead);
  }

  // 2. Create the LeadImportBatch tracking record
  const batch = await db.leadImportBatch.create({
    data: {
      organizationId,
      createdById: userId || null,
      fileName,
      format,
      totalRows: leads.length,
      importedCount: validRows.length,
      duplicateCount,
      errorCount: errors.length,
      status: 'PROCESSING',
      errorLog: errors.length > 0 ? JSON.stringify(errors.slice(0, 50)) : null
    }
  });

  // 3. Insert valid leads into the database
  const createdLeads: any[] = [];
  for (const item of validRows) {
    const lead = await db.lead.create({
      data: {
        organizationId,
        name: item.name,
        email: item.email || '',
        phone: item.normalizedPhone || item.phone,
        source: item.source || 'RECOVERY_IMPORT',
        status: 'NEW',
        buyingIntent: item.buyingIntent,
        message: item.message,
      }
    });

    createdLeads.push(lead);

    // Run AI Lead Intelligence & Revenue Engine processing
    try {
      await extractLeadIntelligence({
        leadId: lead.id,
        organizationId,
        leadName: lead.name,
        leadMessage: lead.message,
        source: lead.source,
        productInterest: item.productInterest
      });
      await RevenueEngine.processNewLead(lead.id);
    } catch (engineErr) {
      console.error(`[Recovery Import] Engine error for lead ${lead.id}:`, engineErr);
    }
  }

  // 4. Mark batch COMPLETED
  await db.leadImportBatch.update({
    where: { id: batch.id },
    data: { status: 'COMPLETED' }
  });

  // 5. Create Audit Log
  await db.auditLog.create({
    data: {
      organizationId,
      actorId: userId || null,
      actorType: 'USER',
      action: 'LEAD_RECOVERY_BATCH_IMPORTED',
      resourceType: 'LeadImportBatch',
      resourceId: batch.id,
      metadata: JSON.stringify({
        fileName,
        format,
        total: leads.length,
        imported: createdLeads.length,
        duplicates: duplicateCount,
        errors: errors.length
      }),
      reason: `Ingested ${createdLeads.length} recovery leads via ${fileName}`
    }
  });

  return {
    batchId: batch.id,
    totalRows: leads.length,
    importedCount: createdLeads.length,
    duplicateCount,
    errorCount: errors.length,
    errors: errors.slice(0, 20),
    sampleLeads: createdLeads.slice(0, 5).map(l => ({ id: l.id, name: l.name, phone: l.phone, email: l.email }))
  };
}
