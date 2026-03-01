import { describe, it, expect } from "vitest";
import { generateProofArtifact, verifyProofIntegrity } from "../proof-generator";
import { runSimulation } from "../simulation-engine";
import { vendorAccessScenario } from "@/scenarios/vendor-access";

describe("generateProofArtifact", () => {
  it("generates a valid proof artifact", async () => {
    const run = runSimulation(vendorAccessScenario, vendorAccessScenario.policies, 42);
    const proof = await generateProofArtifact(run, vendorAccessScenario.actors);

    expect(proof.version).toBe("1.0");
    expect(proof.scenarioId).toBe("vendor-access");
    expect(proof.runId).toBeTruthy();
  });

  it("produces a 64-character hex hash", async () => {
    const run = runSimulation(vendorAccessScenario, vendorAccessScenario.policies, 42);
    const proof = await generateProofArtifact(run, vendorAccessScenario.actors);

    expect(proof.hash).toHaveLength(64);
    expect(proof.hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("produces deterministic canonical JSON", async () => {
    const run = runSimulation(vendorAccessScenario, vendorAccessScenario.policies, 42);
    const proof1 = await generateProofArtifact(run, vendorAccessScenario.actors);
    const proof2 = await generateProofArtifact(run, vendorAccessScenario.actors);

    expect(proof1.canonicalJson).toBe(proof2.canonicalJson);
    expect(proof1.hash).toBe(proof2.hash);
  });

  it("has signatures for approved events", async () => {
    const run = runSimulation(vendorAccessScenario, vendorAccessScenario.policies, 42);
    const proof = await generateProofArtifact(run, vendorAccessScenario.actors);

    expect(proof.signatures.length).toBeGreaterThan(0);
    for (const sig of proof.signatures) {
      expect(sig.signatureHash).toHaveLength(64);
      expect(sig.signatureHash).toMatch(/^[0-9a-f]{64}$/);
      expect(sig.roleName).toBeTruthy();
    }
  });

  it("has a valid merkle receipt", async () => {
    const run = runSimulation(vendorAccessScenario, vendorAccessScenario.policies, 42);
    const proof = await generateProofArtifact(run, vendorAccessScenario.actors);

    expect(proof.merkleReceipt.rootHash).toBeTruthy();
    expect(proof.merkleReceipt.leafHash).toBeTruthy();
    expect(proof.merkleReceipt.rootHash).toHaveLength(64);
  });

  it("verifies integrity successfully", async () => {
    const run = runSimulation(vendorAccessScenario, vendorAccessScenario.policies, 42);
    const proof = await generateProofArtifact(run, vendorAccessScenario.actors);

    const isValid = await verifyProofIntegrity(proof);
    expect(isValid).toBe(true);
  });

  it("detects tampered canonical JSON", async () => {
    const run = runSimulation(vendorAccessScenario, vendorAccessScenario.policies, 42);
    const proof = await generateProofArtifact(run, vendorAccessScenario.actors);

    // Tamper with the canonical JSON
    const tampered = { ...proof, canonicalJson: proof.canonicalJson + "tampered" };
    const isValid = await verifyProofIntegrity(tampered);
    expect(isValid).toBe(false);
  });

  it("has a generatedAt ISO timestamp", async () => {
    const run = runSimulation(vendorAccessScenario, vendorAccessScenario.policies, 42);
    const proof = await generateProofArtifact(run, vendorAccessScenario.actors);

    expect(proof.generatedAt).toBeTruthy();
    expect(new Date(proof.generatedAt).toISOString()).toBe(proof.generatedAt);
  });
});
