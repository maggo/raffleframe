import { createPublicClient, http } from 'viem';
import { base, mainnet } from 'viem/chains';

export const publicClient = createPublicClient({
  chain: base,
  transport: http(),
  batch: {
    multicall: true,
  },
});

export const mainnetClient = createPublicClient({
  chain: mainnet,
  transport: http(),
  batch: {
    multicall: true,
  },
});
