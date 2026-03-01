import { create, createStore, type StoreApi } from "zustand";
import {
  applyNodeChanges,
  applyEdgeChanges,
  type OnNodesChange,
  type OnEdgesChange,
} from "@xyflow/react";
import type { SimNode, SimEdge, SimulationNodeStatus, PolicyRole, AccumulateIdentityHint } from "@/types/canvas";
import type { ScenarioTemplate } from "@/types/scenario";
import type { Actor } from "@/types/organization";
import type { Policy } from "@/types/policy";

export interface CanvasStore {
  nodes: SimNode[];
  edges: SimEdge[];
  selectedNodeId: string | null;

  setNodes: (nodes: SimNode[]) => void;
  setEdges: (edges: SimEdge[]) => void;
  onNodesChange: OnNodesChange<SimNode>;
  onEdgesChange: OnEdgesChange<SimEdge>;
  selectNode: (id: string | null) => void;
  updateNodeSimStatus: (id: string, status: SimulationNodeStatus) => void;
  updateNodeHighlight: (id: string, highlighted: boolean) => void;
  updateNodeActive: (id: string, active: boolean) => void;
  updateNodeFrictionDescription: (id: string, description?: string) => void;
  updateEdgeAnimation: (id: string, animating: boolean) => void;
  updateEdgeFlowPacket: (id: string, label?: string, color?: string) => void;
  clearAllFlowPackets: () => void;
  triggerNodeReceiveRipple: (id: string) => void;
  addNode: (actor: Actor, position: { x: number; y: number }) => void;
  addEdge: (edge: SimEdge) => void;
  updateNodePolicy: (actorId: string, policy: Policy) => void;
  updateNodeLabel: (id: string, label: string) => void;
  loadScenario: (template: ScenarioTemplate) => void;
  /** Load scenario with explicit policy set: null = no pills (today), Policy[] = expanded matching (accumulate) */
  loadScenarioForRun: (template: ScenarioTemplate, policies: Policy[] | null) => void;
  /** Update all existing nodes with policy/identity data without changing positions or edges */
  provisionIdentities: (template: ScenarioTemplate, policies: Policy[]) => void;
  resetCanvas: () => void;
  resetSimStates: () => void;
}

/**
 * Find the policy and role for an actor given a set of policies.
 * Checks: direct owner (actorId), approver, delegate target, escalation target.
 */
function findPolicyForActor(
  actorId: string,
  policies: Policy[],
): { policy: Policy; role: PolicyRole } | undefined {
  for (const p of policies) {
    if (p.actorId === actorId) return { policy: p, role: "owner" };
  }
  for (const p of policies) {
    if (p.threshold.approverRoleIds.includes(actorId)) return { policy: p, role: "approver" };
  }
  for (const p of policies) {
    if (p.delegateToRoleId === actorId) return { policy: p, role: "delegate" };
  }
  for (const p of policies) {
    if (p.escalation?.toRoleIds.includes(actorId)) return { policy: p, role: "escalation" };
  }
  return undefined;
}

function defaultIdentityHint(actor: Actor, allActors: Actor[], policies: Policy[]): AccumulateIdentityHint {
  switch (actor.type) {
    case "organization": {
      // Signers = all descendant roles
      const signers = allActors.filter((a) => a.type === "role" && allActors.some(
        (dept) => dept.type === "department" && dept.parentId === actor.id && dept.id === a.parentId
      ));
      const nSign = Math.max(signers.length, 1);
      // Approvers = unique approver role IDs named in policies for this org
      const orgPolicies = policies.filter((p) => {
        const policyOwner = allActors.find((a) => a.id === p.actorId);
        return policyOwner?.organizationId === actor.organizationId;
      });
      const approverSet = new Set<string>();
      for (const p of orgPolicies) {
        for (const id of p.threshold.approverRoleIds) approverSet.add(id);
      }
      const nApprovers = Math.max(approverSet.size, 1);
      return { pills: [
        `${nSign} ${nSign === 1 ? "Signer" : "Signers"}`,
        `${nApprovers} ${nApprovers === 1 ? "Approver" : "Approvers"}`,
      ] };
    }
    case "department": {
      // Check if this department has a matching policy
      const deptPolicy = policies.find((p) => p.actorId === actor.id);
      if (deptPolicy) {
        return { pills: [`${deptPolicy.threshold.k}-of-${deptPolicy.threshold.n}`] };
      }
      // No policy — show signer count + 1 authority
      const roles = allActors.filter((a) => a.parentId === actor.id && a.type === "role");
      const nSign = Math.max(roles.length, 1);
      return { pills: [
        `${nSign} ${nSign === 1 ? "Signer" : "Signers"}`,
        "1 Authority",
      ] };
    }
    case "role":         return { pills: ["1 Authority", "3 Keys"] };
    case "system":       return { pills: ["Automated", "Signed"] };
    case "vendor":       return { pills: ["Verified ID"] };
    case "partner":      return { pills: ["Verified ID"] };
    case "regulator":    return { pills: ["Auditor"] };
    default:             return { pills: [] };
  }
}

function layoutScenarioNodes(template: ScenarioTemplate, policyOverride?: Policy[] | null): SimNode[] {
  const actors = template.actors;
  const roots = actors.filter((a) => a.parentId === null);

  const childrenOf = new Map<string, string[]>();
  for (const a of actors) {
    if (!childrenOf.has(a.id)) childrenOf.set(a.id, []);
    if (a.parentId) {
      const siblings = childrenOf.get(a.parentId) ?? [];
      siblings.push(a.id);
      childrenOf.set(a.parentId, siblings);
    }
  }

  const LEVEL_GAP = 170;
  const SIBLING_GAP = 250;

  // BFS to assign positions
  const queue: { id: string; depth: number; index: number; parentX: number }[] = [];
  const depthGroups = new Map<number, string[]>();

  for (let i = 0; i < roots.length; i++) {
    const root = roots[i]!;
    queue.push({ id: root.id, depth: 0, index: i, parentX: i * 400 });
  }

  while (queue.length > 0) {
    const item = queue.shift()!;
    const group = depthGroups.get(item.depth) ?? [];
    group.push(item.id);
    depthGroups.set(item.depth, group);

    const children = childrenOf.get(item.id) ?? [];
    const totalWidth = children.length * SIBLING_GAP;
    const startX = item.parentX - totalWidth / 2 + SIBLING_GAP / 2;

    for (let i = 0; i < children.length; i++) {
      queue.push({
        id: children[i]!,
        depth: item.depth + 1,
        index: i,
        parentX: startX + i * SIBLING_GAP,
      });
    }
  }

  const positions = new Map<string, { x: number; y: number }>();
  // Assign positions based on depth groups
  for (const [depth, ids] of depthGroups) {
    const totalWidth = ids.length * SIBLING_GAP;
    const startX = -totalWidth / 2 + SIBLING_GAP / 2;
    for (let i = 0; i < ids.length; i++) {
      positions.set(ids[i]!, { x: startX + i * SIBLING_GAP + 400, y: depth * LEVEL_GAP + 50 });
    }
  }

  // Determine which policies to use for node display:
  // - null  → no policies (today's manual process — no pills)
  // - array → use expanded matching (accumulate — pills on all participating nodes)
  // - undefined → legacy behavior: use template.policies with actorId-only match
  const policies = policyOverride === null
    ? null
    : policyOverride ?? template.policies;

  return actors.map((actor) => {
    const pos = positions.get(actor.id) ?? { x: 0, y: 0 };

    let policy: Policy | undefined;
    let policyRole: PolicyRole | undefined;
    let accumulateIdentity: AccumulateIdentityHint | undefined;

    if (policies !== null && policyOverride !== undefined) {
      // Expanded matching: check actorId, approverRoleIds, delegateToRoleId, escalation.toRoleIds
      const match = findPolicyForActor(actor.id, policies);
      if (match) {
        policy = match.policy;
        policyRole = match.role;
      } else {
        // No explicit policy role — show default identity pills
        accumulateIdentity = defaultIdentityHint(actor, actors, policies);
      }
    } else if (policies !== null) {
      // Legacy: actorId-only match (for sandbox/org-builder backward compat)
      policy = policies.find((p) => p.actorId === actor.id);
      policyRole = policy ? "owner" : undefined;
    }

    return {
      id: actor.id,
      type: "simNode",
      position: pos,
      data: {
        actor,
        policy,
        policyRole,
        accumulateIdentity,
        simulationStatus: "idle" as const,
        isHighlighted: false,
        isActive: false,
      },
    };
  });
}

function createEdgesFromTemplate(template: ScenarioTemplate): SimEdge[] {
  return template.edges.map((edge) => ({
    id: `${edge.sourceId}-${edge.targetId}`,
    source: edge.sourceId,
    target: edge.targetId,
    type: "simEdge",
    data: {
      type: edge.type,
      isAnimating: false,
    },
  }));
}

function canvasStoreCreator(set: StoreApi<CanvasStore>["setState"], get: StoreApi<CanvasStore>["getState"]): CanvasStore {
  return {
    nodes: [],
    edges: [],
    selectedNodeId: null,

    setNodes: (nodes) => set({ nodes }),
    setEdges: (edges) => set({ edges }),

    onNodesChange: (changes) =>
      set({ nodes: applyNodeChanges(changes, get().nodes) }),

    onEdgesChange: (changes) =>
      set({ edges: applyEdgeChanges(changes, get().edges) }),

    selectNode: (id) => set({ selectedNodeId: id }),

    updateNodeSimStatus: (id, status) =>
      set((state) => ({
        nodes: state.nodes.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, simulationStatus: status } } : n
        ),
      })),

    updateNodeHighlight: (id, highlighted) =>
      set((state) => ({
        nodes: state.nodes.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, isHighlighted: highlighted } } : n
        ),
      })),

    updateNodeActive: (id, active) =>
      set((state) => ({
        nodes: state.nodes.map((n) =>
          n.id === id
            ? { ...n, data: { ...n.data, isActive: active } }
            : active
              ? { ...n, data: { ...n.data, isActive: false } }
              : n
        ),
      })),

    updateNodeFrictionDescription: (id, description) =>
      set((state) => ({
        nodes: state.nodes.map((n) =>
          n.id === id
            ? { ...n, data: { ...n.data, frictionDescription: description } }
            : n
        ),
      })),

    updateEdgeAnimation: (id, animating) =>
      set((state) => ({
        edges: state.edges.map((e) =>
          e.id === id ? { ...e, data: { ...e.data!, isAnimating: animating } } : e
        ),
      })),

    updateEdgeFlowPacket: (id, label, color) =>
      set((state) => ({
        edges: state.edges.map((e) =>
          e.id === id
            ? { ...e, data: { ...e.data!, flowLabel: label, flowColor: color } }
            : e
        ),
      })),

    clearAllFlowPackets: () =>
      set((state) => ({
        edges: state.edges.map((e) =>
          e.data?.flowLabel
            ? { ...e, data: { ...e.data!, flowLabel: undefined, flowColor: undefined } }
            : e
        ),
      })),

    triggerNodeReceiveRipple: (id) =>
      set((state) => ({
        nodes: state.nodes.map((n) =>
          n.id === id
            ? { ...n, data: { ...n.data, receiveRipple: (n.data.receiveRipple ?? 0) + 1 } }
            : n
        ),
      })),

    addNode: (actor, position) =>
      set((state) => ({
        nodes: [
          ...state.nodes,
          {
            id: actor.id,
            type: "simNode",
            position,
            data: {
              actor,
              simulationStatus: "idle" as const,
              isHighlighted: false,
              isActive: false,
            },
          },
        ],
      })),

    addEdge: (edge) =>
      set((state) => ({ edges: [...state.edges, edge] })),

    updateNodePolicy: (actorId, policy) =>
      set((state) => ({
        nodes: state.nodes.map((n) =>
          n.id === actorId ? { ...n, data: { ...n.data, policy } } : n
        ),
      })),

    updateNodeLabel: (id, label) =>
      set((state) => ({
        nodes: state.nodes.map((n) =>
          n.id === id
            ? { ...n, data: { ...n.data, actor: { ...n.data.actor, label } } }
            : n
        ),
      })),

    loadScenario: (template) => {
      const nodes = layoutScenarioNodes(template);
      const edges = createEdgesFromTemplate(template);
      set({ nodes, edges, selectedNodeId: null });
    },

    loadScenarioForRun: (template, policies) => {
      const nodes = layoutScenarioNodes(template, policies);
      const edges = createEdgesFromTemplate(template);
      set({ nodes, edges, selectedNodeId: null });
    },

    provisionIdentities: (template, policies) =>
      set((state) => ({
        nodes: state.nodes.map((n) => {
          const actor = n.data.actor;
          const match = findPolicyForActor(actor.id, policies);
          const accumulateIdentity = defaultIdentityHint(actor, template.actors, policies);
          return {
            ...n,
            data: {
              ...n.data,
              policy: match?.policy,
              policyRole: match?.role,
              accumulateIdentity,
            },
          };
        }),
      })),

    resetCanvas: () => set({ nodes: [], edges: [], selectedNodeId: null }),

    resetSimStates: () =>
      set((state) => ({
        nodes: state.nodes.map((n) => ({
          ...n,
          data: {
            ...n.data,
            simulationStatus: "idle" as const,
            isHighlighted: false,
            isActive: false,
            frictionDescription: undefined,
            receiveRipple: undefined,
          },
        })),
        edges: state.edges.map((e) => ({
          ...e,
          data: { ...e.data!, isAnimating: false, flowLabel: undefined, flowColor: undefined },
        })),
      })),
  };
}

/** Create an independent canvas store instance (for split-screen) */
export function createCanvasStore(): StoreApi<CanvasStore> {
  return createStore<CanvasStore>((set, get) => canvasStoreCreator(set, get));
}

/** Singleton canvas store for existing consumers */
export const useCanvasStore = create<CanvasStore>((set, get) => canvasStoreCreator(set, get));
