import { getLandingView } from "@/lib/landing/data";
import LandingClientWrapper from "./LandingClientWrapper";

export const revalidate = 300;

export default async function MarketingPage() {
  const landing = await getLandingView().catch(() => null);
  const eco = landing?.view ?? null;
  const flags = landing?.flags ?? null;

  return <LandingClientWrapper eco={eco} flags={flags} />;
}
