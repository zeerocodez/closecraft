import { composeView } from "./core";
import { ALL_SAMPLES } from "./samples";
import { getEcosystemFlags, type EcosystemFlags } from "@/lib/ecosystem/flags";

export function emptyReal(): any {
  return {
    programs: [], jobs: [], organizations: [], trainees: [], events: [], videos: [], skills: [],
    stats: { organizations: 0, programs: 0, jobs: 0, videos: 0, trainees: 0 },
  };
}

export async function getLandingView(): Promise<{ view: any; flags: EcosystemFlags } | null> {
  const flags = await getEcosystemFlags();
  if (!flags.landing) return null;
  return { view: composeView(emptyReal(), ALL_SAMPLES, { placeholders: flags.placeholders }), flags };
}
export const OPEN_JOB_WHERE = {};
