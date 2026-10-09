"use server";

import { db } from "@/lib/db";
import { sendClinicRegistration } from "@/lib/dss-emails";

export async function submitClinicRegistration(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const session = formData.get("session") as string;
  const question = formData.get("question") as string;
  const phone = formData.get("phone") as string;
  const wantReminders = formData.get("wantReminders") === "on";

  try {
    const org = await db.organization.findFirst(); 
    if (!org) throw new Error("No organization found");

    // Create or update Lead for the free clinic
    let lead = await db.lead.findFirst({
      where: { email, organizationId: org.id }
    });

    if (!lead) {
      lead = await db.lead.create({
        data: {
          name,
          email,
          phone: phone || undefined,
          type: "MARKETING_LEAD",
          status: "NEW",
          source: "DSS Free Clinic",
          organizationId: org.id,
          message: `Clinic Session: ${session}. Question: ${question}`,
        }
      });
    }

    // Record the registration in the Revenue Engine
    await db.revenueAction.create({
      data: {
        type: "CLINIC_REGISTRATION",
        reason: "Registered for free clinic",
        priority: 50,
        recommendedActor: "SYSTEM",
        status: "COMPLETED",
        organizationId: org.id,
        leadId: lead.id,
        result: `Registered for ${session}`
      }
    });

    // Send the email with the worksheet
    // Assuming clinic Access is a fixed link or retrieved from settings
    const clinicAccessLink = "https://meet.google.com/example";
    const auditLink = "https://closecraft.app/downloads/Ten_Enquiry_Sales_Audit.pdf";
    const [date, time] = session.split(", ");
    
    await sendClinicRegistration(email, name, date, time, clinicAccessLink, auditLink);

    // Schedule the Post-Clinic Application Prompt (from the Kit)
    await db.followUpTask.create({
      data: {
        actionType: "SEND_POST_CLINIC_PROMPT",
        scheduledFor: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days after registration/clinic
        status: "PENDING",
        reason: "Prompt to apply for the full DSS programme after the free clinic",
        organizationId: org.id,
        leadId: lead.id
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to register for clinic:", error);
    return { success: false, error: "Failed to register" };
  }
}
