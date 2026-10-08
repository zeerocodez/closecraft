// @ts-nocheck
import { NextResponse } from "next/server";
import { withApiErrors } from "@/lib/apiError";
import { auth } from "@/lib/auth";
import { getPlatformAnalytics } from "@/lib/ecosystem/insights";

export const dynamic = "force-dynamic";

/** GET /api/admin/ecosystem/analytics — SUPER_ADMIN, platform-wide totals (demo organizations excluded). */
export async function GET() {
  return withApiErrors(async () => {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json(await getPlatformAnalytics());
  });
}
