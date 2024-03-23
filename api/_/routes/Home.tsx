import { Button, FrameContext } from "frog";
import { Container } from "../../../Container.js";
import { Route, State } from "../../index.js";

export async function Home(ctx: FrameContext<{ State: State }>) {
  return ctx.res({
    image: (
      <Container>
        <div tw="flex flex-col items-center">
          <div tw="text-6xl text-white mb-4">Raffleframe</div>
        </div>
      </Container>
    ),
    intents: [
      <Button action="/participate" value={"/participate" as Route}>
        Enter Raffle
      </Button>,
    ],
  });
}
