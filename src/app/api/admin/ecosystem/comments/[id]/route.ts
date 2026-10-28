// @ts-nocheck
import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { withApiErrors } from "@/lib/apiError";
import { auth } from "@/lib/auth";
import { requireSuperAdmin } from "@/lib/apiSecurity";

export const dynamic = "force-dynamic";

/** POST /api/admin/ecosystem/comments/[id] — SUPER_ADMIN hides a comment (kept, not deleted). */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withApiErrors(async () => {
    const session = await auth();
    const adminCheck = await requireSuperAdmin(session);
    if (!adminCheck.authorized) return adminCheck.response;
    const res = await prisma.educationPostComment.updateMany({ where: { id }, data: { status: "HIDDEN" } });
    if (res.count === 0) return NextResponse.json({ error: "Comment not found." }, { status: 404 });
    return NextResponse.json({ hidden: true });
  });
}
