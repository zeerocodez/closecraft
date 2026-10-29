/**
 * WhatsApp & Phone Number Normalization Utilities
 * 
 * Ensures robust E.164-compatible international phone formatting for WhatsApp wa.me links,
 * SMS, and Cloud API outreach across Nigerian (+234) and international numbers.
 */

export function normalizeWhatsAppNumber(rawPhone: string | null | undefined): string | null {
  if (!rawPhone || typeof rawPhone !== 'string') return null;
  
  // Extract only numeric digits
  const digits = rawPhone.replace(/[^0-9]/g, '');
  if (!digits) return null;

  // 1. Nigerian 11-digit local format with leading zero (e.g., "08103262248", "08031234567")
  if (digits.length === 11 && digits.startsWith('0')) {
    return '234' + digits.slice(1);
  }

  // 2. Nigerian 10-digit format without leading zero (e.g., "8103262248", "8031234567")
  // Nigerian mobile prefixes without leading 0 start with 7, 8, or 9 (70x, 80x, 81x, 90x, 91x)
  if (digits.length === 10 && /^[789]/.test(digits)) {
    return '234' + digits;
  }

  // 3. Already prefixed with Nigerian country code 234 (e.g., "2348103262248" or "+2348103262248")
  if (digits.startsWith('234') && digits.length === 13) {
    return digits;
  }

  // 4. Accidental double-prefixed (e.g. "00234..." or "0234...")
  if (digits.startsWith('00234') && digits.length === 15) {
    return digits.slice(2);
  }
  if (digits.startsWith('0234') && digits.length === 14) {
    return digits.slice(1);
  }

  // 5. Standard international numbers with country codes (7 to 15 digits)
  if (digits.length >= 7 && digits.length <= 15) {
    return digits;
  }

  return null;
}

/**
 * Builds a valid WhatsApp click-to-chat URL (wa.me)
 * @param phone Recipient or business phone number
 * @param text Optional pre-filled draft message
 */
export function formatWhatsAppUrl(phone: string | null | undefined, text?: string): string | null {
  const clean = normalizeWhatsAppNumber(phone);
  if (!clean) return null;
  
  const textParam = text && text.trim().length > 0 
    ? `?text=${encodeURIComponent(text.trim())}` 
    : '';
    
  return `https://wa.me/${clean}${textParam}`;
}

/**
 * Formats a phone number for user-friendly display in UI
 * e.g., "2348103262248" -> "+234 810 326 2248"
 */
export function formatPhoneDisplay(rawPhone: string | null | undefined): string {
  if (!rawPhone) return 'Not configured';
  const clean = normalizeWhatsAppNumber(rawPhone);
  if (!clean) return rawPhone;

  if (clean.startsWith('234') && clean.length === 13) {
    // Format Nigerian numbers: +234 810 326 2248
    return `+234 ${clean.slice(3, 6)} ${clean.slice(6, 9)} ${clean.slice(9)}`;
  }

  return `+${clean}`;
}
