/** @jsxImportSource frog/jsx */

import { Button, FrameContext, TextInput } from "frog";
import { Container } from "@/lib/Container";
import { State, type Route } from "@/app/api/[[...routes]]/route";
import { kvClient } from "@/lib/kv";

export async function Execute(ctx: FrameContext<{ State: State }>) {
  const castHash = ctx.frameData?.castId.hash;
  const input = ctx.frameData?.inputText;

  const { transactionId } = ctx;

  const isValidTransactionId = transactionId && transactionId !== "0x";

  if (isValidTransactionId) {
    await kvClient.set(`raffle:${castHash}`, transactionId);
    return ctx.res({
      image: (
        <Container>
          <div tw="flex flex-col items-center">
            <div tw="text-6xl text-emerald-400 font-bold mb-4">
              Deploy Giveaway
            </div>
            <div tw="text-4xl text-emerald-600">Transaction submitted</div>
          </div>
        </Container>
      ),
      intents: [
        <Button.Link
          key="basescan"
          href={`https://basescan.org/tx/${transactionId}`}
        >
          Basescan
        </Button.Link>,
        <Button
          key="participate"
          action="/participate"
          value={"/participate" as Route}
        >
          Refresh
        </Button>,
      ],
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
            <div tw="text-6xl text-emerald-400 font-bold mb-4">
              Deploy Giveaway
            </div>
            <div tw="text-4xl text-emerald-600">{`Participants: ${participantCount}`}</div>
            <div tw="text-4xl text-emerald-600">{`Winner count: ${state.winnersCount}`}</div>
          </div>
        </Container>
      ),
      intents: [
        <Button.Transaction key="createRaffle" target="/create-raffle">
          Draw Winners onchain
        </Button.Transaction>,
      ],
    });
  }

  return ctx.res({
    image: (
      <Container>
        <div tw="flex flex-col items-center">
          <div tw="text-6xl text-emerald-400 font-bold mb-4">
            Pick number of winners
          </div>
          <div tw="text-4xl text-emerald-600">{`Between 1 and ${participantCount}`}</div>
          {inputIsValid ? (
            <div tw="text-5xl text-emerald-400 font-bold my-8">{`You picked ${state.winnersCount}`}</div>
          ) : (
            <div tw="text-5xl text-red-500 font-bold my-8">
              {state.winnersCount
                ? `Invalid choice: ${state.winnersCount}`
                : ""}
            </div>
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
