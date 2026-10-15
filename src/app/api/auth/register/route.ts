import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { RevenueEngine } from "@/lib/revenue-engine/engine";

export async function POST(req: Request) {
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
    const { user, org, welcomeLeadId } = await db.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: cleanCompanyName,
          slug,
          plan: "STARTER",
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

      // Create an initial sample lead so the new workspace immediately displays the Revenue Engine in action
      const welcomeLead = await tx.lead.create({
        data: {
          organizationId: org.id,
          name: "Adaeze Okoro",
          email: "adaeze.sample@cedarops.com",
          source: "Website Revenue Audit",
          status: "NEW",
          buyingIntent: 85,
          message: "We need an automated Revenue Growth Engine to qualify inbound consulting leads and schedule calls with our sales closers within 24 hours.",
        }
      });

      return { user, org, welcomeLeadId: welcomeLead.id };
    });

    // Process the welcome lead asynchronously with the Revenue Engine
    try {
      if (welcomeLeadId) {
        await RevenueEngine.processNewLead(welcomeLeadId);
      }
    } catch (engineErr) {
      console.warn("[Register] Non-blocking RevenueEngine preview error:", engineErr);
    }

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
