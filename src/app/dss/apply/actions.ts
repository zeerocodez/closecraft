"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function submitDSSApplication(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const contactRoute = formData.get("contactRoute") as string;
  const role = formData.get("role") as string;
  const offer = formData.get("offer") as string;
  const difficultConv = formData.get("difficultConv") as string;
  const handleBetter = formData.get("handleBetter") as string;
  const schedule = formData.get("schedule") as string;
  const access = formData.get("access") as string;
  const approver = formData.get("approver") as string;
  const payment = formData.get("payment") as string;
  const fitCall = formData.get("fitCall") as string;
  const wantReminders = formData.get("wantReminders") === "on";

  try {
    const org = await db.organization.findFirst(); // Using first org for now
    if (!org) throw new Error("No organization found");

    // Create the Lead in the Revenue Engine
    const lead = await db.lead.create({
      data: {
        name,
        email,
        phone,
        type: "MARKETING_LEAD",
        status: "NEW",
        source: "DSS Application Form",
        organizationId: org.id,
        message: `New DSS Application. Role: ${role}, Offer: ${offer}, Payment: ${payment}`,
        qualificationData: {
          create: {
            authority: approver,
            budget: payment,
            timeline: schedule,
            need: handleBetter,
            customData: JSON.stringify({
              contactRoute,
              difficultConv,
              access,
              fitCall,
              wantReminders
            })
          }
        }
      }
    });

    // Fire initial Revenue Action (Review Fit)
    await db.revenueAction.create({
      data: {
        type: "REVIEW_DSS_APPLICATION",
        reason: "New application needs fit review before invoice",
        priority: 80,
        recommendedActor: "HUMAN",
        status: "PENDING",
        organizationId: org.id,
        leadId: lead.id,
      }
    });

    revalidatePath("/(saas)/leads");
    return { success: true };
  } catch (error) {
    console.error("Failed to submit DSS application:", error);
    return { success: false, error: "Failed to submit application" };
  }
}
