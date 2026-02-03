"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
	return (
		<footer className="w-full bg-retro-dark border-t-2 border-retro-light py-8 px-16">
			<div className="flex flex-col gap-10 mx-auto">

				<div className="flex flex-row justify-between items-center">
					<div className="flex justify-center items-center">
						<Link href="/" className="flex items-center shrink-0">
							<span className="font-press active:scale-[0.95] text-xl leading-none tracking-tight">
								RETRO<span className="text-retro-orange">PUNKS</span>
							</span>
						</Link>
					</div>

					<div className="flex flex-wrap justify-center gap-4 text-sm">
						<Link href="/license" className="footer-link">
							License & Terms
						</Link>
						<a href="https://opensea.io" target="_blank" rel="noopener noreferrer" className="footer-link">
							OpenSea
						</a>
						<a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="footer-link">
							X (Twitter)
						</a>
						<a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="footer-link">
							Discord
						</a>
						<a href="https://etherscan.io" target="_blank" rel="noopener noreferrer" className="footer-link">
							Etherscan
						</a>
					</div>
				</div>

				<div className="flex justify-center items-center w-full">
					<p className="font-google text-gray-400 text-sm">© 2026 RetroPunks</p>
				</div>

			</div>
		</footer>
	);
}
