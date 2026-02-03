import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { mainnet, sepolia, base, baseSepolia } from "viem/chains";
import { RETROPUNKS_ABI } from "@/lib/contracts";

export async function POST(request: NextRequest) {
	const body = await request.json();
	const { contractAddress, functionName, args, chainId } = body;

	if (!chainId) return NextResponse.json({ error: "chainId is required" }, { status: 400 });

	const chainMap = {
		1: mainnet,
		11155111: sepolia,
		8453: base,
		84532: baseSepolia,
	} as const;

	const rpcUrlMap = {
		1: process.env.NEXT_PUBLIC_RPC_ETHEREUM_MAINNET || "https://ethereum-rpc.publicnode.com",
		11155111: process.env.NEXT_PUBLIC_RPC_ETHEREUM_SEPOLIA || "https://ethereum-sepolia-rpc.publicnode.com",
		8453: process.env.NEXT_PUBLIC_RPC_BASE_MAINNET || "https://base-rpc.publicnode.com",
		84532: process.env.NEXT_PUBLIC_RPC_BASE_SEPOLIA || "https://base-sepolia-rpc.publicnode.com",
	} as const;

	const selectedChain = chainMap[chainId as keyof typeof chainMap];
	const rpcUrl = rpcUrlMap[chainId as keyof typeof rpcUrlMap];

	if (!selectedChain || !rpcUrl) return NextResponse.json({ error: "Unsupported chain" }, { status: 400 });

	const publicClient = createPublicClient({
		chain: selectedChain,
		transport: http(rpcUrl),
	});

	try {
		// Convert string args to proper types (especially for tokenId which should be bigint)
		const processedArgs = args?.map((arg: any) => {
			// If it's a numeric string, convert to bigint
			if (typeof arg === "string" && /^\d+$/.test(arg)) return BigInt(arg);
			return arg;
		});

		let result = await publicClient.readContract({
			address: contractAddress as `0x${string}`,
			abi: RETROPUNKS_ABI,
			functionName,
			args: processedArgs,
		});

		// Convert BigInts to strings for JSON serialization
		const serializeResult = (val: any): any => {
			if (typeof val === "bigint") return val.toString();
			else if (Array.isArray(val)) return val.map(serializeResult);
			else if (typeof val === "object" && val !== null) return Object.fromEntries(Object.entries(val).map(([k, v]) => [k, serializeResult(v)]));

			return val;
		};

		const serializedResult = serializeResult(result);

		return NextResponse.json({ result: serializedResult });
	} catch (error) {
		console.error("Contract read error:", error);
		return NextResponse.json({ error: "Failed to read contract" }, { status: 500 });
	}
}