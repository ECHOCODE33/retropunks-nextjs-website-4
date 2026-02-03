"use client";

import { useState, useEffect } from "react";
import { useAccount, useChainId } from "wagmi";
import PunkCard from "@/components/PunkCard";
import { RETROPUNKS_CONTRACT } from "@/lib/contracts";

export default function MyPunksPage() {
	const { address, isConnected } = useAccount();
	const chainId = useChainId();
	const [tokens, setTokens] = useState<Array<{ tokenId: string; tokenUri: string; currentBg: number }>>([]);
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

				const alchemyRes = await fetch(`${alchemyUrl}/getNFTs?owner=${address}&contractAddresses[]=${RETROPUNKS_CONTRACT.toLowerCase()}`);

				if (!alchemyRes.ok) throw new Error("Alchemy fetch failed");

				const alchemyData = await alchemyRes.json();

				const owned = alchemyData.ownedNfts || [];

				const tokenData = await Promise.all(
					owned.map(async (nft: any) => {
						const tokenId = nft.id.tokenId.replace(/^0x/, "").padStart(64, "0"); // Normalize if needed
						const decimalId = BigInt(`0x${tokenId}`).toString();

						// Fetch metadata and tokenURI
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
						const currentBg = metaData.result ? Number(metaData.result[1]) : 0;

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
						const tokenUri = uriData.result || "";

						return { tokenId: decimalId, tokenUri, currentBg };
					}),
				);

				setTokens(tokenData.filter((t) => t.tokenUri));
			} catch (err: any) {
				setErrorMessage(err.message || "Failed to load punks");
			} finally {
				setLoading(false);
			}
		}

		fetchTokens();
	}, [address, isConnected, chainId]);

	if (!isConnected) return <div className="text-center py-20">Connect wallet to view your RetroPunks</div>;

	if (loading) return <div className="text-center py-20">Loading...</div>;

	if (errorMessage) return <div className="text-center py-20 text-red-500">{errorMessage}</div>;

	if (tokens.length === 0) return <div className="text-center py-20">No RetroPunks owned</div>;

	return (
		<div className="min-h-screen bg-black py-20 px-4">
			<h1 className="text-5xl font-bold text-center mb-12 text-cyan-400">My RetroPunks</h1>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
				{tokens.map((token) => (
					<PunkCard key={token.tokenId} tokenId={token.tokenId} tokenUri={token.tokenUri} currentBg={token.currentBg} />
				))}
			</div>
		</div>
	);
}
