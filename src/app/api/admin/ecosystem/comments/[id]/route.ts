// @ts-nocheck
import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { withApiErrors } from "@/lib/apiError";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** POST /api/admin/ecosystem/comments/[id] — SUPER_ADMIN hides a comment (kept, not deleted). */
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  return withApiErrors(async () => {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const res = await prisma.educationPostComment.updateMany({ where: { id: params.id }, data: { status: "HIDDEN" } });
    if (res.count === 0) return NextResponse.json({ error: "Comment not found." }, { status: 404 });
    return NextResponse.json({ hidden: true });
  });
}
