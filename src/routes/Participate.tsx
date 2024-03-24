/** @jsxImportSource frog/jsx */

import { Route, State } from "@/app/api/[[...routes]]/route";
import { Container } from "@/lib/Container";
import { kvClient } from "@/lib/kv";
import { neynar } from "@/lib/neynar";
import { fdk } from "@/lib/pinata";

import { Button, FrameContext } from "frog";
import type { NeynarVariables } from "frog/middlewares";

export async function Participate(
  ctx: FrameContext<{ State: State; Variables: NeynarVariables }>,
) {
  const castHash = ctx.frameData?.castId.hash;
  const viewerId = ctx.var.interactor?.fid;
  const authorName = ctx.var.cast?.author.username;

  if (ctx.frameData) {
    await fdk.sendAnalytics("raffleframe", await ctx.req.json(), castHash);
  }

  if (!castHash || !viewerId) {
    throw new Error("Frame invalid");
  }

  const hasEnteredAlready =
    (await kvClient.sismember(
      `participants:${castHash}`,
      viewerId.toString(),
    )) > 0;

  if (hasEnteredAlready) {
    const participantCount = castHash
      ? await kvClient.scard(`participants:${castHash}`)
      : 0;

    return ctx.res({
      image: (
        <Container>
          <div tw="flex flex-col items-center">
            <div tw="text-6xl text-emerald-400 font-bold mb-4">
              Congratulations you&apos;re in!
            </div>
            <div tw="flex text-4xl text-emerald-600">
              <span>There are {participantCount} participants.</span>
            </div>
          </div>
        </Container>
      ),
    });
  }

  const hasFollowed = ctx.var.interactor?.viewerContext?.followedBy;
  const hasLiked = await neynar
    .fetchBulkCasts([castHash], { viewerFid: viewerId })
    // @ts-ignore
    .then((res) => Boolean(res.result.casts[0]?.viewer_context.liked))
    .catch(() => false);

  const isEligible = hasFollowed && hasLiked;

  if (isEligible) {
    await kvClient.sadd(`participants:${castHash}`, viewerId.toString());

    return ctx.res({
      image: (
        <Container>
          <div tw="flex flex-col items-center">
            <div tw="text-6xl text-emerald-400 font-bold mb-4">
              Congratulations!
            </div>
            <div tw="text-4xl text-emerald-600">
              You&apos;ve been entered into the giveaway
            </div>
          </div>
        </Container>
      ),
    });
  }

  return ctx.res({
    image: (
      <Container>
        <div tw="flex flex-col items-center">
          <div tw="text-6xl text-emerald-400 font-bold mb-4">
            To participate…
          </div>
          <div tw="flex flex-col items-start">
            <div tw="flex text-4xl text-emerald-600 my-2">
              <span>
                {hasFollowed ? "✅" : "➡️"} Follow{" "}
                {authorName ? `@${authorName}` : "the author"}
              </span>
            </div>
            <div tw="flex text-4xl text-emerald-600 my-2">
              <span>{hasLiked ? "✅" : "➡️"} Like this cast</span>
            </div>
          </div>
        </div>
        <div tw="absolute bottom-12 text-emerald-800 text-3xl">
          Refresh in a couple of minutes
        </div>
      </Container>
    ),
    intents: [
      <Button key="participate" value={"/participate" as Route}>
        Refresh
      </Button>,
    ],
  });
}
