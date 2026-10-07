import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export function secretMatches(actual: string | null, expected: string | undefined): boolean {
  if (!actual || !expected?.trim()) return false;
  return timingSafeEqual(createHash('sha256').update(actual).digest(), createHash('sha256').update(expected).digest());
}

export function validSignature(raw: string, signature: string | null, secret: string | undefined, algorithm: 'sha256' | 'sha512'): boolean {
  if (!secret?.trim() || !signature || !new RegExp(`^[a-fA-F0-9]{${algorithm === 'sha256' ? 64 : 128}}$`).test(signature)) return false;
  const expected = createHmac(algorithm, secret).update(raw).digest('hex');
  return secretMatches(signature.toLowerCase(), expected);
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]!));
}
