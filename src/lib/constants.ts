export const APP_NAME = "Accumulate Authority Simulator";

export const NODE_TYPE_META = {
  organization: {
    label: "Organization",
    color: "#3B82F6",
    borderClass: "border-[#3B82F6]/40",
    bgAccent: "rgba(59,130,246,0.10)",
  },
  department: {
    label: "Department",
    color: "#06B6D4",
    borderClass: "border-[#06B6D4]/40",
    bgAccent: "rgba(6,182,212,0.10)",
  },
  role: {
    label: "Role",
    color: "#94A3B8",
    borderClass: "border-[#94A3B8]/30",
    bgAccent: "rgba(148,163,184,0.06)",
  },
  vendor: {
    label: "Vendor",
    color: "#F59E0B",
    borderClass: "border-[#F59E0B]/30",
    bgAccent: "rgba(245,158,11,0.08)",
  },
  partner: {
    label: "Partner",
    color: "#06B6D4",
    borderClass: "border-[#06B6D4]/30",
    bgAccent: "rgba(6,182,212,0.08)",
  },
  regulator: {
    label: "Regulator",
    color: "#8B5CF6",
    borderClass: "border-[#8B5CF6]/40",
    bgAccent: "rgba(139,92,246,0.10)",
  },
  system: {
    label: "System",
    color: "#8B5CF6",
    borderClass: "border-[#8B5CF6]/40",
    bgAccent: "rgba(139,92,246,0.10)",
  },
} as const;

export const SIMULATION_BASE_DELAY_MS = 1500;

export const EXTERNAL_LINKS = {
  docs: "https://docs.accumulatenetwork.io",
  pilot: "https://accumulatenetwork.io/pilot",
  website: "https://accumulatenetwork.io",
} as const;

export const API_ENDPOINTS = {
  pilotIntake: "/api/pilot-intake",
} as const;

export const PILOT_TRACKS = [
  { id: "authority-mapping", label: "Authority Mapping" },
  { id: "compliance-automation", label: "Compliance Automation" },
  { id: "audit-modernization", label: "Audit Modernization" },
  { id: "identity-governance", label: "Identity Governance" },
  { id: "custom", label: "Custom Engagement" },
] as const;

export const PILOT_EMAIL = "pilot@accumulatenetwork.io";
