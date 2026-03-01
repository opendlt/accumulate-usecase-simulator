import { sha256 } from "./hash";

export interface MerkleNode {
  hash: string;
  left?: MerkleNode;
  right?: MerkleNode;
}

export interface MerkleProofStep {
  hash: string;
  position: "left" | "right";
}

export async function buildMerkleTree(leaves: string[]): Promise<MerkleNode | null> {
  if (leaves.length === 0) return null;

  let nodes: MerkleNode[] = [];
  for (const leaf of leaves) {
    nodes.push({ hash: await sha256(leaf) });
  }

  while (nodes.length > 1) {
    const nextLevel: MerkleNode[] = [];
    for (let i = 0; i < nodes.length; i += 2) {
      const left = nodes[i]!;
      const right = nodes[i + 1] ?? left;
      const combinedHash = await sha256(left.hash + right.hash);
      nextLevel.push({ hash: combinedHash, left, right });
    }
    nodes = nextLevel;
  }

  return nodes[0] ?? null;
}

export async function getMerkleProof(
  leaves: string[],
  targetIndex: number
): Promise<{ root: string; proof: MerkleProofStep[] }> {
  if (leaves.length === 0 || targetIndex < 0 || targetIndex >= leaves.length) {
    return { root: "", proof: [] };
  }

  const hashes: string[] = [];
  for (const leaf of leaves) {
    hashes.push(await sha256(leaf));
  }

  const proof: MerkleProofStep[] = [];
  let currentIndex = targetIndex;
  let level = [...hashes];

  while (level.length > 1) {
    const nextLevel: string[] = [];
    for (let i = 0; i < level.length; i += 2) {
      const left = level[i]!;
      const right = level[i + 1] ?? left;

      if (i === currentIndex || i + 1 === currentIndex) {
        if (currentIndex % 2 === 0) {
          const rightSibling = level[i + 1];
          if (rightSibling) {
            proof.push({ hash: rightSibling, position: "right" });
          }
        } else {
          proof.push({ hash: level[i]!, position: "left" });
        }
      }

      nextLevel.push(await sha256(left + right));
    }
    currentIndex = Math.floor(currentIndex / 2);
    level = nextLevel;
  }

  return { root: level[0] ?? "", proof };
}
