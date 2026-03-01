import type { IndustryId } from "@/types/industry";

interface UrlParams {
  scenarioId?: string;
  industryId?: IndustryId;
  seed?: number;
  autoplay?: string;
}

export function getScenarioIdFromUrl(): string | null {
  const hash = window.location.hash;
  // New format: #i=defense&s=subcontractor-access&seed=42
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const newScenario = params.get("s");
  if (newScenario) return newScenario;

  // Legacy format: #scenario=xxx
  const match = hash.match(/^#scenario=(.+)$/);
  return match?.[1] ?? null;
}

export function getIndustryIdFromUrl(): IndustryId | null {
  const hash = window.location.hash;
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  return (params.get("i") as IndustryId) ?? null;
}

export function getSeedFromUrl(): number | null {
  const hash = window.location.hash;
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const seed = params.get("seed");
  return seed ? parseInt(seed, 10) : null;
}

export function getAutoplayFromUrl(): string | null {
  const hash = window.location.hash;
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  return params.get("autoplay");
}

export function setUrlParams(p: UrlParams): void {
  const parts: string[] = [];
  if (p.industryId) parts.push(`i=${p.industryId}`);
  if (p.scenarioId) parts.push(`s=${p.scenarioId}`);
  if (p.seed !== undefined) parts.push(`seed=${p.seed}`);
  if (p.autoplay) parts.push(`autoplay=${p.autoplay}`);
  window.location.hash = parts.join("&");
}

export function setScenarioIdInUrl(scenarioId: string): void {
  // Preserve existing industry if present
  const industryId = getIndustryIdFromUrl();
  setUrlParams({ industryId: industryId ?? undefined, scenarioId });
}

export function buildShareUrl(scenarioId: string, industryId?: IndustryId, seed?: number): string {
  const url = new URL(window.location.href);
  const parts: string[] = [];
  if (industryId) parts.push(`i=${industryId}`);
  parts.push(`s=${scenarioId}`);
  if (seed !== undefined) parts.push(`seed=${seed}`);
  url.hash = parts.join("&");
  return url.toString();
}

export function buildShareResultsUrl(scenarioId: string, industryId?: IndustryId, seed?: number): string {
  const url = new URL(window.location.href);
  const parts: string[] = [];
  if (industryId) parts.push(`i=${industryId}`);
  parts.push(`s=${scenarioId}`);
  if (seed !== undefined) parts.push(`seed=${seed}`);
  parts.push(`autoplay=results`);
  url.hash = parts.join("&");
  return url.toString();
}
