/** @jsxImportSource frog/jsx */

import { Button, FrameContext } from "frog";
import { Route, State } from "@/app/api/[[...routes]]/route";
import { Container } from "@/lib/Container";

export async function Home(ctx: FrameContext<{ State: State }>) {
  return ctx.res({
    image: (
      <Container>
        <img
          src="/booty.png"
          tw="absolute left-0 top-0"
          width="100%"
          height="100%"
        />
        <div tw="flex flex-col items-center">
          <div tw="text-6xl text-white mb-4">Raffleframe</div>
          <div tw="text-4xl text-gray-500">
            Like and follow, then click the button to enter the raffle!
          </div>
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
