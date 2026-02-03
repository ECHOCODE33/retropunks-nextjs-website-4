"use client";

import Image from "next/image";

export default function PunkWorld() {
	return (
		<section className="px-4 py-20 bg-retro-dark">
			<div className="max-w-6xl mx-auto">
				<h2 className="mb-20 text-5xl font-bold tracking-wider text-center font-press">PUNKWRLD</h2>

				<div className="grid max-w-4xl gap-16 mx-auto md-l:grid-cols-2">
					<div className="bg-[#2a1410] border-2 border-retro-orange rounded-lg p-12 shadow-[0_0_25px_rgba(255,107,53,0.5)]">
						<h3 className="mb-2 text-sm font-bold tracking-widest text-center uppercase text-retro-orange">
							PART I
						</h3>
						<h4 className="mb-8 font-bold tracking-wide text-center text-retro-orange" style={{ fontSize: "12px" }}>
							RetroPunks
						</h4>

						<div className="flex justify-center mb-8">
							<div className="w-36 h-36 bg-[#c0c0c0] border-4 border-retro-orange">
								<Image src="/punk.png" alt="RetroPunk Example" width={144} height={144} className="object-cover w-full h-full pixelated" />
							</div>
						</div>

						<ul className="pl-4 space-y-2">
							<li className="flex items-start" style={{ fontSize: "10px", color: "#d4a574" }}>
								<span className="mr-3">•</span>
								<span>10,000 NFTs</span>
							</li>
							<li className="flex items-start" style={{ fontSize: "10px", color: "#d4a574" }}>
								<span className="mr-3">•</span>
								<span>Retro-themed</span>
							</li>
							<li className="flex items-start" style={{ fontSize: "10px", color: "#d4a574" }}>
								<span className="mr-3">•</span>
								<span>Fully on-chain</span>
							</li>
							<li className="flex items-start" style={{ fontSize: "10px", color: "#d4a574" }}>
								<span className="mr-3">•</span>
								<span>Ethereum-based</span>
							</li>
							<li className="flex items-start" style={{ fontSize: "10px", color: "#d4a574" }}>
								<span className="mr-3">•</span>
								<span>Customizable</span>
							</li>
						</ul>
					</div>

					<div className="bg-[#2a1410] border-2 border-retro-orange rounded-lg p-12 shadow-[0_0_25px_rgba(255,107,53,0.5)]">
						<h3 className="mb-2 font-bold tracking-widest text-center uppercase text-retro-orange" style={{ fontSize: "14px" }}>
							PART II
						</h3>
						<h4 className="mb-8 font-bold tracking-wide text-center text-retro-orange" style={{ fontSize: "12px" }}>
							CYBRPNKS
						</h4>

						<div className="flex justify-center mb-8">
							<div className="w-36 h-36 bg-[#00d4ff] border-4 border-[#0088aa]">
								<Image src="/punk.png" alt="CYBRPNK Example" width={144} height={144} className="object-cover w-full h-full pixelated" />
							</div>
						</div>

						<ul className="pl-4 space-y-2">
							<li className="flex items-start" style={{ fontSize: "10px", color: "#d4a574" }}>
								<span className="mr-3">•</span>
								<span>20,000 NFTs</span>
							</li>
							<li className="flex items-start" style={{ fontSize: "10px", color: "#d4a574" }}>
								<span className="mr-3">•</span>
								<span>Dystopian-themed</span>
							</li>
							<li className="flex items-start" style={{ fontSize: "10px", color: "#d4a574" }}>
								<span className="mr-3">•</span>
								<span>Fully On-Chain</span>
							</li>
							<li className="flex items-start" style={{ fontSize: "10px", color: "#d4a574" }}>
								<span className="mr-3">•</span>
								<span>Ethereum-based</span>
							</li>
							<li className="flex items-start" style={{ fontSize: "10px", color: "#d4a574" }}>
								<span className="mr-3">•</span>
								<span>Customizable</span>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</section>
	);
}
