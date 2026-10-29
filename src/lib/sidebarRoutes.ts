const SIDEBAR_PREFIXES = [
  "/today",
  "/leads",
  "/inbox",
  "/pipeline",
  "/appointments",
  "/automations",
  "/billing",
  "/team",
  "/settings",
  "/sales-support",
  "/rep",
  "/operator",
  "/admin",
  "/dss",
];

export const getSidebarRoutes = (): string[] => [...SIDEBAR_PREFIXES];

export const pageHasSidebar = (pathname: string): boolean => {
  if (!pathname) return false;
  return SIDEBAR_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
};

