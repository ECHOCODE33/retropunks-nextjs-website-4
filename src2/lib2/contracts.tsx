import { Address } from "viem";

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
			{ internalType: "uint256", name: "tokenId", type: "uint256" },
			{
				internalType: "uint256",
				name: "backgroundIndex",
				type: "uint256",
			},
		],
		name: "setTokenBackground",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{ internalType: "uint256", name: "tokenId", type: "uint256" },
			{ internalType: "string", name: "name", type: "string" },
		],
		name: "setTokenName",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{ internalType: "uint256", name: "tokenId", type: "uint256" },
			{ internalType: "string", name: "bio", type: "string" },
		],
		name: "setTokenBio",
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
			{ internalType: "string", name: "name", type: "string" },
			{ internalType: "string", name: "bio", type: "string" },
		],
		stateMutability: "view",
		type: "function",
	},
] as const;

export const RETROPUNKS_CONTRACT = process.env.NEXT_PUBLIC_CONTRACT as Address;