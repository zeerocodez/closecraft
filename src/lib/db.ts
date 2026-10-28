import { PrismaClient } from "@prisma/client";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

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

