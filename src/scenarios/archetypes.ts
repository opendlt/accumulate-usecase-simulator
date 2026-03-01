import type { FrictionProfile } from "@/types/friction";

export type ArchetypeId =
  | "multi-party-approval"
  | "emergency-break-glass"
  | "cross-org-boundary"
  | "time-bound-authority"
  | "threshold-escalation"
  | "delegated-authority"
  | "regulatory-compliance"
  | "key-ceremony";

export interface Archetype {
  id: ArchetypeId;
  name: string;
  description: string;
  defaultFriction: FrictionProfile;
}

export const ARCHETYPES: Record<ArchetypeId, Archetype> = {
  "multi-party-approval": {
    id: "multi-party-approval",
    name: "Multi-Party Approval",
    description: "K-of-N threshold requiring multiple independent approvals",
    defaultFriction: {
      unavailabilityRate: 0.4,
      approvalProbability: 0.7,
      delayMultiplierMin: 2,
      delayMultiplierMax: 5,
      blockDelegation: true,
      blockEscalation: false,
      manualSteps: [
        { trigger: "after-request", description: "Email sent to approval chain — waiting for inbox check", delaySeconds: 8 },
        { trigger: "before-approval", description: "Approver checking email, reviewing request in separate system", delaySeconds: 5 },
      ],
      narrativeTemplate: "Email-based approval chain",
    },
  },
  "emergency-break-glass": {
    id: "emergency-break-glass",
    name: "Emergency Break-Glass",
    description: "Time-critical override requiring rapid escalation",
    defaultFriction: {
      unavailabilityRate: 0.5,
      approvalProbability: 0.9,
      delayMultiplierMin: 3,
      delayMultiplierMax: 8,
      blockDelegation: true,
      blockEscalation: true,
      manualSteps: [
        { trigger: "after-request", description: "Paging on-call via phone tree — no response yet", delaySeconds: 12 },
        { trigger: "on-unavailable", description: "Trying backup phone number, leaving voicemail", delaySeconds: 10 },
      ],
      narrativeTemplate: "Phone tree escalation",
    },
  },
  "cross-org-boundary": {
    id: "cross-org-boundary",
    name: "Cross-Organization Boundary",
    description: "Bilateral approval requiring coordination across organizations",
    defaultFriction: {
      unavailabilityRate: 0.35,
      approvalProbability: 0.75,
      delayMultiplierMin: 2,
      delayMultiplierMax: 6,
      blockDelegation: true,
      blockEscalation: false,
      manualSteps: [
        { trigger: "after-request", description: "Request forwarded to external org — awaiting legal review", delaySeconds: 10 },
        { trigger: "before-approval", description: "Cross-org NDA verification in progress", delaySeconds: 6 },
      ],
      narrativeTemplate: "Cross-organization legal bottleneck",
    },
  },
  "time-bound-authority": {
    id: "time-bound-authority",
    name: "Time-Bound Authority",
    description: "Temporal enforcement with stale permission risks",
    defaultFriction: {
      unavailabilityRate: 0.3,
      approvalProbability: 0.8,
      delayMultiplierMin: 2,
      delayMultiplierMax: 4,
      blockDelegation: false,
      blockEscalation: false,
      expiryOverride: 25,
      manualSteps: [
        { trigger: "before-approval", description: "Manually checking if access approval is still current", delaySeconds: 4 },
      ],
      narrativeTemplate: "Manual permission window tracking",
    },
  },
  "threshold-escalation": {
    id: "threshold-escalation",
    name: "Threshold Escalation",
    description: "Auto-escalation replaced by manual Slack/email escalation",
    defaultFriction: {
      unavailabilityRate: 0.3,
      approvalProbability: 0.8,
      delayMultiplierMin: 2,
      delayMultiplierMax: 5,
      blockDelegation: false,
      blockEscalation: true,
      manualSteps: [
        { trigger: "after-request", description: "Posting in Slack channel for manual escalation", delaySeconds: 6 },
        { trigger: "on-unavailable", description: "DMing manager on Slack — awaiting response", delaySeconds: 8 },
      ],
      narrativeTemplate: "Manual Slack escalation",
    },
  },
  "delegated-authority": {
    id: "delegated-authority",
    name: "Delegated Authority",
    description: "Formal delegation replaced by ad-hoc workarounds",
    defaultFriction: {
      unavailabilityRate: 0.45,
      approvalProbability: 0.75,
      delayMultiplierMin: 2,
      delayMultiplierMax: 5,
      blockDelegation: true,
      blockEscalation: false,
      manualSteps: [
        { trigger: "on-unavailable", description: "Primary approver OOO — searching for someone with authority", delaySeconds: 10 },
        { trigger: "before-approval", description: "Ad-hoc backup confirming they have authority to approve", delaySeconds: 5 },
      ],
      narrativeTemplate: "Ad-hoc delegation workaround",
    },
  },
  "regulatory-compliance": {
    id: "regulatory-compliance",
    name: "Regulatory Compliance",
    description: "Filing delays and paper-based verification processes",
    defaultFriction: {
      unavailabilityRate: 0.25,
      approvalProbability: 0.85,
      delayMultiplierMin: 3,
      delayMultiplierMax: 7,
      blockDelegation: true,
      blockEscalation: true,
      manualSteps: [
        { trigger: "after-request", description: "Preparing compliance documentation package", delaySeconds: 8 },
        { trigger: "before-approval", description: "Manual regulatory checklist review in progress", delaySeconds: 6 },
      ],
      narrativeTemplate: "Paper-based compliance workflow",
    },
  },
  "key-ceremony": {
    id: "key-ceremony",
    name: "Key Ceremony",
    description: "Physical ceremony requiring coordinated scheduling",
    defaultFriction: {
      unavailabilityRate: 0.5,
      approvalProbability: 0.9,
      delayMultiplierMin: 4,
      delayMultiplierMax: 10,
      blockDelegation: true,
      blockEscalation: true,
      manualSteps: [
        { trigger: "after-request", description: "Scheduling physical key ceremony — coordinating 3+ calendars", delaySeconds: 15 },
        { trigger: "before-approval", description: "Participants traveling to secure facility", delaySeconds: 10 },
      ],
      narrativeTemplate: "Physical key ceremony scheduling",
    },
  },
};

export function getArchetype(id: ArchetypeId): Archetype {
  return ARCHETYPES[id];
}
