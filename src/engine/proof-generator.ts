import type { SimulationRun } from "@/types/simulation";
import type { ProofArtifact, SimulatedSignature } from "@/types/evidence";
import type { Actor } from "@/types/organization";
import { SimulationEventType } from "@/types/simulation";
import { sha256 } from "@/lib/hash";
import { canonicalJson } from "@/lib/canonical-json";
import { getMerkleProof } from "@/lib/merkle";

export async function generateProofArtifact(
  run: SimulationRun,
  actors: Actor[]
): Promise<ProofArtifact> {
  // 1. Canonical JSON of the run (excluding proof-related fields)
  const runData = {
    id: run.id,
    scenarioId: run.scenarioId,
    seed: run.seed,
    events: run.events,
    outcome: run.outcome,
    startedAt: run.startedAt,
    completedAt: run.completedAt,
  };
  const canonical = canonicalJson(runData);

  // 2. SHA-256 hash
  const hash = await sha256(canonical);

  // 3. Simulated signatures for each approver
  const signatures: SimulatedSignature[] = [];
  for (const event of run.events) {
    if (
      event.type === SimulationEventType.APPROVED ||
      event.type === SimulationEventType.FINALIZED
    ) {
      const actor = actors.find((a) => a.id === event.actorId);
      if (actor && event.type === SimulationEventType.APPROVED) {
        const sigData = `${event.actorId}:${event.timestamp}:${event.description}`;
        const signatureHash = await sha256(sigData);
        signatures.push({
          roleId: event.actorId,
          roleName: actor.label,
          signatureHash,
          timestamp: event.timestamp,
        });
      }
    }
  }

  // 4. Toy Merkle tree from event hashes
  const eventStrings = run.events.map((e) => canonicalJson(e));
  const finalizationIndex = run.events.findIndex(
    (e) => e.type === SimulationEventType.FINALIZED
  );
  const targetIndex = finalizationIndex >= 0 ? finalizationIndex : eventStrings.length - 1;

  const merkleResult = await getMerkleProof(eventStrings, targetIndex);
  const leafHash = await sha256(eventStrings[targetIndex] ?? "");

  return {
    version: "1.0",
    scenarioId: run.scenarioId,
    runId: run.id,
    canonicalJson: canonical,
    hash,
    signatures,
    merkleReceipt: {
      rootHash: merkleResult.root,
      leafHash,
      path: merkleResult.proof,
    },
    generatedAt: new Date().toISOString(),
  };
}

export async function verifyProofIntegrity(artifact: ProofArtifact): Promise<boolean> {
  const computedHash = await sha256(artifact.canonicalJson);
  return computedHash === artifact.hash;
}
