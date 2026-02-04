"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { Toaster } from "sonner";
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
				<RainbowKitProvider theme={customTheme}>
					{children}
					<Toaster
						position="bottom-center"
						theme="dark"
						toastOptions={{
							style: {
								background: "rgba(27,27,27,0.98)",
								border: "1px solid rgba(255,131,89,0.25)",
								color: "#fff",
							},
							classNames: {
								toast: "backdrop-blur-sm",
							},
						}}
					/>
				</RainbowKitProvider>
			</QueryClientProvider>
		</WagmiProvider>
	);
}
