"use client";

import { useState, useEffect } from "react";
import { useAccount, useChainId } from "wagmi";
import PunkCard from "@/components/PunkCard";
import { RETROPUNKS_CONTRACT } from "@/lib/contracts";

export default function MyPunksPage() {
	const { address, isConnected } = useAccount();
	const chainId = useChainId();
	const [tokens, setTokens] = useState<
		Array<{ tokenId: string; tokenUri: string; currentBg: number; name: string; bio: string }>
	>([]);
	const [loading, setLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	useEffect(() => {
		async function fetchTokens() {
			if (!address || !isConnected) {
				setLoading(false);
				return;
			}

			setLoading(true);
			setErrorMessage(null);

			try {
				const alchemyUrl = process.env.NEXT_PUBLIC_RPC_URL;
				const alchemyRes = await fetch(
					`${alchemyUrl}/getNFTs?owner=${address}&contractAddresses[]=${RETROPUNKS_CONTRACT.toLowerCase()}`
				);

				if (!alchemyRes.ok) throw new Error("Alchemy fetch failed");

				const alchemyData = await alchemyRes.json();
				const owned = alchemyData.ownedNfts || [];

				const tokenData = await Promise.all(
					owned.map(async (nft: { id: { tokenId: string } }) => {
						const tokenId = nft.id.tokenId
							.replace(/^0x/, "")
							.padStart(64, "0");
						const decimalId = BigInt(`0x${tokenId}`).toString();

						let currentBg = 0;
						let name = "";
						let bio = "";

						try {
							const metaRes = await fetch("/api/read-contract", {
								method: "POST",
								body: JSON.stringify({
									contractAddress: RETROPUNKS_CONTRACT,
									functionName: "globalTokenMetadata",
									args: [decimalId],
									chainId,
								}),
							});
							const metaData = await metaRes.json();
							const meta = metaData?.result;
							currentBg = meta ? Number(meta[1]) : 0;
							name = meta?.[2] ?? "";
							bio = meta?.[3] ?? "";
						} catch {
							// Fallback if metadata fetch fails
						}

						let tokenUri = "";
						try {
							const uriRes = await fetch("/api/read-contract", {
								method: "POST",
								body: JSON.stringify({
									contractAddress: RETROPUNKS_CONTRACT,
									functionName: "tokenURI",
									args: [decimalId],
									chainId,
								}),
							});
							const uriData = await uriRes.json();
							tokenUri = uriData?.result || "";
						} catch {
							// Skip tokens we can't fetch URI for
						}

						return { tokenId: decimalId, tokenUri, currentBg, name, bio };
					})
				);

				setTokens(tokenData.filter((t) => t.tokenUri));
			} catch (err: unknown) {
				setErrorMessage(err instanceof Error ? err.message : "Failed to load punks");
			} finally {
				setLoading(false);
			}
		}

		fetchTokens();
	}, [address, isConnected, chainId]);

	if (!isConnected) {
		return (
			<div className="w-full min-h-[60vh] flex flex-col items-center justify-center px-4">
				<div className="text-center max-w-md">
					<h2 className="text-2xl font-bold text-white mb-3">Connect your wallet</h2>
					<p className="text-gray-400 text-sm">
						Connect your wallet to view and customize your RetroPunks collection.
					</p>
				</div>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="w-full min-h-[60vh] flex flex-col items-center justify-center px-4">
				<div className="w-10 h-10 border-2 border-retro-orange/50 border-t-retro-orange rounded-full animate-spin" />
				<p className="text-gray-400 mt-4 text-sm">Loading your punks...</p>
			</div>
		);
	}

	if (errorMessage) {
		return (
			<div className="w-full min-h-[60vh] flex flex-col items-center justify-center px-4">
				<div className="text-center max-w-md">
					<p className="text-error font-medium">{errorMessage}</p>
					<p className="text-gray-400 text-sm mt-2">
						Please try again or check your connection.
					</p>
				</div>
			</div>
		);
	}

	if (tokens.length === 0) {
		return (
			<div className="w-full min-h-[60vh] flex flex-col items-center justify-center px-4">
				<div className="text-center max-w-md">
					<h2 className="text-2xl font-bold text-white mb-3">No RetroPunks yet</h2>
					<p className="text-gray-400 text-sm">
						You don't own any RetroPunks. Mint one to get started and customize your on-chain avatar.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full min-w-0 py-8 sm:py-12 lg:py-16 px-3 sm:px-4">
			<div className="max-w-6xl mx-auto min-w-0">
				<header className="text-center mb-8 sm:mb-12 lg:mb-16">
					<h1 className="section-title text-retro-orange mb-4 sm:mb-6">My RetroPunks</h1>
					<p className="text-gray-400 text-sm mt-2">
						{tokens.length} {tokens.length === 1 ? "punk" : "punks"} in your collection
					</p>
				</header>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 justify-items-center">
					{tokens.map((token) => (
						<PunkCard
							key={token.tokenId}
							tokenId={token.tokenId}
							tokenUri={token.tokenUri}
							currentBg={token.currentBg}
							name={token.name}
							bio={token.bio}
							onMetadataUpdate={(id, updates) => {
								setTokens((prev) =>
									prev.map((t) =>
										t.tokenId === id
											? {
													...t,
													name: updates.name ?? t.name,
													bio: updates.bio ?? t.bio,
												}
											: t
									)
								);
							}}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
