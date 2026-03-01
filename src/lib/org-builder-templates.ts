import type { IndustryId } from "@/types/industry";

export interface OrgTemplate {
  departments: string[];
  roles: Record<string, string[]>;
  defaultPolicy: {
    threshold: number;
    expiryHours: number;
    delegationAllowed: boolean;
  };
}

export const ORG_TEMPLATES: Record<IndustryId, OrgTemplate> = {
  healthcare: {
    departments: ["Compliance", "Clinical", "IT"],
    roles: {
      Compliance: ["Privacy Officer", "Compliance Analyst"],
      Clinical: ["Attending Physician", "Department Head"],
      IT: ["CISO", "Systems Admin"],
    },
    defaultPolicy: { threshold: 1, expiryHours: 24, delegationAllowed: true },
  },
  finance: {
    departments: ["Treasury", "Risk", "Operations"],
    roles: {
      Treasury: ["CFO", "Treasury Manager"],
      Risk: ["Chief Risk Officer", "Risk Analyst"],
      Operations: ["COO", "Operations Manager"],
    },
    defaultPolicy: { threshold: 2, expiryHours: 4, delegationAllowed: false },
  },
  defense: {
    departments: ["Security", "Engineering", "Program Management"],
    roles: {
      Security: ["FSO", "Security Officer"],
      Engineering: ["Lead Engineer", "Systems Engineer"],
      "Program Management": ["Program Manager", "Contracts Officer"],
    },
    defaultPolicy: { threshold: 2, expiryHours: 8, delegationAllowed: true },
  },
  saas: {
    departments: ["Engineering", "Security", "DevOps"],
    roles: {
      Engineering: ["VP Engineering", "Tech Lead"],
      Security: ["CISO", "Security Engineer"],
      DevOps: ["SRE Lead", "Platform Engineer"],
    },
    defaultPolicy: { threshold: 2, expiryHours: 2, delegationAllowed: true },
  },
  "supply-chain": {
    departments: ["Quality", "Logistics", "Procurement"],
    roles: {
      Quality: ["QA Director", "Quality Inspector"],
      Logistics: ["Logistics Manager", "Shipping Coordinator"],
      Procurement: ["Chief Procurement Officer", "Vendor Manager"],
    },
    defaultPolicy: { threshold: 1, expiryHours: 12, delegationAllowed: true },
  },
  web3: {
    departments: ["Protocol", "Security", "Treasury"],
    roles: {
      Protocol: ["Core Developer", "Protocol Lead"],
      Security: ["Security Lead", "Auditor"],
      Treasury: ["Treasury Manager", "Finance Lead"],
    },
    defaultPolicy: { threshold: 3, expiryHours: 1, delegationAllowed: false },
  },
};

export function getOrgTemplate(industryId: IndustryId): OrgTemplate {
  return ORG_TEMPLATES[industryId];
}
