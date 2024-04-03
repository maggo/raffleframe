/** @jsxImportSource frog/jsx */

import { ERC1155_ABI } from '@/abi/ERC1155';
import { Route, State } from '@/app/api/[[...routes]]/route';
import { Container } from '@/lib/Container';
import { KV_NAMESPACE } from '@/lib/config';
import { kvClient } from '@/lib/kv';
import { neynar } from '@/lib/neynar';
import { fdk } from '@/lib/pinata';
import { mainnetClient, publicClient } from '@/lib/viem';

import { Button, FrameContext } from 'frog';
import type { NeynarVariables } from 'frog/middlewares';
import { erc721Abi, getAddress } from 'viem';

export async function Participate(
  ctx: FrameContext<{ State: State; Variables: NeynarVariables }>
) {
  const castHash = ctx.frameData?.castId.hash;
  const viewerId = ctx.var.interactor?.fid;
  const authorName = ctx.var.cast?.author.username;

  if (ctx.frameData) {
    await fdk.sendAnalytics(
      `raffleframe_${castHash}`,
      await ctx.req.json(),
      castHash
    );
  }

  if (!castHash || !viewerId) {
    throw new Error('Frame invalid');
  }

  const hasEnteredAlready =
    (await kvClient.sismember(
      `${KV_NAMESPACE}:participants:${castHash}`,
      viewerId.toString()
    )) > 0;

  if (hasEnteredAlready) {
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
              Congratulations you&apos;re in!
            </div>
            <div tw="flex text-5xl text-red-600">
              <span>There are {participantCount} participants.</span>
            </div>
          </div>
        </Container>
      ),
    });
  }

  const lilNounsBalances =
    ctx.var.interactor?.verifiedAddresses.ethAddresses.map((address) =>
      mainnetClient.readContract({
        abi: erc721Abi,
        address: '0x4b10701Bfd7BFEdc47d50562b76b436fbB5BdB3B',
        functionName: 'balanceOf',
        args: [getAddress(address)],
      })
    ) ?? [];

  const nounsBalances =
    ctx.var.interactor?.verifiedAddresses.ethAddresses.map((address) =>
      mainnetClient.readContract({
        abi: erc721Abi,
        address: '0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03',
        functionName: 'balanceOf',
        args: [getAddress(address)],
      })
    ) ?? [];

  const lilDevsBalance =
    ctx.var.interactor?.verifiedAddresses.ethAddresses.map((address) =>
      publicClient.readContract({
        abi: ERC1155_ABI,
        address: '0x7BbFA480C8Ee56aCAC50D672B9E1d070ec7BbEef',
        functionName: 'balanceOf',
        args: [getAddress(address), BigInt(1)],
      })
    ) ?? [];

  const hasFollowed = ctx.var.interactor?.viewerContext?.followedBy;
  const hasLiked = await neynar
    .fetchBulkCasts([castHash], { viewerFid: viewerId })
    // @ts-ignore
    .then((res) => Boolean(res.result.casts[0]?.viewer_context.liked))
    .catch(() => false);
  const hasLilNounOrNoun = await Promise.allSettled([
    ...lilNounsBalances,
    ...nounsBalances,
    ...lilDevsBalance,
  ]).then((res) =>
    res.some((res) => res.status === 'fulfilled' && res.value > BigInt(0))
  );

  const isEligible = hasFollowed && hasLiked && hasLilNounOrNoun;

  if (isEligible) {
    await kvClient.sadd(
      `${KV_NAMESPACE}:participants:${castHash}`,
      viewerId.toString()
    );

    return ctx.res({
      image: (
        <Container>
          <div tw="flex flex-col items-center">
            <div
              tw="text-7xl text-stone-800 font-bold mb-4"
              style={{ fontFamily: 'LondrinaSolid' }}
            >
              Congratulations!
            </div>
            <div tw="text-5xl text-red-600">
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
          <div
            tw="text-7xl text-stone-800 font-bold mb-10"
            style={{ fontFamily: 'LondrinaSolid' }}
          >
            To participate…
          </div>
          <div tw="flex flex-col items-start">
            <div tw="flex text-4xl text-red-600 my-2">
              <span>
                {hasLilNounOrNoun ? '✅' : '➡️'} Hold a Noun, Lil Noun, or Lil
                Dev
              </span>
            </div>
            <div tw="flex text-4xl text-red-600 my-2">
              <span>
                {hasFollowed ? '✅' : '➡️'} Follow{' '}
                {authorName ? `@${authorName}` : 'the author'}
              </span>
            </div>
            <div tw="flex text-4xl text-red-600 my-2">
              <span>{hasLiked ? '✅' : '➡️'} Like this cast</span>
            </div>
          </div>
        </div>
        <div tw="absolute bottom-12 text-stone-800 text-3xl">
          Refresh in a couple of minutes
        </div>
      </Container>
    ),
    intents: [
      <Button key="participate" value={'/participate' as Route}>
        Refresh
      </Button>,
    ],
  });
}
