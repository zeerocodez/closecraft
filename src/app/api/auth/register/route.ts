import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { RevenueEngine } from "@/lib/revenue-engine/engine";
import { rateLimit, clientIp } from "@/lib/rateLimit";

export async function POST(req: Request) {
  // Rate limit registration attempts: max 10 attempts per 15 minutes per IP
  const ip = clientIp(req);
  const limiter = await rateLimit(`auth-register:${ip}`, 10, 15 * 60 * 1000);
  if (!limiter.allowed) {
    return NextResponse.json(
      { error: "Too many registration attempts. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
    }

    const { name, email, password, companyName } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = typeof name === "string" && name.trim().length > 0 
      ? name.trim() 
      : cleanEmail.split("@")[0];
    const cleanCompanyName = typeof companyName === "string" && companyName.trim().length > 0 
      ? companyName.trim() 
      : `${cleanName}'s Workspace`;

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: cleanEmail },
      include: { memberships: true }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in instead." },
        { status: 409 }
      );
    }

    // Hash the password securely
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate a unique URL slug for the organization
    const baseSlug = cleanCompanyName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 30) || "workspace";

    let slug = baseSlug;
    const existingOrg = await db.organization.findUnique({
      where: { slug }
    });
    if (existingOrg) {
      slug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;
    }

    // Atomic transaction: create Organization, User, and OrganizationMember
    const { user, org } = await db.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: cleanCompanyName,
          slug,
          plan: "FREE_PILOT",
          status: "APPROVED", // Instant free pilot activation for real user testing
        }
      });

      const user = await tx.user.create({
        data: {
          email: cleanEmail,
          name: cleanName,
          passwordHash,
          emailVerified: new Date(),
          memberships: {
            create: {
              role: "ADMIN",
              organizationId: org.id
            }
          }
        }
      });

      return { user, org };
    });

    return NextResponse.json(
      {
        success: true,
        message: "Workspace created successfully.",
        userId: user.id,
        organizationId: org.id
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[Register Error]:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while creating your workspace. Please try again." },
      { status: 500 }
    );
  }
}
