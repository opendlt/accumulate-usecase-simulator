import { NodeType } from "@/types/organization";
import type { ScenarioTemplate } from "@/types/scenario";
import { ARCHETYPES } from "../archetypes";
import { REGULATORY_DB } from "@/lib/regulatory-data";

export const subcontractorAccessScenario: ScenarioTemplate = {
  id: "defense-subcontractor-access",
  name: "SAP Subcontractor Access During Program Milestone",
  description:
    "A subcontractor engineer meeting SAP-eligible personnel security requirements (TS/SCI plus program-specific investigative prerequisites) needs read-in to a SAP compartment at the prime contractor's accredited SAP Facility (SAPF) for system integration testing. The Government Program Security Officer (GPSO) must adjudicate need-to-know, the FSO must validate collateral clearance in DISS and process the Visit Authorization Letter, and the Contractor PSO (CPSO) must coordinate indoctrination. The CPSO is TDY with no designated Alternate CPSO on the program access roster, stalling the indoctrination process. Assumes DD Form 254 has been issued and investigative requirements are satisfied.",
  icon: "ShieldCheck",
  industryId: "defense",
  archetypeId: "cross-org-boundary",
  prompt:
    "What happens when a subcontractor engineer needs SAP compartment read-in for a critical milestone but the Contractor PSO is TDY and no Alternate CPSO is designated on the program access roster?",
  actors: [
    {
      id: "prime-contractor",
      type: NodeType.Organization,
      label: "Prime Contractor",
      parentId: null,
      organizationId: "prime-contractor",
      color: "#22C55E",
    },
    {
      id: "contractor-corp",
      type: NodeType.Vendor,
      label: "Subcontractor",
      description: "Subcontractor under prime contract providing specialized engineering support per DD Form 254",
      parentId: null,
      organizationId: "contractor-corp",
      color: "#F59E0B",
    },
    {
      id: "gov-program-office",
      type: NodeType.Partner,
      label: "Government Program Office",
      description: "Government SAP program office responsible for need-to-know adjudication and indoctrination authorization per DoD 5205.07",
      parentId: null,
      organizationId: "gov-program-office",
      color: "#3B82F6",
    },
    {
      id: "facility-security",
      type: NodeType.Department,
      label: "Facility Security",
      description: "Prime contractor facility security responsible for collateral clearance verification in DISS, VAL processing, and NISPOM 32 CFR Part 117 compliance",
      parentId: "prime-contractor",
      organizationId: "prime-contractor",
      color: "#06B6D4",
    },
    {
      id: "gpso",
      type: NodeType.Role,
      label: "Gov't Program Security Officer",
      description: "GPSO responsible for need-to-know adjudication and SAP indoctrination authorization under DoD 5205.07 -- the government authority that must approve all SAP read-ins",
      parentId: "gov-program-office",
      organizationId: "gov-program-office",
      color: "#3B82F6",
    },
    {
      id: "fso",
      type: NodeType.Role,
      label: "Facility Security Officer",
      description: "FSO responsible for collateral clearance validation in DISS and Visit Authorization Letter processing per NISPOM 32 CFR Part 117",
      parentId: "facility-security",
      organizationId: "prime-contractor",
      color: "#94A3B8",
    },
    {
      id: "cpso",
      type: NodeType.Role,
      label: "Contractor PSO",
      description: "Contractor Program Security Officer facilitating SAP indoctrination, managing the contractor program access roster, and coordinating with the GPSO -- currently TDY at another facility",
      parentId: "prime-contractor",
      organizationId: "prime-contractor",
      color: "#94A3B8",
    },
    {
      id: "alt-cpso",
      type: NodeType.Role,
      label: "Alternate CPSO",
      description: "Designated alternate Contractor PSO authorized to facilitate SAP indoctrination coordination when the primary CPSO is unavailable",
      parentId: "prime-contractor",
      organizationId: "prime-contractor",
      color: "#94A3B8",
    },
    {
      id: "subcontractor-engineer",
      type: NodeType.Role,
      label: "Subcontractor Engineer",
      description: "Engineer meeting SAP-eligible personnel security requirements (TS/SCI plus program-specific investigative prerequisites) needing compartment read-in for integration testing",
      parentId: "contractor-corp",
      organizationId: "contractor-corp",
      color: "#F59E0B",
    },
  ],
  policies: [
    {
      id: "policy-sap-access",
      actorId: "prime-contractor",
      threshold: {
        k: 3,
        n: 3,
        approverRoleIds: ["gpso", "fso", "cpso"],
      },
      expirySeconds: 86400,
      delegationAllowed: true,
      delegateToRoleId: "alt-cpso",
      constraints: {
        environment: "sap-enclave",
      },
    },
  ],
  edges: [
    { sourceId: "prime-contractor", targetId: "facility-security", type: "authority" },
    { sourceId: "prime-contractor", targetId: "cpso", type: "authority" },
    { sourceId: "prime-contractor", targetId: "alt-cpso", type: "authority" },
    { sourceId: "facility-security", targetId: "fso", type: "authority" },
    { sourceId: "gov-program-office", targetId: "gpso", type: "authority" },
    { sourceId: "contractor-corp", targetId: "subcontractor-engineer", type: "authority" },
    { sourceId: "cpso", targetId: "alt-cpso", type: "delegation" },
  ],
  defaultWorkflow: {
    name: "SAP compartment read-in for subcontractor integration testing",
    initiatorRoleId: "cpso",
    targetAction: "SAP Compartment Read-In and SAPF Access for Integration Testing",
    description:
      "Contractor PSO initiates SAP indoctrination request on behalf of the subcontractor engineer. Requires GPSO need-to-know adjudication (mandatory), FSO collateral clearance validation in DISS with VAL processing, and CPSO coordination of indoctrination briefing. DD Form 254 and investigative requirements already satisfied.",
  },
  beforeMetrics: {
    manualTimeHours: 480,
    riskExposureDays: 30,
    auditGapCount: 6,
    approvalSteps: 9,
  },
  todayFriction: {
    ...ARCHETYPES["cross-org-boundary"].defaultFriction,
    manualSteps: [
      { trigger: "after-request", description: "CPSO submitting SAP indoctrination request to GPSO via SIPRNET -- FSO processing VAL and validating collateral clearance in DISS separately", delaySeconds: 10 },
      { trigger: "before-approval", description: "GPSO reviewing need-to-know justification against program access requirements -- FSO confirming TS/SCI eligibility and program-specific investigative prerequisites in DISS", delaySeconds: 8 },
      { trigger: "on-unavailable", description: "Contractor PSO TDY at another facility -- no designated Alternate CPSO on the program access roster, indoctrination coordination stalled", delaySeconds: 14 },
    ],
    narrativeTemplate: "SIPRNET coordination with manual DISS clearance validation, GPSO adjudication, and stalled CPSO indoctrination",
  },
  todayPolicies: [
    {
      id: "policy-sap-access-today",
      actorId: "prime-contractor",
      threshold: {
        k: 3,
        n: 3,
        approverRoleIds: ["gpso", "fso", "cpso"],
      },
      expirySeconds: 30,
      delegationAllowed: false,
      constraints: {
        environment: "sap-enclave",
      },
    },
  ],
  regulatoryContext: REGULATORY_DB.defense,
  tags: ["defense", "sap", "cross-org", "subcontractor", "diss", "clearance", "val", "gpso", "indoctrination", "sapf", "dod-5205-07"],
};
