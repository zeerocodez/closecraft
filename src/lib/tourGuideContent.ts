export interface TourGuideEntry {
  title: string;
  notes: string[];
}

const DEFAULT_ENTRY: TourGuideEntry = {
  title: "Closecraft Revenue Platform",
  notes: [
    "Navigate between Leads, Inbox, Pipeline, and DSS Academy using the top and side navigation.",
    "Review prioritized revenue actions, deal progress, and real-time communication feeds.",
  ],
};

const ROUTE_GUIDES: Record<string, TourGuideEntry> = {
  "/leads": {
    title: "Leads Command",
    notes: [
      "Review incoming enquiries, lead qualification scores, and revenue priorities.",
      "Execute Next Best Actions via WhatsApp outreach, email, or telephone call.",
      "Assign unassigned leads to closers or setters according to workspace policy.",
    ],
  },
  "/inbox": {
    title: "Omnichannel Revenue Inbox",
    notes: [
      "Unified conversation stream across WhatsApp, SMS, and Email.",
      "AI-suggested messages are drafted for review before sending.",
      "Track response times against SLA targets to prevent deal leakage.",
    ],
  },
  "/pipeline": {
    title: "Revenue Pipeline",
    notes: [
      "Kanban pipeline tracking deals from Discovery through Proposal to Won.",
      "Monitor deal values, expected close dates, and stalled opportunities.",
      "Identify revenue leaks where next actions have lapsed past their SLA.",
    ],
  },
  "/today": {
    title: "Today's Action Centre",
    notes: [
      "Daily queue of urgent revenue actions and hot leads.",
      "Appointments scheduled for today with automated reminder status.",
      "Overdue follow-ups requiring immediate customer contact.",
    ],
  },
  "/appointments": {
    title: "Appointments & Scheduling",
    notes: [
      "View confirmed and pending sales discovery calls.",
      "Track attendance, cancellation rates, and automated reminder sequences.",
    ],
  },
  "/billing": {
    title: "Billing & Subscriptions",
    notes: [
      "Manage your workspace tier (Starter, Pro, Scale) via Bachs payment integration.",
      "View invoice history, seat allocations, and payment verification receipts.",
    ],
  },
  "/dss": {
    title: "Digital Sales School (DSS)",
    notes: [
      "Interactive sales curriculum and competence progression modules.",
      "Practice with AI Buyer Roleplay scenarios and receive automated grading.",
      "Track your certification progress and portfolio artifacts.",
    ],
  },
};

export function getTourGuideContent(pathname?: string): TourGuideEntry {
  if (!pathname) return DEFAULT_ENTRY;

  const matchedRoute = Object.keys(ROUTE_GUIDES).find(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  return matchedRoute ? ROUTE_GUIDES[matchedRoute] : DEFAULT_ENTRY;
}

export function getSidebarTourGuideContent(pathname?: string): TourGuideEntry {
  return getTourGuideContent(pathname);
}

