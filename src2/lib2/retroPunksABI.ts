export const RETROPUNKS_CONTRACT_ADDRESS = "0x206540a2344349D422A7A872Bb607139321c0b53" as const;

export const RETROPUNKS_ABI = [
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
	{ anonymous: false, inputs: [{ indexed: false, internalType: "uint256", name: "newAmount", type: "uint256" }], name: "OwnerMintsUpdated", type: "event" },

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
	{ inputs: [], name: "name", outputs: [{ internalType: "string", name: "", type: "string" }], stateMutability: "view", type: "function" },
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
