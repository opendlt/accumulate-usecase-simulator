/**
 * Session persistence — saves the visitor's last session state so returning
 * visitors get a personalized welcome-back experience.
 */

const STORAGE_KEY = "aas-session";

export interface SavedSession {
  scenarioId: string;
  scenarioName: string;
  industryId: string;
  industryName: string;
  completedAt: number;
  authorityScore?: number;
  authorityGrade?: string;
}

export function saveSession(session: SavedSession): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // ignore
  }
}

export function getSavedSession(): SavedSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedSession;
    // Consider sessions older than 30 days stale
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    if (Date.now() - parsed.completedAt > thirtyDays) {
      clearSavedSession();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearSavedSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Get visit count for the visitor
 */
const VISIT_KEY = "aas-visit-count";

export function getVisitCount(): number {
  try {
    return parseInt(localStorage.getItem(VISIT_KEY) ?? "0", 10);
  } catch {
    return 0;
  }
}

export function incrementVisitCount(): number {
  const count = getVisitCount() + 1;
  try {
    localStorage.setItem(VISIT_KEY, String(count));
  } catch {
    // ignore
  }
  return count;
}
