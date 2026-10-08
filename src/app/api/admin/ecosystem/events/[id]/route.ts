// @ts-nocheck
import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { withApiErrors } from "@/lib/apiError";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** POST /api/admin/ecosystem/events/[id] — SUPER_ADMIN takes an event down (kept, not deleted). */
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  return withApiErrors(async () => {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const res = await prisma.organizationEvent.updateMany({ where: { id: params.id }, data: { status: "REMOVED" } });
    if (res.count === 0) return NextResponse.json({ error: "Event not found." }, { status: 404 });
    return NextResponse.json({ removed: true });
  });
}
