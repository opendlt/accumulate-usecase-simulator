export enum NodeType {
  Organization = "organization",
  Department = "department",
  Role = "role",
  Vendor = "vendor",
  Partner = "partner",
  Regulator = "regulator",
  System = "system",
}

export interface Actor {
  id: string;
  type: NodeType;
  label: string;
  description?: string;
  parentId: string | null;
  organizationId: string;
  color: string;
}
