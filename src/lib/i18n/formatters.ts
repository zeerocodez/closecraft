/**
 * Internationalization, Currency, Phone, and Timezone Utilities for CloseCraft
 */

export type SupportedCurrency = 'NGN' | 'USD' | 'GBP' | 'EUR';

export const CURRENCY_SYMBOLS: Record<SupportedCurrency, string> = {
  NGN: '₦',
  USD: '$',
  GBP: '£',
  EUR: '€',
};

/**
 * Formats monetary amounts in local or international currency
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  currency: SupportedCurrency | string = 'NGN',
  options?: { showSymbol?: boolean; showCents?: boolean }
): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return 'Not yet established';
  }

  const num = Number(amount);
  const cur = (currency?.toUpperCase() || 'NGN') as SupportedCurrency;
  const symbol = options?.showSymbol !== false ? (CURRENCY_SYMBOLS[cur] || `${cur} `) : '';

  const formattedNum = num.toLocaleString('en-US', {
    minimumFractionDigits: options?.showCents ? 2 : 0,
    maximumFractionDigits: options?.showCents ? 2 : 0,
  });

  return `${symbol}${formattedNum}`;
}

/**
 * Formats phone numbers into readable international or local representation
 */
export function formatDisplayPhone(phone?: string | null): string {
  if (!phone) return 'No phone recorded';
  const trimmed = phone.trim();

  // Nigerian E.164: +2348031234567 -> +234 803 123 4567
  if (trimmed.startsWith('+234') && trimmed.length === 14) {
    return `${trimmed.slice(0, 4)} ${trimmed.slice(4, 7)} ${trimmed.slice(7, 10)} ${trimmed.slice(10)}`;
  }

  // US/Canada E.164: +12125551234 -> +1 (212) 555-1234
  if (trimmed.startsWith('+1') && trimmed.length === 12) {
    return `+1 (${trimmed.slice(2, 5)}) ${trimmed.slice(5, 8)}-${trimmed.slice(8)}`;
  }

  // UK E.164: +447911123456 -> +44 7911 123456
  if (trimmed.startsWith('+44') && trimmed.length >= 12) {
    return `${trimmed.slice(0, 3)} ${trimmed.slice(3, 7)} ${trimmed.slice(7)}`;
  }

  return trimmed;
}

/**
 * Formats dates with timezone awareness
 */
export function formatDisplayDate(
  date: Date | string | number | null | undefined,
  options?: { includeTime?: boolean; timezone?: string }
): string {
  if (!date) return 'Not set';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid date';

  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(options?.includeTime ? { hour: '2-digit', minute: '2-digit' } : {}),
    ...(options?.timezone ? { timeZone: options.timezone } : {}),
  });
}
