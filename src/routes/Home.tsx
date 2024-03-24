/** @jsxImportSource frog/jsx */

import { Button, FrameContext } from "frog";
import { Route, State } from "@/app/api/[[...routes]]/route";
import { Container } from "@/lib/Container";

export async function Home(ctx: FrameContext<{ State: State }>) {
  return ctx.res({
    image: (
      <Container>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/home.png"
          tw="absolute left-0 top-0"
          width="100%"
          height="100%"
          alt=""
        />
      </Container>
    ),
    intents: [
      <Button
        key="participate"
        action="/participate"
        value={"/participate" as Route}
      >
        Enter Giveaway
      </Button>,
    ],
  });
}
