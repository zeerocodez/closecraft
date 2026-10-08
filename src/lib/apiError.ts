import { NextResponse } from "next/server";

export async function withApiErrors(handler: () => Promise<NextResponse>) {
  try {
    return await handler();
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
