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
import { publicClient } from "@/lib/viem";
import { Results } from "@/routes/Results";
import { readFileSync } from "fs";
import path from "path";
import { xmtpMiddleware } from "@/lib/xmtp";

export type Route = "/" | "/participate" | "/execute";

export interface State {
  route: Route;
  winnersCount?: number;
}

const fontRegular = readFileSync(
  path.resolve(process.cwd(), "./public/api/PublicSans-Regular.ttf"),
);

const fontBold = readFileSync(
  path.resolve(process.cwd(), "./public/api/PublicSans-Bold.ttf"),
);

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
  verify: "silent",
  imageOptions: {
    fonts: [
      {
        name: "PublicSans",
        data: fontRegular,
        weight: 400,
        style: "normal",
      },
      {
        name: "PublicSans",
        data: fontBold,
        weight: 700,
        style: "normal",
      },
    ],
  },
}).use(xmtpMiddleware);

app.frame("/", xmtpMiddleware, async (ctx) => {
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
    const castHash = ctx.frameData?.castId.hash;

    const viewerIsOrganizer =
      ctx.var.interactor?.fid === ctx.frameData?.castId.fid;

    const raffleTx = await kvClient.get<string>(`raffle:${castHash}`);

    if (raffleTx) {
      return Results(ctx, raffleTx);
    }

    if (viewerIsOrganizer) {
      return Admin(ctx, raffleTx);
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

  const value = await publicClient.readContract({
    address: FAIRY_RAFFLE_FACTORY_ADDRESS,
    abi: FAIRY_RAFFLE_FACTORY_ABI,
    functionName: "getDynamicFee",
  });

  console.log({
    root: merkleTree.root as Hex,
    entries: BigInt(entries.length),
    winners: BigInt(winnersCount),
    ipfs: response.IpfsHash,
    value,
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
    value,
  });
});

devtools(app, { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
