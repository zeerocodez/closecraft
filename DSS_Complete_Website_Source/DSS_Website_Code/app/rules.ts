export type Programme = {
    selar: string;
    nestuge: string;
    price: number | null;
    rate: number;
    holdDays: number;
    minimum: number;
    live: number;
};
export const defaultProgramme: Programme = { selar: '', nestuge: '', price: null, rate: 0, holdDays: 30, minimum: 1000000, live: 0 };
export function commissionFor(amount: number, rate: number) { if (!Number.isSafeInteger(amount) || amount < 1 || !Number.isInteger(rate) || rate < 1 || rate > 10000)
    throw new Error('Invalid commission inputs'); return Math.floor(amount * rate / 10000); }
export function safeCheckout(value: unknown, host: string) { if (value === '')
    return ''; if (typeof value !== 'string')
    throw new Error('Invalid checkout link'); const u = new URL(value); if (u.protocol !== 'https:' || !(u.hostname === host || u.hostname.endsWith('.' + host)) || u.username || u.password)
    throw new Error('Use a secure ' + host + ' checkout link'); return u.href; }
export function validCode(value: unknown): value is string { return typeof value === 'string' && /^DSS-[A-F0-9]{12}$/.test(value); }
export function availableSales<T extends {
    status: string;
    eligible: number;
}>(list: T[], now: number) { return list.filter(s => s.status === 'pending' && s.eligible <= now); }
