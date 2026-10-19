export type Programme = {
  selar: string;
  nestuge: string;
  price: number | null; // in kobo (e.g. 8000000 = ₦80,000)
  rate: number; // commission basis points e.g. 3500 = 35%
  holdDays: number;
  minimum: number; // minimum payout in kobo e.g. 2000000 = ₦20,000
  live: number;
};

export const defaultProgramme: Programme = {
  selar: 'https://selar.com/dss-closers',
  nestuge: 'https://nestuge.com/dss',
  price: 10000000, // ₦100,000 standard route price
  rate: 3500, // 35% commission (₦35,000 on standard routes, ₦52,500 on Both Routes)
  holdDays: 14,
  minimum: 2000000, // ₦20,000
  live: 1,
};

export const ROUTE_PRICES_KOBO = {
  SETTERS: 10000000, // ₦100,000
  CLOSERS: 10000000, // ₦100,000
  ROLEPLAY_INTERNSHIP: 10000000, // ₦100,000
  BOTH: 15000000, // ₦150,000
};

export function commissionFor(amount: number, rate: number): number {
  if (!Number.isSafeInteger(amount) || amount < 1 || !Number.isInteger(rate) || rate < 1 || rate > 10000) {
    throw new Error('Invalid commission inputs');
  }
  return Math.floor((amount * rate) / 10000);
}

export function validCode(value: unknown): value is string {
  return typeof value === 'string' && /^DSS-[A-F0-9]{12}$/.test(value);
}

export function formatNaira(kobo: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}
