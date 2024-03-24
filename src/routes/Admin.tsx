/** @jsxImportSource frog/jsx */

import { Button, FrameContext } from "frog";
import { Container } from "@/lib/Container";
import { State } from "@/app/api/[[...routes]]/route";
import { kvClient } from "@/lib/kv";

export async function Admin(
  ctx: FrameContext<{ State: State }>,
  raffleTx: string | null,
) {
  const castHash = ctx.frameData?.castId.hash;

  const participantCount = castHash
    ? await kvClient.scard(`participants:${castHash}`)
    : 0;

  return ctx.res({
    image: (
      <Container>
        <div tw="flex flex-col items-center">
          <div tw="text-6xl text-white mb-4">Raffle Admin</div>
          <div tw="text-4xl text-gray-500">{`${participantCount} participants`}</div>
          <div tw="text-4xl text-gray-500">
            {raffleTx ? "Waiting for raffle…" : ""}
          </div>
        </div>
      </Container>
    ),
    intents: [
      <Button key="execute" action="/execute">
        Execute Raffle
      </Button>,
      <Button key="refresh">Refresh</Button>,
    ],
  });
}
