const SIDEBAR_PREFIXES = [
  "/dashboard",
  "/today",
  "/leads",
  "/inbox",
  "/pipeline",
  "/commitments",
  "/recovery",
  "/appointments",
  "/automations",
  "/billing",
  "/services",
  "/team",
  "/settings",
  "/sales-support",
  "/rep",
  "/operator",
  "/admin",
  "/dss",
  "/practice",
];

export const getSidebarRoutes = (): string[] => [...SIDEBAR_PREFIXES];

export const pageHasSidebar = (pathname: string): boolean => {
  if (!pathname) return false;
  return SIDEBAR_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
};

