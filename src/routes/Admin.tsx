/** @jsxImportSource frog/jsx */

import { Button, FrameContext } from 'frog';
import { Container } from '@/lib/Container';
import { State } from '@/app/api/[[...routes]]/route';
import { kvClient } from '@/lib/kv';
import { KV_NAMESPACE } from '@/lib/config';

export async function Admin(
  ctx: FrameContext<{ State: State }>,
  raffleTx: string | null
) {
  const castHash = ctx.frameData?.castId.hash;

  const participantCount = castHash
    ? await kvClient.scard(`${KV_NAMESPACE}:participants:${castHash}`)
    : 0;

  return ctx.res({
    image: (
      <Container>
        <div tw="flex flex-col items-center">
          <div
            tw="text-7xl text-stone-800 font-bold mb-4"
            style={{ fontFamily: 'LondrinaSolid' }}
          >
            Giveaway Admin
          </div>
          <div tw="text-5xl text-red-600">{`${participantCount} participants`}</div>
          <div tw="text-5xl text-red-600">
            {raffleTx ? 'Waiting for giveaway' : ''}
          </div>
        </div>
      </Container>
    ),
    intents: [
      <Button key="execute" action="/execute">
        Draw Winners
      </Button>,
      <Button key="refresh">Refresh</Button>,
    ],
  });
}
