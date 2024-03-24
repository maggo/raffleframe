import { keccak256, encodePacked } from "viem";
import { decrypt } from "@kevincharm/gfc-fpe";

interface WinnerData {
  id: any;
  originalIndex: number;
}

export function drawRandomWinners<T extends any>(
  seed: bigint,
  participants: T[],
  count: number,
): WinnerData[] {
  const domain = BigInt(participants.length);
  const rounds = BigInt(4);

  const winners = new Array<WinnerData>(count);
  for (let w = 0; w < count; w++) {
    const i = Number(
      decrypt(BigInt(w), domain, seed, rounds, feistelRoundFunction),
    );
    winners[w] = {
      id: participants[i],
      originalIndex: i,
    };
  }

  return winners;
}

export const feistelRoundFunction = (
  R: bigint,
  i: bigint,
  seed: bigint,
  domain: bigint,
) =>
  BigInt(
    keccak256(
      encodePacked(
        ["uint256", "uint256", "uint256", "uint256"],
        [R, i, seed, domain],
      ),
    ),
  );
