import { Address } from "viem";

export const RETROPUNKS_CONTRACT = "0x41571c3bd1bf9107282bca1829f16b316d6f67bc" as Address;

export const NUM_BACKGROUND = 29;

export const RETROPUNKS_ABI = [
	{ inputs: [], name: "BioIsTooLong", type: "error" },
	{ inputs: [], name: "CallerIsNotTokenOwner", type: "error" },
	{ inputs: [], name: "InvalidBackgroundIndex", type: "error" },
	{ inputs: [], name: "InvalidCharacterInName", type: "error" },
	{ inputs: [], name: "MetadataNotRevealedYet", type: "error" },
	{ inputs: [], name: "MintIsClosed", type: "error" },
	{ inputs: [], name: "NameIsTooLong", type: "error" },
	{
		inputs: [
			{ internalType: "uint256", name: "got", type: "uint256" },
			{ internalType: "uint256", name: "totalMinted", type: "uint256" },
		],
		name: "NewMaxSupplyCannotBeLessThenTotalMinted",
		type: "error",
	},
	{ inputs: [], name: "NoRemainingTokens", type: "error" },
	{ inputs: [], name: "NonExistentToken", type: "error" },
	{ inputs: [], name: "NotEnoughOwnerMintsRemaining", type: "error" },

	{ inputs: [], name: "PreRenderedSpecialCannotBeCustomized", type: "error" },
	{ inputs: [], name: "URIQueryForNonexistentToken", type: "error" },
	{
		anonymous: false,
		inputs: [
			{ indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" },
			{ indexed: true, internalType: "uint256", name: "backgroundIndex", type: "uint256" },
			{ indexed: true, internalType: "address", name: "owner", type: "address" },
		],
		name: "BackgroundChanged",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{ indexed: false, internalType: "uint256", name: "_fromTokenId", type: "uint256" },
			{ indexed: false, internalType: "uint256", name: "_toTokenId", type: "uint256" },
		],
		name: "BatchMetadataUpdate",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{ indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" },
			{ indexed: false, internalType: "string", name: "bio", type: "string" },
			{ indexed: true, internalType: "address", name: "owner", type: "address" },
		],
		name: "BioChanged",
		type: "event",
	},
	{ anonymous: false, inputs: [{ indexed: false, internalType: "uint256", name: "_tokenId", type: "uint256" }], name: "MetadataUpdate", type: "event" },
	{
		anonymous: false,
		inputs: [
			{ indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" },
			{ indexed: false, internalType: "string", name: "name", type: "string" },
			{ indexed: true, internalType: "address", name: "owner", type: "address" },
		],
		name: "NameChanged",
		type: "event",
	},
	{ inputs: [{ internalType: "address", name: "owner", type: "address" }], name: "balanceOf", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" },
	{ inputs: [], name: "defaultBackgroundIndex", outputs: [{ internalType: "uint8", name: "", type: "uint8" }], stateMutability: "view", type: "function" },
	{
		inputs: [
			{ internalType: "uint256", name: "fromTokenId", type: "uint256" },
			{ internalType: "uint256", name: "toTokenId", type: "uint256" },
		],
		name: "emitBatchMetadataUpdate",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
		name: "explicitOwnershipOf",
		outputs: [
			{
				components: [
					{ internalType: "address", name: "addr", type: "address" },
					{ internalType: "uint64", name: "startTimestamp", type: "uint64" },
					{ internalType: "bool", name: "burned", type: "bool" },
					{ internalType: "uint24", name: "extraData", type: "uint24" },
				],
				internalType: "struct IERC721A.TokenOwnership",
				name: "ownership",
				type: "tuple",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [{ internalType: "uint256[]", name: "tokenIds", type: "uint256[]" }],
		name: "explicitOwnershipsOf",
		outputs: [
			{
				components: [
					{ internalType: "address", name: "addr", type: "address" },
					{ internalType: "uint64", name: "startTimestamp", type: "uint64" },
					{ internalType: "bool", name: "burned", type: "bool" },
					{ internalType: "uint24", name: "extraData", type: "uint24" },
				],
				internalType: "struct IERC721A.TokenOwnership[]",
				name: "",
				type: "tuple[]",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [{ internalType: "address", name: "minter", type: "address" }],
		name: "getMintStats",
		outputs: [
			{ internalType: "uint256", name: "minterNumMinted", type: "uint256" },
			{ internalType: "uint256", name: "currentTotalSupply", type: "uint256" },
			{ internalType: "uint256", name: "maxSupply", type: "uint256" },
		],
		stateMutability: "view",
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
	{ inputs: [], name: "maxSupply", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" },
	{ inputs: [], name: "mintIsClosed", outputs: [{ internalType: "bool", name: "", type: "bool" }], stateMutability: "view", type: "function" },
	{
		inputs: [
			{ internalType: "address", name: "minter", type: "address" },
			{ internalType: "uint256", name: "quantity", type: "uint256" },
		],
		name: "mintSeaDrop",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{ inputs: [], name: "owner", outputs: [{ internalType: "address", name: "", type: "address" }], stateMutability: "view", type: "function" },
	{ inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }], name: "ownerOf", outputs: [{ internalType: "address", name: "", type: "address" }], stateMutability: "view", type: "function" },
	{
		inputs: [
			{ internalType: "uint256", name: "tokenId", type: "uint256" },
			{ internalType: "uint256", name: "backgroundIndex", type: "uint256" },
		],
		name: "setTokenBackground",
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
		inputs: [
			{ internalType: "uint256", name: "tokenId", type: "uint256" },
			{ internalType: "string", name: "name", type: "string" },
		],
		name: "setTokenName",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{ inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }], name: "tokenURI", outputs: [{ internalType: "string", name: "", type: "string" }], stateMutability: "view", type: "function" },
	{ inputs: [{ internalType: "address", name: "owner", type: "address" }], name: "tokensOfOwner", outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }], stateMutability: "view", type: "function" },
	{
		inputs: [
			{ internalType: "address", name: "owner", type: "address" },
			{ internalType: "uint256", name: "start", type: "uint256" },
			{ internalType: "uint256", name: "stop", type: "uint256" },
		],
		name: "tokensOfOwnerIn",
		outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
		stateMutability: "view",
		type: "function",
	},
	{ inputs: [], name: "totalSupply", outputs: [{ internalType: "uint256", name: "result", type: "uint256" }], stateMutability: "view", type: "function" },
] as const;