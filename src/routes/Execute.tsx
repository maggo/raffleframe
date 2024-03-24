/** @jsxImportSource frog/jsx */

import { Button, FrameContext, TextInput } from "frog";
import { Container } from "@/lib/Container";
import { State } from "@/app/api/[[...routes]]/route";
import { kvClient } from "@/lib/kv";

export async function Execute(ctx: FrameContext<{ State: State }>) {
  const castHash = ctx.frameData?.castId.hash;
  const input = ctx.frameData?.inputText;

  const { transactionId } = ctx;

  if (transactionId) {
    await kvClient.set(`raffle:${castHash}`, transactionId);
    return ctx.res({
      image: (
        <Container>
          <div tw="flex flex-col items-center">
            <div tw="text-6xl text-white mb-4">Deploy Raffle</div>
            <div tw="text-4xl text-gray-500">Transaction submitted</div>
          </div>
        </Container>
      ),
    });
  }

  const state = ctx.deriveState((state) => {
    if (Number.isInteger(Number(input))) {
      state.winnersCount = Number(input);
    }
  });

  const participantCount = castHash
    ? await kvClient.scard(`participants:${castHash}`)
    : 0;

  const inputIsValid =
    state.winnersCount &&
    state.winnersCount > 0 &&
    state.winnersCount <= participantCount;

  if (inputIsValid) {
    return ctx.res({
      image: (
        <Container>
          <div tw="flex flex-col items-center">
            <div tw="text-6xl text-white mb-4">Deploy Raffle</div>
            <div tw="text-4xl text-gray-500">{`Participants: ${participantCount}`}</div>
            <div tw="text-4xl text-gray-500">{`Winner count: ${state.winnersCount}`}</div>
          </div>
        </Container>
      ),
      intents: [
        <Button.Transaction key="createRaffle" target="/create-raffle">
          Create Raffle
        </Button.Transaction>,
      ],
    });
  }

  return ctx.res({
    image: (
      <Container>
        <div tw="flex flex-col items-center">
          <div tw="text-6xl text-white mb-4">Pick number of winners</div>
          <div tw="text-4xl text-gray-500">{`Between 1 and ${participantCount}`}</div>
          {inputIsValid ? (
            <div tw="text-5xl text-white font-bold my-8">{`You picked ${state.winnersCount}`}</div>
          ) : (
            <div tw="text-5xl text-red-500 font-bold my-8">{`Invalid choice: ${state.winnersCount}`}</div>
          )}
        </div>
      </Container>
    ),
    intents: [
      <TextInput key="winnersCount" placeholder="Number of winners" />,
      <Button key="submit" value="submit">
        Submit
      </Button>,
    ],
  });
}
