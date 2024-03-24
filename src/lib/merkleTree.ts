import { MerkleTree, ProofPath } from "fixed-merkle-tree";
import { keccak256, encodePacked, zeroAddress, Hex } from "viem";

/**
 * Compute required minimum Merkle tree depth for a list with size `length`
 * @param length Size of list
 */
export function computeMerkleTreeDepth(length: number) {
  return Math.ceil(Math.log2(length));
}

/**
 * Create fixed merkle tree, auto-calculating the required tree depth
 *
 * @param entries
 * @param zeroValue
 * @returns
 */
export function createMerkleTreeAuto(
  entries: string[],
  zeroValue: string = keccak256(encodePacked(["address"], [zeroAddress])),
  type: string = "address",
) {
  const hashedEntries = entries.map((entry) =>
    keccak256(encodePacked([type], [entry])),
  );
  const treeDepth = computeMerkleTreeDepth(entries.length);
  const merkleTree = new MerkleTree(treeDepth, hashedEntries, {
    hashFunction: (left, right) =>
      keccak256(
        encodePacked(["bytes32", "bytes32"], [left as Hex, right as Hex]),
      ),
    zeroElement: zeroValue,
  });
  return merkleTree;
}

/**
 * Create a fixed Merkle tree of entries where each entry is first hashed
 * with keccak256 and all other empty leaves are filled with keccak256(0), with
 * precomputed intermediate zero subroots.
 * @param entries List of entries to include in the Merkle tree
 * @param treeDepth Depth of Merkle tree d. This determines the capacity C of the
 *  Merkle tree s.t. C = 2^{d} - 1
 * @param zeroValue The value of zero leaves; default keccak256(address(0))
 * @returns Fixed Merkle tree
 */
export function createMerkleTree(
  entries: string[],
  treeDepth: number,
  zeroValue: string = keccak256(encodePacked(["address"], [zeroAddress])),
  type: string = "address",
) {
  const hashedEntries = entries.map((entry) =>
    keccak256(encodePacked([type], [entry])),
  );
  const merkleTree = new MerkleTree(treeDepth, hashedEntries, {
    hashFunction: (left, right) =>
      keccak256(
        encodePacked(["bytes32", "bytes32"], [left as Hex, right as Hex]),
      ),
    zeroElement: zeroValue,
  });
  return merkleTree;
}

/**
 * Get proof from
 *      const proof = merkleTree.path(originalIndex)
 * @param leaf hashed leaf to prove membership of
 * @param proof sibling leaves
 * @param merkleRoot Merkle root to verify against
 */
export function verifyMerkleProof(
  leaf: string,
  proof: ProofPath,
  merkleRoot: string,
) {
  let root = leaf;
  for (let i = 0; i < proof.pathElements.length; i++) {
    const hash = proof.pathElements[i];
    const index = proof.pathIndices[i];
    if (index == 0) {
      // hash is on right
      root = keccak256(
        encodePacked(["bytes32", "bytes32"], [root as Hex, hash as Hex]),
      );
    } else {
      root = keccak256(
        encodePacked(["bytes32", "bytes32"], [hash as Hex, root as Hex]),
      );
    }
  }
  return root === merkleRoot;
}

/**
 * Convert a MerkleTree#ProofPath object into the format expected by
 * the contract function {Distributooor-claim(uint256 index, bytes32[] proof)
 * TODO: Test this
 * @param proofPath ProofPath object
 */
export function toClaimArgs(proofPath: ProofPath) {
  let index = BigInt(0);
  for (let i = 0; i < proofPath.pathIndices.length; i++) {
    // direction of hash for this level
    const dir = proofPath.pathIndices[i];
    // index = index | (dir << i)
    index |= BigInt(dir) << BigInt(i);
  }
  return {
    index,
    proof: proofPath.pathElements as string[],
  };
}
