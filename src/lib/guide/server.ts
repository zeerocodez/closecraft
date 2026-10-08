import { db as prisma } from "@/lib/db";
import { getEcosystemFlags } from "@/lib/ecosystem/flags";
import { DEFAULT_ENTRIES } from "@/lib/guide/defaults";
import type { MeKind } from "@/lib/guide/context";
import { sanitizeLinks } from "@/lib/guide/links";
import { scrubQuestion } from "@/lib/guide/scrub";
import type { GuideEntry, GuideSwitches } from "@/lib/guide/types";

export const MAX_CUSTOM_ENTRIES = 200;
const MAX_OPEN_UNANSWERED = 2000;

export interface GuideConfig {
  enabled: boolean;
  switches: GuideSwitches;
  entries: GuideEntry[];
  skills: string[];
}

export function toEntry(row: { id: string; question: string; answer: string; links: unknown; keywords: string[] }): GuideEntry {
  return { id: `custom:${row.id}`, question: row.question, answer: row.answer, links: sanitizeLinks(row.links), keywords: row.keywords, source: "custom" };
}

export async function loadGuideConfig(): Promise<GuideConfig> {
  const flags = await getEcosystemFlags();
  const settings = await prisma.platformSettings.findUnique({ where: { id: "singleton" }, select: { guideEnabled: true } }).catch(() => null);
  
  const switches: GuideSwitches = { orgPages: flags.orgPages, education: flags.education, feed: flags.feed, publicJobs: flags.publicJobs, publicTrainees: flags.publicTrainees };
  const enabled = settings ? settings.guideEnabled : true;
  if (!enabled) return { enabled: false, switches, entries: [], skills: [] };

  const custom = await prisma.guideEntry.findMany({ 
    where: { enabled: true }, 
    orderBy: { createdAt: "asc" }, 
    take: MAX_CUSTOM_ENTRIES, 
    select: { id: true, question: true, answer: true, links: true, keywords: true } 
  }).catch(() => []);
  
  // Skills stubbed because it's deeply tied to AAICBI
  const skills: string[] = []; 
  
  return { enabled, switches, entries: [...DEFAULT_ENTRIES, ...custom.map(toEntry)], skills };
}

export async function whoAmI(): Promise<MeKind | null> {
  // Stubbed because auth sessions are handled differently in closecraft
  return null;
}

export async function recordUnanswered(question: string): Promise<boolean> {
  const text = scrubQuestion(question);
  if (!text) return false;
  
  const existing = await prisma.guideUnanswered.findUnique({ where: { text }, select: { id: true } });
  if (!existing) {
    const open = await prisma.guideUnanswered.count({ where: { status: "OPEN" } });
    if (open >= MAX_OPEN_UNANSWERED) return false;
  }
  
  await prisma.guideUnanswered.upsert({
    where: { text },
    create: { text },
    update: { asked: { increment: 1 }, lastAskedAt: new Date() },
  });
  
  return true;
}
