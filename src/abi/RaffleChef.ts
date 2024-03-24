export const RAFFLE_CHEF_ABI = [
  {
    inputs: [
      { internalType: "uint256", name: "startingRaffleId", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      { internalType: "uint256", name: "raffleId", type: "uint256" },
      { internalType: "bytes32", name: "merkleRoot", type: "bytes32" },
      { internalType: "uint256", name: "nParticipants", type: "uint256" },
      { internalType: "uint256", name: "nWinners", type: "uint256" },
      { internalType: "uint256", name: "randomness", type: "uint256" },
      { internalType: "string", name: "provenance", type: "string" },
    ],
    name: "InvalidCommitment",
    type: "error",
  },
  { inputs: [], name: "InvalidInputs", type: "error" },
  {
    inputs: [
      { internalType: "uint256", name: "from", type: "uint256" },
      { internalType: "uint256", name: "to", type: "uint256" },
      { internalType: "uint256", name: "nWinners", type: "uint256" },
    ],
    name: "InvalidPaginationParameters",
    type: "error",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "leaf", type: "bytes32" },
      { internalType: "bytes32[]", name: "proof", type: "bytes32[]" },
    ],
    name: "InvalidProof",
    type: "error",
  },
  {
    inputs: [{ internalType: "uint256", name: "raffleId", type: "uint256" }],
    name: "RaffleNotRolled",
    type: "error",
  },
  {
    inputs: [{ internalType: "uint256", name: "raffleId", type: "uint256" }],
    name: "StartingRaffleIdTooLow",
    type: "error",
  },
  {
    inputs: [
      { internalType: "address", name: "unauthorisedUser", type: "address" },
    ],
    name: "Unauthorised",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "address", name: "to", type: "address" },
      {
        indexed: false,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "ERC1155Withdrawn",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "address", name: "to", type: "address" },
      {
        indexed: false,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "ERC20Withdrawn",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "address", name: "to", type: "address" },
      {
        indexed: false,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "ERC721Withdrawn",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "address", name: "to", type: "address" },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "ETHWithdrawn",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "raffleId",
        type: "uint256",
      },
    ],
    name: "RaffleCommitted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "raffleId",
        type: "uint256",
      },
    ],
    name: "RaffleCreated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "participantsMerkleRoot",
        type: "bytes32",
      },
      { internalType: "uint256", name: "nParticipants", type: "uint256" },
      { internalType: "uint256", name: "nWinners", type: "uint256" },
      { internalType: "string", name: "provenance", type: "string" },
      { internalType: "uint256", name: "randomness", type: "uint256" },
    ],
    name: "commit",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "raffleId", type: "uint256" },
      { internalType: "uint256", name: "n", type: "uint256" },
    ],
    name: "getNthWinner",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "raffleId", type: "uint256" }],
    name: "getRaffle",
    outputs: [
      {
        components: [
          {
            internalType: "bytes32",
            name: "participantsMerkleRoot",
            type: "bytes32",
          },
          { internalType: "uint256", name: "nParticipants", type: "uint256" },
          { internalType: "uint256", name: "nWinners", type: "uint256" },
          { internalType: "uint256", name: "randomSeed", type: "uint256" },
          { internalType: "address", name: "owner", type: "address" },
          { internalType: "string", name: "provenance", type: "string" },
        ],
        internalType: "struct IRaffleChef.Raffle",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "raffleId", type: "uint256" }],
    name: "getRaffleState",
    outputs: [
      { internalType: "enum IRaffleChef.RaffleState", name: "", type: "uint8" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "raffleId", type: "uint256" },
      { internalType: "uint256", name: "from", type: "uint256" },
      { internalType: "uint256", name: "to", type: "uint256" },
    ],
    name: "getWinners",
    outputs: [
      { internalType: "uint256[]", name: "winners", type: "uint256[]" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "nextRaffleId",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "typeAndVersion",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "raffleId", type: "uint256" },
      { internalType: "bytes32", name: "leafHash", type: "bytes32" },
      { internalType: "bytes32[]", name: "proof", type: "bytes32[]" },
      { internalType: "uint256", name: "merkleIndex", type: "uint256" },
    ],
    name: "verifyWinner",
    outputs: [
      { internalType: "bool", name: "isWinner", type: "bool" },
      { internalType: "uint256", name: "permutedIndex", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "withdrawERC1155",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "withdrawERC20",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "tokenId", type: "uint256" },
    ],
    name: "withdrawERC721",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "withdrawETH",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
