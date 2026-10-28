// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { db as prisma } from "@/lib/db";
import { withApiErrors } from "@/lib/apiError";
import { auth } from "@/lib/auth";
import { requireSuperAdmin } from "@/lib/apiSecurity";
import { EntrySchema } from "@/lib/guide/adminSchemas";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withApiErrors(async () => {
    const session = await auth();
    const adminCheck = await requireSuperAdmin(session);
    if (!adminCheck.authorized) return adminCheck.response;
    const parsed = EntrySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid answer." }, { status: 400 });
    const d = parsed.data;
    const res = await prisma.guideEntry.updateMany({
      where: { id },
      data: { question: d.question, answer: d.answer, links: d.links as Prisma.InputJsonValue, keywords: d.keywords, enabled: d.enabled },
    });
    if (res.count === 0) return NextResponse.json({ error: "Answer not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  });
}

/** DELETE /api/admin/guide/entries/[id] — SUPER_ADMIN removes a written answer. */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withApiErrors(async () => {
    const session = await auth();
    const adminCheck = await requireSuperAdmin(session);
    if (!adminCheck.authorized) return adminCheck.response;
    const res = await prisma.guideEntry.deleteMany({ where: { id } });
    if (res.count === 0) return NextResponse.json({ error: "Answer not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  });
}
