/**
 * FINANCIAL INTEGRITY & PRECISE MONEY HANDLING
 * Eliminates binary floating-point errors by using integer minor units (kobo/cents).
 * Safely converts to Bachs decimal string representation ("15000.00").
 */

export function toMinorUnits(amount: number, currency: string = 'NGN'): number {
  // Minor unit factor: 100 for NGN, USD, GBP, EUR, CAD, GHS, KES
  return Math.round(amount * 100);
}

export function fromMinorUnits(minorUnits: number, currency: string = 'NGN'): number {
  return minorUnits / 100;
}

/**
 * Official Bachs representation convention:
 * Always a decimal string with currency precision (e.g., "15000.00").
 */
export function toBachsDecimalString(amount: number): string {
  const minor = toMinorUnits(amount);
  const major = Math.floor(minor / 100);
  const rem = Math.abs(minor % 100);
  return `${major}.${rem.toString().padStart(2, '0')}`;
}

export function addMoney(a: number, b: number): number {
  return fromMinorUnits(toMinorUnits(a) + toMinorUnits(b));
}

export function subtractMoney(a: number, b: number): number {
  return fromMinorUnits(toMinorUnits(a) - toMinorUnits(b));
}

export function multiplyMoney(amount: number, multiplier: number): number {
  const minor = toMinorUnits(amount);
  const resultMinor = Math.round(minor * multiplier);
  return fromMinorUnits(resultMinor);
}

export function formatMoney(amount: number, currency: string = 'NGN', locale: string = 'en-NG'): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${toBachsDecimalString(amount)}`;
  }
}

/**
 * Calculates deterministic proration for upgrades/cancellations.
 */
export function calculateProration(
  monthlyPrice: number,
  daysUsed: number,
  totalDaysInPeriod: number = 30
): { usedAmount: number; creditAmount: number } {
  const safeDaysUsed = Math.min(totalDaysInPeriod, Math.max(0, daysUsed));
  const dailyRateMinor = Math.round(toMinorUnits(monthlyPrice) / totalDaysInPeriod);
  const usedMinor = dailyRateMinor * safeDaysUsed;
  const creditMinor = Math.max(0, toMinorUnits(monthlyPrice) - usedMinor);

  return {
    usedAmount: fromMinorUnits(usedMinor),
    creditAmount: fromMinorUnits(creditMinor),
  };
}
