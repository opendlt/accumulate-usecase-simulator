export interface ThresholdPolicy {
  k: number;
  n: number;
  approverRoleIds: string[];
}

export interface EscalationRule {
  afterSeconds: number;
  toRoleIds: string[];
}

export interface Policy {
  id: string;
  actorId: string;
  threshold: ThresholdPolicy;
  expirySeconds: number;
  delegationAllowed: boolean;
  delegateToRoleId?: string;
  mandatoryApprovers?: string[];
  delegationConstraints?: string;
  escalation?: EscalationRule;
  constraints?: {
    amountMax?: number;
    environment?: "production" | "non-production" | "sap-enclave" | "any";
  };
}
