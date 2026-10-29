import { NextResponse } from "next/server";

export async function withApiErrors(handler: () => Promise<NextResponse>): Promise<NextResponse> {
  try {
    return await handler();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("API Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
