import { PrismaClient } from "@prisma/client";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

/**
 * Rewrites Supabase session-mode pooler URLs (`*.pooler.supabase.com:5432`, max 15 clients)
 * to transaction-mode pooling (`:6543?pgbouncer=true`) with bounded per-instance connection
 * limits so serverless Vercel functions cannot exhaust session slots.
 */
export function normalizeDatabaseUrl(
  rawUrl?: string,
  options: { isProduction?: boolean; isVercel?: boolean } = {}
): string | undefined {
  if (!rawUrl || !rawUrl.trim()) return undefined;
  try {
    const parsed = new URL(rawUrl);
    const isSupabasePooler = parsed.hostname.endsWith(".pooler.supabase.com");
    const isServerlessProd =
      options.isVercel ??
      Boolean(process.env.VERCEL || (options.isProduction ?? process.env.NODE_ENV === "production"));

    if (isSupabasePooler) {
      if (!parsed.port || parsed.port === "5432") {
        parsed.port = "6543";
      }
      if (!parsed.searchParams.has("pgbouncer")) {
        parsed.searchParams.set("pgbouncer", "true");
      }
      if (!parsed.searchParams.has("connection_limit")) {
        parsed.searchParams.set("connection_limit", isServerlessProd ? "1" : "3");
      }
      if (!parsed.searchParams.has("pool_timeout")) {
        parsed.searchParams.set("pool_timeout", "20");
      }
    } else if (
      isServerlessProd &&
      parsed.searchParams.get("pgbouncer") === "true" &&
      !parsed.searchParams.has("connection_limit")
    ) {
      parsed.searchParams.set("connection_limit", "1");
    }

    return parsed.toString();
  } catch {
    return rawUrl;
  }
}

const normalizedDatabaseUrl = normalizeDatabaseUrl(process.env.DATABASE_URL);

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    ...(normalizedDatabaseUrl ? { datasourceUrl: normalizedDatabaseUrl } : {}),
    log:
      process.env.PRISMA_LOG_QUERIES === "true"
        ? ["query", "error", "warn"]
        : process.env.NODE_ENV === "production"
          ? ["error"]
          : ["error", "warn"],
  });

globalForPrisma.prisma = db;

export interface TenantContext {
  userId?: string | null;
  organizationId?: string | null;
  role?: string | null;
  isOperator?: boolean;
  isServiceRole?: boolean;
}

/**
 * Executes database operations within a parameterised, transaction-local tenant context.
 * Sets transaction-scoped config variables ('closecraft.current_user_id', 'closecraft.current_org_id', etc.)
 * with is_local = true so parameters never leak across connection poolers (PgBouncer).
 * Drops to unprivileged role 'closecraft_app' with NOBYPASSRLS for ordinary customer operations.
 */
export async function withTenantContext<T>(
  ctx: TenantContext,
  fn: (tx: any) => Promise<T>
): Promise<T> {
  return await db.$transaction(async (tx) => {
    await tx.$executeRaw`
      SELECT 
        set_config('closecraft.current_user_id', COALESCE(${ctx.userId ?? ''}, ''), true),
        set_config('closecraft.current_org_id', COALESCE(${ctx.organizationId ?? ''}, ''), true),
        set_config('closecraft.current_role', COALESCE(${ctx.role ?? ''}, ''), true),
        set_config('closecraft.is_operator', ${ctx.isOperator ? 'true' : 'false'}, true),
        set_config('closecraft.is_service_role', ${ctx.isServiceRole ? 'true' : 'false'}, true);
    `;

    if (!ctx.isServiceRole && !ctx.isOperator) {
      await tx.$executeRaw`SET LOCAL ROLE closecraft_app;`;
    }

    return await fn(tx);
  });
}

