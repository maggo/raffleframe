/** @jsxImportSource frog/jsx */

import { Button, FrameContext } from "frog";
import { Route, State } from "@/app/api/[[...routes]]/route";
import { Container } from "@/lib/Container";

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
      <Button
        key="participate"
        action="/participate"
        value={"/participate" as Route}
      >
        Enter Raffle
      </Button>,
    ],
  });
}
