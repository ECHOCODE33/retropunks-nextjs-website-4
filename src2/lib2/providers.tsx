"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { config } from "@/app/wagmi";
import { ReactNode } from "react";

const queryClient = new QueryClient();

const customTheme = darkTheme({
	accentColor: "#ff8359",
	accentColorForeground: "white",
	borderRadius: "none",
});

export function Providers({ children }: { children: ReactNode }) {
	return (
		<WagmiProvider config={config}>
			<QueryClientProvider client={queryClient}>
				<RainbowKitProvider theme={customTheme}>{children}</RainbowKitProvider>
			</QueryClientProvider>
		</WagmiProvider>
	);
}
