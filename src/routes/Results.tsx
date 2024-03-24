/** @jsxImportSource frog/jsx */

import { FAIRY_RAFFLE_ABI } from "@/abi/FairyRaffle";
import { RAFFLE_CHEF_ABI } from "@/abi/RaffleChef";
import { State } from "@/app/api/[[...routes]]/route";
import { Container } from "@/lib/Container";
import { drawRandomWinners } from "@/lib/drawing";
import { neynar } from "@/lib/neynar";
import { publicClient } from "@/lib/viem";
import { Button, FrameContext } from "frog";
import { Hex, getContract, parseEventLogs } from "viem";

export async function Results(
  ctx: FrameContext<{ State: State }>,
  raffleTx: string,
) {
  const receipt = await publicClient.getTransactionReceipt({
    hash: raffleTx as Hex,
  });

  const logs = parseEventLogs({
    abi: FAIRY_RAFFLE_ABI,
    eventName: "Initialized",
    logs: receipt.logs,
  });

  const raffleAddress = logs.at(0)?.address;

  if (!raffleAddress) {
    return ctx.res({
      image: (
        <Container>
          <div tw="flex flex-col items-center">
            <div tw="text-6xl text-emerald-400 font-bold mb-4">
              Giveaway is over!
            </div>
            <div tw="text-4xl text-emerald-600">Please wait…</div>
          </div>
        </Container>
      ),
    });
  }

  const raffle = getContract({
    address: raffleAddress,
    abi: FAIRY_RAFFLE_ABI,
    client: publicClient,
  });

  const [raffleId, raffleChef, winnersCount] = await Promise.all([
    raffle.read.raffleId(),
    raffle.read.raffleChef(),
    raffle.read.nWinners(),
  ]);

  const raffleData = await publicClient.readContract({
    abi: RAFFLE_CHEF_ABI,
    address: raffleChef,
    functionName: "getRaffle",
    args: [raffleId],
  });

  const entries: number[] = await fetch(
    `https://cloudflare-ipfs.com/ipfs/${raffleData.provenance}`,
  )
    .then((res) => res.json())
    .then((data) => data.entries);

  const winners = drawRandomWinners(
    raffleData.randomSeed,
    entries,
    Number(winnersCount),
  );

  const winnerData = winners.map((data) => entries[data.originalIndex]);

  const data = await neynar.fetchBulkUsers(winnerData);

  const userHasParticipated = entries.some(
    (entry) => entry === ctx.frameData?.fid,
  );

  const userHasWon = winnerData.some((winner) => winner === ctx.frameData?.fid);

  return ctx.res({
    image: (
      <Container>
        <div tw="flex flex-col items-center">
          <div tw="text-6xl text-emerald-400 font-bold mb-4">
            Giveaway is over!
          </div>
          <div tw="flex text-4xl text-emerald-600 mb-4">
            {entries.length} participants, {winners.length} winners.
          </div>
          <div tw="flex text-4xl text-emerald-600 my-1 font-bold">
            Congratulations!
          </div>

          <div tw="flex flex-col flex-wrap text-4xl text-emerald-800 w-[700px] max-h-[400px]">
            {data.users.map((user, index) => (
              <div key={user.fid} tw="flex my-1 w-1/2 px-2 font-bold">
                <span tw="w-10 flex-shrink-0">{index + 1}.</span>{" "}
                {user.username ? `@${user.username}` : user.fid}
              </div>
            ))}
          </div>
        </div>
        <div tw="absolute bottom-12 flex text-4xl text-emerald-800">
          <span>
            {userHasWon ? (
              <span tw="text-emerald-400 text-5xl">You won!! 🎉</span>
            ) : userHasParticipated ? (
              "You have participated but didn't win!"
            ) : (
              "You missed out!"
            )}
          </span>
        </div>
      </Container>
    ),
    intents: [
      <Button.Link
        key="basescan"
        href={`https://basescan.org/address/${raffleAddress}`}
      >
        Basescan
      </Button.Link>,
      <Button.Link
        key="metadata"
        href={`https://cloudflare-ipfs.com/ipfs/${raffleData.provenance}`}
      >
        Metadata
      </Button.Link>,
    ],
  });
}
