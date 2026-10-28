import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * Production Health Check API
 * Verifies database liveness, outbox queue metrics, and system memory.
 */
export async function GET() {
  const startTime = Date.now();
  let dbStatus = 'HEALTHY';
  let dbLatencyMs = 0;

  try {
    const queryStart = Date.now();
    await db.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - queryStart;
  } catch (err: any) {
    dbStatus = 'UNHEALTHY';
    console.error('[Health Check DB Error]', err);
  }

  // Check outbox backlog
  let pendingOutbox = 0;
  let deadLetterOutbox = 0;
  try {
    [pendingOutbox, deadLetterOutbox] = await Promise.all([
      db.outboxMessage.count({ where: { status: 'PENDING' } }),
      db.outboxMessage.count({ where: { status: 'DEAD_LETTER' } }),
    ]);
  } catch {
    // Non-fatal if outbox query fails
  }

  const memory = process.memoryUsage();
  const uptimeSeconds = Math.floor(process.uptime());

  const isHealthy = dbStatus === 'HEALTHY' && deadLetterOutbox < 50;

  return NextResponse.json({
    status: isHealthy ? 'UP' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    uptimeSeconds,
    latencyMs: Date.now() - startTime,
    components: {
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
      },
      outboxQueue: {
        status: deadLetterOutbox > 0 ? 'WARNING' : 'HEALTHY',
        pendingCount: pendingOutbox,
        deadLetterCount: deadLetterOutbox,
      },
      system: {
        heapUsedMb: Math.round(memory.heapUsed / 1024 / 1024),
        heapTotalMb: Math.round(memory.heapTotal / 1024 / 1024),
        rssMb: Math.round(memory.rss / 1024 / 1024),
      }
    }
  }, {
    status: isHealthy ? 200 : 503
  });
}
