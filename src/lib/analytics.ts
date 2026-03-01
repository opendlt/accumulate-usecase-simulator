/**
 * Lightweight analytics tracking for the conversion funnel.
 *
 * Events are buffered and flushed to:
 *  1. window.dataLayer (GTM / GA4)  – if available
 *  2. navigator.sendBeacon           – if an endpoint is configured
 *  3. localStorage                   – always (for internal dashboards / debugging)
 *
 * No PII is ever stored — only event names, timestamps, and scenario metadata.
 */

const STORAGE_KEY = "aas-analytics";
const MAX_STORED_EVENTS = 500;

export type FunnelEvent =
  | "hero_viewed"
  | "industry_selected"
  | "scenario_selected"
  | "simulation_started"
  | "simulation_completed"
  | "simulation_skipped"
  | "comparison_viewed"
  | "evidence_tab_opened"
  | "evidence_screen_opened"
  | "roi_calculator_opened"
  | "roi_calculator_saved"
  | "cta_talk_to_engineer"
  | "pilot_form_opened"
  | "pilot_form_submitted"
  | "share_link_copied"
  | "share_email_opened"
  | "assessment_downloaded"
  | "share_modal_opened"
  | "run_another_scenario"
  | "breadcrumb_navigated"
  | "keyboard_shortcut_used"
  | "roi_nudge_shown"
  | "roi_nudge_clicked"
  | "roi_nudge_dismissed"
  | "returning_visitor"
  | "autoplay_triggered";

interface AnalyticsEvent {
  event: FunnelEvent;
  timestamp: number;
  sessionId: string;
  metadata?: Record<string, string | number | boolean>;
}

// Generate a session ID that persists for this browser session
function getSessionId(): string {
  let id = sessionStorage.getItem("aas-session-id");
  if (!id) {
    id = `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem("aas-session-id", id);
  }
  return id;
}

const sessionId = getSessionId();

function getStoredEvents(): AnalyticsEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AnalyticsEvent[]) : [];
  } catch {
    return [];
  }
}

function storeEvent(event: AnalyticsEvent) {
  try {
    const events = getStoredEvents();
    events.push(event);
    // Keep only the most recent events
    const trimmed = events.slice(-MAX_STORED_EVENTS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

/**
 * Track a funnel event.
 */
export function trackEvent(
  event: FunnelEvent,
  metadata?: Record<string, string | number | boolean>,
) {
  const analyticsEvent: AnalyticsEvent = {
    event,
    timestamp: Date.now(),
    sessionId,
    metadata,
  };

  // 1. Store locally (always)
  storeEvent(analyticsEvent);

  // 2. Push to GTM dataLayer if available
  const win = window as unknown as Record<string, unknown>;
  if (typeof window !== "undefined" && Array.isArray(win.dataLayer)) {
    (win.dataLayer as unknown[]).push({
      event: `aas_${event}`,
      ...metadata,
    });
  }

  // 3. Console in development
  if (import.meta.env.DEV) {
    console.log(`[Analytics] ${event}`, metadata ?? "");
  }
}

/**
 * Get funnel conversion stats from stored events.
 */
export function getFunnelStats(): Record<FunnelEvent, number> {
  const events = getStoredEvents();
  const counts = {} as Record<FunnelEvent, number>;
  for (const e of events) {
    counts[e.event] = (counts[e.event] ?? 0) + 1;
  }
  return counts;
}

/**
 * Check if this is a returning visitor (has previous session events).
 */
export function isReturningVisitor(): boolean {
  const events = getStoredEvents();
  if (events.length === 0) return false;
  // Check if there are events from a different session
  return events.some((e) => e.sessionId !== sessionId);
}

/**
 * Get the last scenario the visitor interacted with.
 */
export function getLastScenario(): { scenarioId: string; industryId: string } | null {
  const events = getStoredEvents();
  for (let i = events.length - 1; i >= 0; i--) {
    const e = events[i]!;
    if (e.metadata?.scenarioId && e.sessionId !== sessionId) {
      return {
        scenarioId: e.metadata.scenarioId as string,
        industryId: (e.metadata.industryId as string) ?? "",
      };
    }
  }
  return null;
}
