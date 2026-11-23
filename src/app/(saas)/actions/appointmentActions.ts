'use server'

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createAppointment(data: { title: string; startTime: string; endTime: string; leadId: string }) {
  const session = await auth();
  const organizationId = (session as any)?.organizationId;
  const organizerId = session?.user?.id;
  if (!organizationId || !organizerId) throw new Error("Unauthorized");

  const { createAppointmentForTenant } = await import('@/lib/dal/appointment');

  const appointment = await createAppointmentForTenant({
    title: data.title,
    startTime: new Date(data.startTime),
    endTime: new Date(data.endTime),
    leadId: data.leadId,
    organizerId,
    organizationId
  });

  revalidatePath('/appointments');
  return appointment;
}

export async function updateGoogleCalendarIntegration(data: {
  googleCalendarConnected: boolean;
  googleCalendarEmail?: string;
  reminderChannels?: string;
}) {
  const session = await auth();
  const organizationId = (session as any)?.organizationId;
  const userId = session?.user?.id;
  if (!organizationId || !userId) throw new Error("Unauthorized");

  const member = await db.organizationMember.findFirst({
    where: { userId, organizationId }
  });
  if (!member) throw new Error("Member not found");

  const updated = await db.organizationMember.update({
    where: { id: member.id },
    data: {
      googleCalendarConnected: data.googleCalendarConnected,
      googleCalendarEmail: data.googleCalendarEmail || session?.user?.email,
      reminderChannels: data.reminderChannels || member.reminderChannels
    }
  });

  revalidatePath('/rep');
  revalidatePath('/closer');
  revalidatePath('/appointments');
  revalidatePath('/team');
  return { success: true, member: updated };
}

export async function bookOrUpdateAppointment(data: {
  id?: string;
  leadId: string;
  title: string;
  scheduledAt: string;
  durationMinutes?: number;
  meetingUrl?: string;
  notes?: string;
  closerId?: string;
}) {
  const session = await auth();
  const organizationId = (session as any)?.organizationId;
  const userId = session?.user?.id;
  if (!organizationId || !userId) throw new Error("Unauthorized");

  const lead = await db.lead.findFirst({
    where: { id: data.leadId, organizationId }
  });
  if (!lead) throw new Error("Lead not found or unauthorized");

  const effectiveCloserId = data.closerId || lead.assignedUserId || userId;

  let appointment;
  if (data.id) {
    appointment = await db.appointment.update({
      where: { id: data.id },
      data: {
        title: data.title,
        scheduledAt: new Date(data.scheduledAt),
        durationMinutes: data.durationMinutes || 30,
        meetingUrl: data.meetingUrl || `https://meet.google.com/cls-${Math.random().toString(36).substring(2, 6)}-crf`,
        notes: data.notes,
        closerId: effectiveCloserId
      }
    });
  } else {
    appointment = await db.appointment.create({
      data: {
        title: data.title,
        scheduledAt: new Date(data.scheduledAt),
        durationMinutes: data.durationMinutes || 30,
        meetingUrl: data.meetingUrl || `https://meet.google.com/cls-${Math.random().toString(36).substring(2, 6)}-crf`,
        notes: data.notes,
        leadId: data.leadId,
        organizationId,
        closerId: effectiveCloserId,
        googleEventId: `gcal_${Date.now()}`
      }
    });

    await db.lead.update({
      where: { id: data.leadId },
      data: { status: 'SCHEDULED' }
    });
  }

  revalidatePath('/appointments');
  revalidatePath('/rep');
  revalidatePath('/closer');
  revalidatePath('/leads');
  return { success: true, appointment };
}

export async function updateAppointmentStatus(appointmentId: string, status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED') {
  const session = await auth();
  const organizationId = (session as any)?.organizationId;
  if (!organizationId) throw new Error("Unauthorized");

  const appointment = await db.appointment.findFirst({
    where: { id: appointmentId, organizationId }
  });
  if (!appointment) throw new Error("Appointment not found");

  const updated = await db.appointment.update({
    where: { id: appointmentId },
    data: { status }
  });

  revalidatePath('/appointments');
  revalidatePath('/rep');
  revalidatePath('/closer');
  return { success: true, appointment: updated };
}
