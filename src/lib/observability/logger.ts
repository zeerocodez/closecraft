/**
 * PRODUCTION STRUCTURED LOGGER WITH SENSITIVE DATA REDACTION
 * Automatically strips secret keys, passwords, bearer tokens,
 * and PII from application logs.
 */

const SENSITIVE_KEYS = [
  'password',
  'passwordhash',
  'secret',
  'token',
  'authorization',
  'apikey',
  'cardnumber',
  'cvv',
  'cvc',
  'bachs_secret_key',
];

export function redactSensitiveData(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(redactSensitiveData);

  const cleaned: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = SENSITIVE_KEYS.some(s => lowerKey.includes(s));

    if (isSensitive) {
      cleaned[key] = '[REDACTED]';
    } else if (typeof val === 'object' && val !== null) {
      cleaned[key] = redactSensitiveData(val);
    } else {
      cleaned[key] = val;
    }
  }
  return cleaned;
}

export const logger = {
  info: (message: string, context?: Record<string, any>) => {
    console.log(JSON.stringify({
      level: 'INFO',
      timestamp: new Date().toISOString(),
      message,
      context: context ? redactSensitiveData(context) : undefined,
    }));
  },
  warn: (message: string, context?: Record<string, any>) => {
    console.warn(JSON.stringify({
      level: 'WARN',
      timestamp: new Date().toISOString(),
      message,
      context: context ? redactSensitiveData(context) : undefined,
    }));
  },
  error: (message: string, error?: any, context?: Record<string, any>) => {
    console.error(JSON.stringify({
      level: 'ERROR',
      timestamp: new Date().toISOString(),
      message,
      error: error?.message || error,
      context: context ? redactSensitiveData(context) : undefined,
    }));
  },
};
