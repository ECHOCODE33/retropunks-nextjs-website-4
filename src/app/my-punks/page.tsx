"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount, useChainId } from "wagmi";
import { RETROPUNKS_CONTRACT } from "@/lib/contracts";
import { bytes32ToString } from "@/lib/utilities";
import PunkCard from "@/components/PunkCard";

// Constants
const BASE_MAINNET_CHAIN_ID = 8453;

// Types
interface TokenData {
	tokenId: string;
	tokenUri: string;
	currentBg: number;
	name: string;
	bio: string;
}

interface MetadataUpdate {
	name?: string;
	bio?: string;
	currentBg?: number;
}

/**
 * My Punks Page Component
 *
 * Displays all RetroPunks NFTs owned by the connected wallet.
 * Fetches token data from Alchemy API and metadata from the smart contract.
 */
export default function MyPunksPage() {
	// Wagmi hooks for wallet connection state
	const { address, isConnected } = useAccount();
	const chainId = useChainId();

	// Component state
	const [tokens, setTokens] = useState<TokenData[]>([]);
	const [loading, setLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	/**
	 * Fetches a single token's metadata from the contract
	 */
	const fetchTokenMetadata = useCallback(
		async (tokenId: string) => {
			try {
				const response = await fetch("/api/read-contract", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						contractAddress: RETROPUNKS_CONTRACT,
						functionName: "globalTokenMetadata",
						args: [tokenId],
						chainId,
					}),
				});

				if (!response.ok) {
					throw new Error("Failed to fetch metadata");
				}

				const data = await response.json();
				const meta = data?.result;

				// Parse metadata from contract response
				// Structure: [tokenIdSeed, backgroundIndex, name (bytes32), bio]
				return {
					currentBg: meta ? Number(meta[1]) : 0,
					name: meta?.[2] ? bytes32ToString(String(meta[2])) : "",
					bio: meta?.[3] ?? "",
				};
			} catch (error) {
				console.error(`Error fetching metadata for token ${tokenId}:`, error);
				return { currentBg: 0, name: "", bio: "" };
			}
		},
		[chainId],
	);

	/**
	 * Fetches a single token's URI from the contract
	 */
	const fetchTokenUri = useCallback(
		async (tokenId: string): Promise<string> => {
			try {
				const response = await fetch("/api/read-contract", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						contractAddress: RETROPUNKS_CONTRACT,
						functionName: "tokenURI",
						args: [tokenId],
						chainId,
					}),
				});

				if (!response.ok) {
					throw new Error("Failed to fetch token URI");
				}

				const data = await response.json();
				return data?.result || "";
			} catch (error) {
				console.error(`Error fetching URI for token ${tokenId}:`, error);
				return "";
			}
		},
		[chainId],
	);

	/**
	 * Fetches all tokens owned by the connected wallet
	 */
	const fetchTokens = useCallback(async () => {
		// Early exit conditions
		if (!address || !isConnected) {
			setLoading(false);
			return;
		}

		if (chainId !== BASE_MAINNET_CHAIN_ID) {
			setTokens([]);
			setLoading(false);
			return;
		}

		setLoading(true);
		setErrorMessage(null);

		try {
			// Fetch NFTs from Alchemy API
			const alchemyUrl = process.env.NEXT_PUBLIC_RPC_URL;
			const alchemyResponse = await fetch(`${alchemyUrl}/getNFTs?owner=${address}&contractAddresses[]=${RETROPUNKS_CONTRACT.toLowerCase()}`);

			if (!alchemyResponse.ok) {
				throw new Error("Failed to fetch NFTs from Alchemy");
			}

			const alchemyData = await alchemyResponse.json();
			const ownedNfts = alchemyData.ownedNfts || [];

			// Fetch metadata and URI for each token in parallel
			const tokenDataPromises = ownedNfts.map(async (nft: { id: { tokenId: string } }) => {
				// Convert hex token ID to decimal
				const hexTokenId = nft.id.tokenId.replace(/^0x/, "").padStart(64, "0");
				const tokenId = BigInt(`0x${hexTokenId}`).toString();

				// Fetch metadata and URI in parallel for better performance
				const [metadata, tokenUri] = await Promise.all([fetchTokenMetadata(tokenId), fetchTokenUri(tokenId)]);

				return {
					tokenId,
					tokenUri,
					currentBg: metadata.currentBg,
					name: metadata.name,
					bio: metadata.bio,
				};
			});

			const tokenData = await Promise.all(tokenDataPromises);

			// Filter out tokens without valid URIs
			const validTokens = tokenData.filter((token) => token.tokenUri);
			setTokens(validTokens);
		} catch (error) {
			const errorMsg = error instanceof Error ? error.message : "Failed to load punks";
			setErrorMessage(errorMsg);
			console.error("Error fetching tokens:", error);
		} finally {
			setLoading(false);
		}
	}, [address, isConnected, chainId, fetchTokenMetadata, fetchTokenUri]);

	/**
	 * Handles metadata updates from child PunkCard components
	 */
	const handleMetadataUpdate = useCallback(
		async (tokenId: string, updates: MetadataUpdate) => {
			// Update local state immediately for responsive UI
			setTokens((prevTokens) =>
				prevTokens.map((token) =>
					token.tokenId === tokenId
						? {
								...token,
								name: updates.name ?? token.name,
								bio: updates.bio ?? token.bio,
								currentBg: updates.currentBg ?? token.currentBg,
							}
						: token,
				),
			);

			// Refetch tokenURI to get updated on-chain image
			try {
				const newUri = await fetchTokenUri(tokenId);
				if (newUri) {
					setTokens((prevTokens) => prevTokens.map((token) => (token.tokenId === tokenId ? { ...token, tokenUri: newUri } : token)));
				}
			} catch (error) {
				console.error("Error refetching token URI:", error);
				// Continue with previous tokenURI if refetch fails
			}
		},
		[fetchTokenUri],
	);

	// Fetch tokens when wallet connection state changes
	useEffect(() => {
		fetchTokens();
	}, [fetchTokens]);

	// Loading state
	if (!isConnected) {
		return (
			<div className="w-full min-h-[60vh] flex flex-col items-center justify-center px-4">
				<div className="text-center max-w-md">
					<h2 className="text-2xl font-bold text-white mb-3">Connect your wallet</h2>
					<p className="text-gray-400 text-sm">Connect your wallet to view and customize your RetroPunks collection.</p>
				</div>
			</div>
		);
	}

	// Wrong network state
	if (chainId !== BASE_MAINNET_CHAIN_ID) {
		return (
			<div className="w-full min-h-[60vh] flex flex-col items-center justify-center px-4">
				<div className="text-center max-w-md">
					<h2 className="text-2xl font-bold text-white mb-3">Wrong network</h2>
					<p className="text-gray-400 text-sm">RetroPunks are on Base Mainnet. Please switch your wallet to Base to view and customize your collection.</p>
				</div>
			</div>
		);
	}

	// Loading spinner
	if (loading) {
		return (
			<div className="w-full min-h-[60vh] flex flex-col items-center justify-center px-4">
				<div className="w-10 h-10 border-2 border-retro-orange/50 border-t-retro-orange rounded-full animate-spin" />
				<p className="text-gray-400 mt-4 text-sm">Loading your punks...</p>
			</div>
		);
	}

	// Error state
	if (errorMessage) {
		return (
			<div className="w-full min-h-[60vh] flex flex-col items-center justify-center px-4">
				<div className="text-center max-w-md">
					<p className="text-error font-medium">{errorMessage}</p>
					<p className="text-gray-400 text-sm mt-2">Please try again or check your connection.</p>
				</div>
			</div>
		);
	}

	// Empty state
	if (tokens.length === 0) {
		return (
			<div className="w-full min-h-[60vh] flex flex-col items-center justify-center px-4">
				<div className="text-center max-w-md">
					<h2 className="text-2xl font-bold text-white mb-3">No RetroPunks yet</h2>
					<p className="text-gray-400 text-sm">You don't own any RetroPunks. Mint one to get started and customize your on-chain avatar.</p>
				</div>
			</div>
		);
	}

	// Main content - Display NFT grid
	return (
		<div className="w-full min-w-0 py-8 sm:py-12 lg:py-16 px-3 sm:px-4">
			<div className="max-w-6xl mx-auto min-w-0">
				{/* Page Header */}
				<header className="text-center mb-8 sm:mb-12 lg:mb-16">
					<h1 className="section-title text-retro-orange mb-4 sm:mb-6">My RetroPunks</h1>
					<p className="text-gray-400 text-sm mt-2">
						{tokens.length} {tokens.length === 1 ? "punk" : "punks"} in your collection
					</p>
				</header>

				{/* NFT Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 justify-items-center">
					{tokens.map((token) => (
						<PunkCard
							key={token.tokenId}
							tokenId={token.tokenId}
							tokenUri={token.tokenUri}
							currentBg={token.currentBg}
							name={token.name}
							bio={token.bio}
							onMetadataUpdate={handleMetadataUpdate}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
