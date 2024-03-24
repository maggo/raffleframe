/** @jsxImportSource frog/jsx */

import { FAIRY_RAFFLE_FACTORY_ABI } from "@/abi/FairyRaffleFactory";
import { FAIRY_RAFFLE_FACTORY_ADDRESS } from "@/lib/config";
import { kvClient } from "@/lib/kv";
import { createMerkleTreeAuto } from "@/lib/merkleTree";
import { pinata } from "@/lib/pinata";
import { Admin } from "@/routes/Admin";
import { Execute } from "@/routes/Execute";
import { Home } from "@/routes/Home";
import { Participate } from "@/routes/Participate";
import { Frog } from "frog";
import { devtools } from "frog/dev";
import { frog } from "frog/hubs";
import { neynar } from "frog/middlewares";
import { serveStatic } from "frog/serve-static";
import { handle } from "frog/next";
import { Hex, encodePacked, keccak256 } from "viem";

export type Route = "/" | "/participate" | "/execute";

export interface State {
  route: Route;
  winnersCount?: number;
}

const app = new Frog<{ State: State }>({
  basePath: "/api",
  browserLocation: "/:path",
  headers: {
    "Cache-Control": "public, max-age=0, must-revalidate",
  },
  hub: frog(),
  initialState: {
    route: "/",
  },
  verify: true,
});

app.frame("/", async (ctx) => {
  const { buttonValue, deriveState } = ctx;

  const state = deriveState((state) => {
    state.route = buttonValue?.startsWith("/") ? (buttonValue as Route) : "/";
  });

  switch (state.route) {
    case "/execute": {
      return Execute(ctx);
    }
    default:
      return Home(ctx);
  }
});

app.frame(
  "/participate",
  neynar({
    apiKey: process.env.NEYNAR_API_KEY!,
    features: ["cast", "interactor"],
  }),
  async (ctx) => {
    const viewerIsOrganizer =
      ctx.var.interactor?.fid === ctx.frameData?.castId.fid;

    if (viewerIsOrganizer) {
      return Admin(ctx);
    }

    return Participate(ctx);
  },
);

app.frame(
  "/execute",
  neynar({
    apiKey: process.env.NEYNAR_API_KEY!,
    features: ["interactor"],
  }),
  async (ctx) => {
    return Execute(ctx);
  },
);

const MIN_BLOCKS_TO_WAIT = 4;

app.transaction("/create-raffle", async (ctx) => {
  const winnersCount = ctx.previousState.winnersCount;
  const castHash = ctx.frameData?.castId.hash;

  if (!winnersCount || !castHash) {
    throw new Error("Invalid state");
  }

  const entries = await kvClient.smembers(`participants:${castHash}`);

  if (!entries.length) {
    throw new Error("No participants");
  }

  const merkleTree = createMerkleTreeAuto(
    entries,
    keccak256(encodePacked(["string"], [""])),
    "string",
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
    chainId: "eip155:8453",
    functionName: "createRaffle",
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

devtools(app, { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
