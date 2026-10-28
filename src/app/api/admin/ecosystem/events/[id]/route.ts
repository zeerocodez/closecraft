// @ts-nocheck
import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { withApiErrors } from "@/lib/apiError";
import { auth } from "@/lib/auth";
import { requireSuperAdmin } from "@/lib/apiSecurity";

export const dynamic = "force-dynamic";

/** POST /api/admin/ecosystem/events/[id] — SUPER_ADMIN takes an event down (kept, not deleted). */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withApiErrors(async () => {
    const session = await auth();
    const adminCheck = await requireSuperAdmin(session);
    if (!adminCheck.authorized) return adminCheck.response;
    const res = await prisma.organizationEvent.updateMany({ where: { id }, data: { status: "REMOVED" } });
    if (res.count === 0) return NextResponse.json({ error: "Event not found." }, { status: 404 });
    return NextResponse.json({ removed: true });
  });
}
