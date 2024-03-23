import { Button, FrameContext } from "frog";
import { Container } from "../../../Container.js";
import { State } from "../../index.js";
import { kvClient } from "../kv.js";

export async function Admin(ctx: FrameContext<{ State: State }>) {
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
        </div>
      </Container>
    ),
    intents: [<Button action="/execute">Execute Raffle</Button>],
  });
}
