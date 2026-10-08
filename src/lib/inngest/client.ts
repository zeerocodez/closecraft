import { Inngest } from 'inngest';

// Define the events that will pass through the event bus
export type Events = {
  'lead/created': {
    data: {
      leadId: string;
      source: string;
    }
  },
  'lead/message.received': {
    data: {
      leadId: string;
      messageId: string;
    }
  }
};

// Create the Inngest client
export const inngest = new Inngest({ id: 'closecraft-revenue-engine' });
