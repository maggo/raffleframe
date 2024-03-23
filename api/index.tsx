import { Frog } from 'frog';
import { devtools } from 'frog/dev';
import { frog } from 'frog/hubs';
import { neynar } from 'frog/middlewares';
import { serveStatic } from 'frog/serve-static';
import { handle } from 'frog/vercel';
import { encodePacked, keccak256, Hex } from 'viem';
import { FAIRY_RAFFLE_FACTORY_ABI } from './_/abi/FairyRaffleFactory.js';
import { FAIRY_RAFFLE_FACTORY_ADDRESS } from './_/config.js';
import { kvClient } from './_/kv.js';
import { createMerkleTreeAuto } from './_/merkleTree.js';
import { Admin } from './_/routes/Admin.js';
import { Execute } from './_/routes/Execute.js';
import { Home } from './_/routes/Home.js';
import { Participate } from './_/routes/Participate.js';
import { pinata } from './_/pinata.js';

// @ts-ignore
const isEdgeFunction = typeof EdgeFunction !== 'undefined';
const isProduction = isEdgeFunction || import.meta.env?.MODE !== 'development';

export const config = {
  runtime: 'edge',
};

export type Route = '/' | '/participate' | '/execute';

export interface State {
  route: Route;
  winnersCount?: number;
}

export const app = new Frog<{ State: State }>({
  assetsPath: '/',
  basePath: '/',
  headers: {
    'Cache-Control': 'public, max-age=0, must-revalidate',
  },
  hub: frog(),
  initialState: {
    route: '/',
  },
  verify: isProduction ? true : 'silent',
});

app.frame('/', async ctx => {
  const { buttonValue, deriveState } = ctx;

  const state = deriveState(state => {
    state.route = buttonValue?.startsWith('/') ? (buttonValue as Route) : '/';
  });

  switch (state.route) {
    case '/execute': {
      return Execute(ctx);
    }
    default:
      return Home(ctx);
  }
});

app.frame(
  '/participate',
  neynar({
    apiKey: import.meta.env.VITE_NEYNAR_API_KEY!,
    features: ['cast', 'interactor'],
  }),
  async ctx => {
    const viewerIsOrganizer =
      ctx.var.interactor?.fid === ctx.frameData?.castId.fid;

    if (viewerIsOrganizer) {
      return Admin(ctx);
    }

    return Participate(ctx);
  }
);

app.frame(
  '/execute',
  neynar({
    apiKey: import.meta.env.VITE_NEYNAR_API_KEY!,
    features: ['interactor'],
  }),
  async ctx => {
    return Execute(ctx);
  }
);

const MIN_BLOCKS_TO_WAIT = 4;

app.transaction('/create-raffle', async ctx => {
  const winnersCount = ctx.previousState.winnersCount;
  const castHash = ctx.frameData?.castId.hash;

  if (!winnersCount || !castHash) {
    throw new Error('Invalid state');
  }

  const entries = await kvClient.smembers(`participants:${castHash}`);

  if (!entries.length) {
    throw new Error('No participants');
  }

  const merkleTree = createMerkleTreeAuto(
    entries,
    keccak256(encodePacked(['string'], [''])),
    'string'
  );

  const response = await pinata.pinJSONToIPFS({
    name: `Raffleframe ${castHash}`,
    winners: winnersCount,
    entries,
    minBlocksToWait: MIN_BLOCKS_TO_WAIT,
  });

  // Contract transaction response.
  return ctx.contract({
    abi: FAIRY_RAFFLE_FACTORY_ABI,
    chainId: 'eip155:8453',
    functionName: 'createRaffle',
    args: [
      merkleTree.root as Hex,
      BigInt(entries.length),
      BigInt(winnersCount),
      response.IpfsHash,
      MIN_BLOCKS_TO_WAIT,
    ],
    to: FAIRY_RAFFLE_FACTORY_ADDRESS,
  });
});

devtools(app, isProduction ? { assetsPath: '/.frog' } : { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
