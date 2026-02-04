import type { Metadata, Viewport } from "next";
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { ClientProviders } from "@/app/ClientProviders";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { pressFont, googleFont, robotoFont, spaceFont, lexendFont, oxaniumFont } from "@/lib/fonts";

export const metadata: Metadata = {
	title: "Project Red Moon",
	description: "An exclusive collection of 10,000 retro PFP NFTs on the Ethereum chain. Fully on-chain artwork.",
	keywords: "NFT, RetroPunks, Ethereum, PFP, On-Chain, Crypto, Web3",
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	interactiveWidget: "resizes-content",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className={`${pressFont.variable} ${googleFont.variable} ${robotoFont.variable} ${spaceFont.variable} ${lexendFont.variable} ${oxaniumFont.variable} antialiased`}>
			<body>
				<ClientProviders>
					<div className="min-h-screen flex flex-col w-full mx-auto max-w-7xl px-4 sm:px-8 lg:px-16 min-w-0">
						<Header />
						<main className="flex flex-col grow items-center justify-center">{children}</main>
						<Footer />
					</div>
				</ClientProviders>
			</body>
		</html>
	);
}
