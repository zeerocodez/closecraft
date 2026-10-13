import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { Programme, defaultProgramme, validCode } from './rules';

export type AffiliateRecord = {
  userId: string;
  code: string;
  name: string;
  email: string;
  channel: string;
  status: 'pending' | 'approved' | 'rejected';
  created: number;
};

export type ClickRecord = {
  id: string;
  affiliate: string;
  visitor: string;
  created: number;
};

export type SaleRecord = {
  id: string;
  affiliate: string;
  reference: string;
  platform: 'Selar' | 'Nestuge' | 'Paystack' | 'Direct Transfer';
  amount: number; // in kobo
  commission: number; // in kobo
  status: 'pending' | 'paid' | 'reversed';
  eligible: number; // timestamp
  created: number;
};

export type PayoutRecord = {
  id: string;
  affiliate: string;
  amount: number; // in kobo
  reference: string;
  created: number;
};

export type EnquiryRecord = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  goal: string;
  referral?: string;
  created: number;
};

export type AffiliateData = {
  profile: AffiliateRecord | null;
  clicks: number;
  enquiries: number;
  sales: SaleRecord[];
  payouts: PayoutRecord[];
};

interface StoreData {
  programme: Programme;
  affiliates: AffiliateRecord[];
  clicks: ClickRecord[];
  sales: SaleRecord[];
  payouts: PayoutRecord[];
  enquiries: EnquiryRecord[];
}

const DATA_FILE = path.join(process.cwd(), 'data', 'dss-affiliates.json');

function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getInitialStore(): StoreData {
  const now = Date.now();
  return {
    programme: defaultProgramme,
    affiliates: [
      {
        userId: 'demo-partner-001',
        code: 'DSS-DEMO8820A1',
        name: 'Emmanuel Partner',
        email: 'partner@closecraft.ng',
        channel: 'WhatsApp Community & LinkedIn Network (2,400 sales professionals)',
        status: 'approved',
        created: now - 30 * 86400000,
      },
    ],
    clicks: [
      { id: 'c-1', affiliate: 'DSS-DEMO8820A1', visitor: 'v-101', created: now - 6 * 86400000 },
      { id: 'c-2', affiliate: 'DSS-DEMO8820A1', visitor: 'v-102', created: now - 5 * 86400000 },
      { id: 'c-3', affiliate: 'DSS-DEMO8820A1', visitor: 'v-103', created: now - 4 * 86400000 },
      { id: 'c-4', affiliate: 'DSS-DEMO8820A1', visitor: 'v-104', created: now - 3 * 86400000 },
      { id: 'c-5', affiliate: 'DSS-DEMO8820A1', visitor: 'v-105', created: now - 2 * 86400000 },
      { id: 'c-6', affiliate: 'DSS-DEMO8820A1', visitor: 'v-106', created: now - 86400000 },
    ],
    sales: [
      {
        id: 'sale-1',
        affiliate: 'DSS-DEMO8820A1',
        reference: 'DSS-PAY-882194',
        platform: 'Paystack',
        amount: 8000000, // ₦80,000
        commission: 2800000, // ₦28,000 (35%)
        status: 'paid',
        eligible: now - 15 * 86400000,
        created: now - 22 * 86400000,
      },
      {
        id: 'sale-2',
        affiliate: 'DSS-DEMO8820A1',
        reference: 'DSS-PAY-993821',
        platform: 'Selar',
        amount: 8000000,
        commission: 2800000,
        status: 'paid',
        eligible: now - 8 * 86400000,
        created: now - 16 * 86400000,
      },
      {
        id: 'sale-3',
        affiliate: 'DSS-DEMO8820A1',
        reference: 'DSS-PAY-441092',
        platform: 'Nestuge',
        amount: 8000000,
        commission: 2800000,
        status: 'pending',
        eligible: now - 2 * 86400000,
        created: now - 5 * 86400000,
      },
      {
        id: 'sale-4',
        affiliate: 'DSS-DEMO8820A1',
        reference: 'DSS-PAY-773105',
        platform: 'Paystack',
        amount: 8000000,
        commission: 2800000,
        status: 'pending',
        eligible: now + 5 * 86400000,
        created: now - 2 * 86400000,
      },
    ],
    payouts: [
      {
        id: 'payout-1',
        affiliate: 'DSS-DEMO8820A1',
        amount: 5600000, // ₦56,000 paid
        reference: 'TRANSFER-ZENITH-883921',
        created: now - 10 * 86400000,
      },
    ],
    enquiries: [
      {
        id: 'enq-1',
        name: 'Tunde Bakare',
        email: 'tunde.bakare@gmail.com',
        phone: '+2348039281726',
        goal: 'Remote Sales Starter',
        referral: 'DSS-DEMO8820A1',
        created: now - 7 * 86400000,
      },
      {
        id: 'enq-2',
        name: 'Ngozi Eze',
        email: 'ngozi.eze@techcraft.ng',
        phone: '+2348129384711',
        goal: 'Business Builder',
        referral: 'DSS-DEMO8820A1',
        created: now - 3 * 86400000,
      },
    ],
  };
}

function readStore(): StoreData {
  try {
    ensureDataDir();
    if (!fs.existsSync(DATA_FILE)) {
      const initial = getInitialStore();
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading DSS affiliate store:', err);
    return getInitialStore();
  }
}

function writeStore(data: StoreData) {
  try {
    ensureDataDir();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing DSS affiliate store:', err);
  }
}

export function generateAffiliateCode(): string {
  // Format: DSS-[A-F0-9]{12}
  const hex = crypto.randomBytes(6).toString('hex').toUpperCase();
  return `DSS-${hex}`;
}

export async function getProgrammeSettings(): Promise<Programme> {
  const store = readStore();
  return store.programme || defaultProgramme;
}

export async function findAffiliateByCode(code: string): Promise<AffiliateRecord | null> {
  const store = readStore();
  return store.affiliates.find((a) => a.code.toUpperCase() === code.toUpperCase()) || null;
}

export async function findAffiliateByEmail(email: string): Promise<AffiliateRecord | null> {
  const store = readStore();
  return store.affiliates.find((a) => a.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function registerAffiliate(params: {
  name: string;
  email: string;
  channel: string;
  userId?: string;
}): Promise<AffiliateRecord> {
  const store = readStore();
  const existing = store.affiliates.find((a) => a.email.toLowerCase() === params.email.toLowerCase());
  if (existing) {
    return existing;
  }

  const code = generateAffiliateCode();
  const newAffiliate: AffiliateRecord = {
    userId: params.userId || `aff-${crypto.randomUUID()}`,
    code,
    name: params.name.trim(),
    email: params.email.toLowerCase().trim(),
    channel: params.channel.trim(),
    status: 'approved', // Auto-approve to empower immediate participation
    created: Date.now(),
  };

  store.affiliates.push(newAffiliate);
  writeStore(store);

  // Sync with Closecraft CRM Leads so partner is recorded
  try {
    const org = await db.organization.findFirst();
    await db.lead.create({
      data: {
        name: params.name,
        email: params.email,
        type: 'MARKETING_LEAD',
        source: `DSS Affiliate Partner Application (${code})`,
        message: `Affiliate Channel: ${params.channel}`,
        status: 'QUALIFIED',
        buyingIntent: 90,
        organizationId: org?.id,
      },
    });
  } catch (e) {
    console.warn('CRM sync for affiliate lead notice:', e);
  }

  return newAffiliate;
}

export async function recordAffiliateClick(code: string, visitorId: string): Promise<boolean> {
  if (!validCode(code) && code !== 'DSS-DEMO8820A1') return false;
  const store = readStore();
  const aff = store.affiliates.find((a) => a.code.toUpperCase() === code.toUpperCase());
  if (!aff) return false;

  const now = Date.now();
  // Deduplicate visits from same visitor in past 24 hours
  const recent = store.clicks.find(
    (c) => c.affiliate.toUpperCase() === code.toUpperCase() && c.visitor === visitorId && now - c.created < 86400000
  );

  if (!recent) {
    store.clicks.push({
      id: crypto.randomUUID(),
      affiliate: aff.code,
      visitor: visitorId,
      created: now,
    });
    writeStore(store);
    return true;
  }
  return false;
}

export async function recordEnquiry(params: {
  name: string;
  email: string;
  phone?: string;
  goal: string;
  referral?: string;
}): Promise<EnquiryRecord> {
  const store = readStore();
  const newEnquiry: EnquiryRecord = {
    id: crypto.randomUUID(),
    name: params.name.trim(),
    email: params.email.toLowerCase().trim(),
    phone: params.phone?.trim(),
    goal: params.goal,
    referral: params.referral,
    created: Date.now(),
  };

  store.enquiries.push(newEnquiry);
  writeStore(store);

  // Direct Revenue Engine Integration: Lead captured immediately enters Closecraft
  try {
    const org = await db.organization.findFirst();
    await db.lead.create({
      data: {
        name: params.name,
        email: params.email,
        phone: params.phone,
        type: 'SALES_LEAD',
        source: params.referral ? `DSS Referral (${params.referral})` : 'DSS Direct Website',
        message: `DSS Enrollment Goal: ${params.goal}`,
        status: 'NEW',
        buyingIntent: 85,
        organizationId: org?.id,
      },
    });
  } catch (e) {
    console.warn('Closecraft CRM lead creation for DSS enquiry:', e);
  }

  return newEnquiry;
}

export async function getAffiliateDashboardData(codeOrEmail?: string): Promise<AffiliateData> {
  const store = readStore();
  let affiliate: AffiliateRecord | null = null;

  if (codeOrEmail) {
    affiliate =
      store.affiliates.find(
        (a) =>
          a.code.toUpperCase() === codeOrEmail.toUpperCase() ||
          a.email.toLowerCase() === codeOrEmail.toLowerCase()
      ) || null;
  }

  if (!affiliate) {
    // Return first partner or demo partner
    affiliate = store.affiliates[0] || null;
  }

  if (!affiliate) {
    return {
      profile: null,
      clicks: 0,
      enquiries: 0,
      sales: [],
      payouts: [],
    };
  }

  const code = affiliate.code;
  const clicks = store.clicks.filter((c) => c.affiliate.toUpperCase() === code.toUpperCase()).length;
  const enquiries = store.enquiries.filter((e) => e.referral?.toUpperCase() === code.toUpperCase()).length;
  const sales = store.sales.filter((s) => s.affiliate.toUpperCase() === code.toUpperCase());
  const payouts = store.payouts.filter((p) => p.affiliate.toUpperCase() === code.toUpperCase());

  return {
    profile: affiliate,
    clicks,
    enquiries,
    sales,
    payouts,
  };
}

export function getDemoDashboardData(): AffiliateData {
  const now = Date.now();
  return {
    profile: {
      userId: 'demo-user',
      name: 'Chidi Okonkwo (Top Partner)',
      email: 'chidi.closer@gmail.com',
      code: 'DSS-DEMO7721B9',
      status: 'approved',
      channel: 'Twitter/X Tech Community & 3 B2B WhatsApp Groups',
      created: now - 45 * 86400000,
    },
    clicks: 142,
    enquiries: 24,
    sales: [
      {
        id: 'demo-s1',
        affiliate: 'DSS-DEMO7721B9',
        reference: 'DSS-PAY-992011',
        platform: 'Paystack',
        amount: 8000000, // ₦80,000
        commission: 2800000, // ₦28,000
        status: 'paid',
        eligible: now - 20 * 86400000,
        created: now - 35 * 86400000,
      },
      {
        id: 'demo-s2',
        affiliate: 'DSS-DEMO7721B9',
        reference: 'DSS-PAY-992012',
        platform: 'Selar',
        amount: 8000000,
        commission: 2800000,
        status: 'paid',
        eligible: now - 14 * 86400000,
        created: now - 28 * 86400000,
      },
      {
        id: 'demo-s3',
        affiliate: 'DSS-DEMO7721B9',
        reference: 'DSS-PAY-992013',
        platform: 'Nestuge',
        amount: 8000000,
        commission: 2800000,
        status: 'paid',
        eligible: now - 7 * 86400000,
        created: now - 21 * 86400000,
      },
      {
        id: 'demo-s4',
        affiliate: 'DSS-DEMO7721B9',
        reference: 'DSS-PAY-992014',
        platform: 'Paystack',
        amount: 8000000,
        commission: 2800000,
        status: 'pending',
        eligible: now - 1 * 86400000,
        created: now - 10 * 86400000,
      },
      {
        id: 'demo-s5',
        affiliate: 'DSS-DEMO7721B9',
        reference: 'DSS-PAY-992015',
        platform: 'Direct Transfer',
        amount: 8000000,
        commission: 2800000,
        status: 'pending',
        eligible: now + 4 * 86400000,
        created: now - 4 * 86400000,
      },
    ],
    payouts: [
      {
        id: 'demo-p1',
        affiliate: 'DSS-DEMO7721B9',
        amount: 5600000, // ₦56,000
        reference: 'GTB-TRANSFER-99281',
        created: now - 18 * 86400000,
      },
      {
        id: 'demo-p2',
        affiliate: 'DSS-DEMO7721B9',
        amount: 2800000, // ₦28,000
        reference: 'GTB-TRANSFER-99432',
        created: now - 6 * 86400000,
      },
    ],
  };
}
