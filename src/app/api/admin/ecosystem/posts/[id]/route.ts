// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db as prisma } from "@/lib/db";
import { withApiErrors } from "@/lib/apiError";
import { auth } from "@/lib/auth";
import { requireSuperAdmin } from "@/lib/apiSecurity";
import { statusAfterModeration } from "@/lib/ecosystem/educationPostCore";

const Body = z.object({ action: z.enum(["approve", "reject", "remove"]), note: z.string().trim().max(500).optional() });

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withApiErrors(async () => {
    const session = await auth();
    const adminCheck = await requireSuperAdmin(session);
    if (!adminCheck.authorized) return adminCheck.response;
    const parsed = Body.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    const post = await prisma.educationPost.findUnique({ where: { id }, select: { id: true, status: true } });
 if (!post) return NextResponse.json({ error: "Video not found." }, { status: 404 });

 const next = statusAfterModeration(post.status, parsed.data.action);
 if (!next) return NextResponse.json({ error: "That action is not available for this video's current state." }, { status: 409 });
 await prisma.educationPost.update({
 where: { id: post.id },
 data: {
 status: next,
 reviewedById: session.userId,
 reviewedAt: new Date(),
 reviewNote: parsed.data.note || null,
 ...(next === "PUBLISHED" && { publishedAt: new Date() }),
 },
 });
 return NextResponse.json({ status: next });
 });
}
