import React from 'react';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import AppointmentsClient from './AppointmentsClient';

export default async function AppointmentsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const organizationId = session.organizationId;
  if (!organizationId) {
    redirect('/login');
  }

  // Fetch appointments for this organization
  const appointments = await db.appointment.findMany({
    where: { organizationId },
    include: {
      lead: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          buyingIntent: true,
        }
      },
      closer: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        }
      }
    },
    orderBy: { scheduledAt: 'asc' }
  });

  // Fetch leads so user can schedule an appointment for any prospect
  const leads = await db.lead.findMany({
    where: { organizationId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
    },
    orderBy: { createdAt: 'desc' }
  });

  // Fetch team members
  const teamMembers = await db.organizationMember.findMany({
    where: { organizationId },
    include: {
      user: {
        select: { id: true, name: true, email: true }
      }
    },
    orderBy: { createdAt: 'asc' }
  });

  // Fetch caller's membership
  const member = await db.organizationMember.findFirst({
    where: { userId: session.user.id, organizationId }
  });

  return (
    <AppointmentsClient
      appointments={appointments}
      leads={leads}
      teamMembers={teamMembers}
      currentUser={{
        id: session.user.id,
        name: session.user.name,
        email: session.user.email || '',
      }}
      googleCalendarConnected={member?.googleCalendarConnected ?? false}
      googleCalendarEmail={member?.googleCalendarEmail}
    />
  );
}
