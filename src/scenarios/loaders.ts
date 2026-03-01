import type { ScenarioTemplate } from "@/types/scenario";
import type { IndustryId } from "@/types/industry";
import { ScenarioTemplateSchema } from "@/schemas";

const cache = new Map<IndustryId, ScenarioTemplate[]>();
const inflight = new Map<IndustryId, Promise<ScenarioTemplate[]>>();

const INDUSTRY_IMPORTERS: Record<IndustryId, () => Promise<{ default?: ScenarioTemplate[]; [key: string]: unknown }>> = {
  defense: () => import("./defense/_barrel").then((m) => ({ ...m, default: m.defenseScenarios })),
  finance: () => import("./finance/_barrel").then((m) => ({ ...m, default: m.financeScenarios })),
  healthcare: () => import("./healthcare/_barrel").then((m) => ({ ...m, default: m.healthcareScenarios })),
  saas: () => import("./saas/_barrel").then((m) => ({ ...m, default: m.saasScenarios })),
  "supply-chain": () => import("./supply-chain/_barrel").then((m) => ({ ...m, default: m.supplyChainScenarios })),
  web3: () => import("./web3/_barrel").then((m) => ({ ...m, default: m.web3Scenarios })),
};

export async function loadIndustryScenarios(industryId: IndustryId): Promise<ScenarioTemplate[]> {
  const cached = cache.get(industryId);
  if (cached) return cached;

  // Dedup concurrent calls
  let pending = inflight.get(industryId);
  if (pending) return pending;

  pending = INDUSTRY_IMPORTERS[industryId]()
    .then((mod) => {
      const raw = mod.default as ScenarioTemplate[];
      const validated = raw.map((s) => ScenarioTemplateSchema.parse(s) as ScenarioTemplate);
      cache.set(industryId, validated);
      inflight.delete(industryId);
      return validated;
    })
    .catch((err) => {
      inflight.delete(industryId);
      throw err;
    });

  inflight.set(industryId, pending);
  return pending;
}

export async function getScenarioByIdAsync(id: string): Promise<ScenarioTemplate | undefined> {
  // Search cached industries first
  for (const scenarios of cache.values()) {
    const found = scenarios.find((s) => s.id === id);
    if (found) return found;
  }

  // Load all remaining industries
  const all = await loadAllScenarios();
  return all.find((s) => s.id === id);
}

const ALL_INDUSTRIES: IndustryId[] = ["defense", "finance", "healthcare", "saas", "supply-chain", "web3"];

export async function loadAllScenarios(): Promise<ScenarioTemplate[]> {
  const results = await Promise.all(ALL_INDUSTRIES.map((id) => loadIndustryScenarios(id)));
  return results.flat();
}

/**
 * Fire-and-forget prefetch for an industry's scenarios.
 * Call on hover/focus to warm the cache before navigation.
 */
export function prefetchIndustryScenarios(industryId: IndustryId): void {
  if (cache.has(industryId) || inflight.has(industryId)) return;
  loadIndustryScenarios(industryId).catch(() => {
    // Swallow prefetch errors — the real load will surface them
  });
}
