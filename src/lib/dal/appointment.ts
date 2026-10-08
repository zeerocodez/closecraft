import { db } from "@/lib/db";

export async function getAppointmentsForTenant(organizationId: string) {
  return await db.appointment.findMany({
    where: { organizationId },
    include: {
      lead: true,
      organizer: true
    },
    orderBy: { startTime: 'asc' }
  });
}

export async function createAppointmentForTenant(data: {
  title: string;
  startTime: Date;
  endTime: Date;
  leadId: string;
  organizerId: string;
  organizationId: string;
}) {
  return await db.appointment.create({
    data: {
      title: data.title,
      startTime: data.startTime,
      endTime: data.endTime,
      status: 'SCHEDULED',
      leadId: data.leadId,
      organizerId: data.organizerId,
      organizationId: data.organizationId
    }
  });
}
