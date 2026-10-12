import { NextRequest } from "next/server";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, RateLimitRecord>();

// Clean up expired keys periodically
const CLEANUP_INTERVAL = 60 * 1000;
let lastCleanup = Date.now();

function purgeExpired() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, record] of memoryStore.entries()) {
    if (record.resetAt <= now) {
      memoryStore.delete(key);
    }
  }
}

export function clientIp(req: Request | NextRequest): string {
  const headers = req.headers;
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const ip = forwarded.split(",")[0]?.trim();
    if (ip) return ip;
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  const cfIp = headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();
  return "127.0.0.1";
}

export async function rateLimit(
  key: string,
  limit: number = 20,
  windowMs: number = 60 * 1000
): Promise<{ allowed: boolean; remaining: number; reset: number }> {
  purgeExpired();

  const now = Date.now();
  const record = memoryStore.get(key);

  if (!record || record.resetAt <= now) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      remaining: limit - 1,
      reset: now + windowMs,
    };
  }

  if (record.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      reset: record.resetAt,
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: limit - record.count,
    reset: record.resetAt,
  };
}
