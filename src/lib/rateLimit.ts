import { NextRequest } from "next/server";
import { db } from "./db";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, RateLimitRecord>();

// Clean up expired keys periodically
const CLEANUP_INTERVAL = 60 * 1000;
let lastCleanup = Date.now();

function purgeExpiredMemory() {
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
  const now = Date.now();
  const resetDate = new Date(now + windowMs);

  // 1. Attempt database-backed rate limiting for cross-instance consistency
  try {
    if (db && db.rateLimit) {
      const record = await db.rateLimit.findUnique({
        where: { key },
      });

      if (!record || record.resetAt.getTime() <= now) {
        await db.rateLimit.upsert({
          where: { key },
          create: {
            key,
            count: 1,
            resetAt: resetDate,
          },
          update: {
            count: 1,
            resetAt: resetDate,
          },
        });

        return {
          allowed: true,
          remaining: limit - 1,
          reset: resetDate.getTime(),
        };
      }

      if (record.count >= limit) {
        return {
          allowed: false,
          remaining: 0,
          reset: record.resetAt.getTime(),
        };
      }

      const updated = await db.rateLimit.update({
        where: { key },
        data: {
          count: { increment: 1 },
        },
      });

      return {
        allowed: true,
        remaining: Math.max(0, limit - updated.count),
        reset: updated.resetAt.getTime(),
      };
    }
  } catch {
    // If DB is unreachable or during test mocks, gracefully fallback to memoryStore
  }

  // 2. Resilient in-memory fallback
  purgeExpiredMemory();
  const memRecord = memoryStore.get(key);

  if (!memRecord || memRecord.resetAt <= now) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      remaining: limit - 1,
      reset: now + windowMs,
    };
  }

  if (memRecord.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      reset: memRecord.resetAt,
    };
  }

  memRecord.count += 1;
  return {
    allowed: true,
    remaining: limit - memRecord.count,
    reset: memRecord.resetAt,
  };
}
