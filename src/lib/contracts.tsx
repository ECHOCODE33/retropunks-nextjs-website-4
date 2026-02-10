import { Address } from "viem";

// Minimal ABI for RetroPunks on Base Mainnet (name/bio/background via setTokenMetadata)
export const RETROPUNKS_ABI = [
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "tokenURI",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_tokenId", type: "uint256" },
      { internalType: "bytes32", name: "_name", type: "bytes32" },
      { internalType: "string", name: "_bio", type: "string" },
      { internalType: "uint8", name: "_backgroundIndex", type: "uint8" },
    ],
    name: "setTokenMetadata",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "globalTokenMetadata",
    outputs: [
      { internalType: "uint16", name: "tokenIdSeed", type: "uint16" },
      { internalType: "uint8", name: "backgroundIndex", type: "uint8" },
      { internalType: "bytes32", name: "name", type: "bytes32" },
      { internalType: "string", name: "bio", type: "string" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

// RetroPunks on Base Mainnet
export const RETROPUNKS_CONTRACT = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  "0xa7F6B0079F1f15eaC0Ee657933e550ee8502E1D7") as Address;
