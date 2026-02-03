"use client";

import Image from "next/image";

export default function Creator() {
	return (
		<section id="creator" className="section">
			<div className="mx-auto max-w-7xl">
				<h2 className="mb-24 text-center section-title">The Creator</h2>

				<div className="overflow-hidden border-4 rounded-sm border-retro-green shadow-[5px_5px_15px_var(--color-retro-green)] bg-retro-green/5">
					<div className="py-8 text-center border-b-4 border-b-retro-green text-retro-green">
						<h3 className="text-3xl font-bold font-oxanium">ECHO (@echomatrix.eth)</h3>
					</div>

					<div className="grid gap-8 px-8 py-12 grid-cols-[min-content_1fr]">
						<div className="flex items-center justify-center">
							<div className="relative w-90 h-90 overflow-hidden border-2 border-retro-green">
								<Image src="/punk.png" alt="RetroPunk Image" fill className="pixelated object-cover" />
							</div>
						</div>

						<div className="flex flex-col justify-center items-center space-y-4 text-base leading-relaxed text-gray-300">
							<p>Hi, I&apos;m ECHO (well, that is what I prefer to be known as), the creator of the PUNKWRLD series featuring the RetroPunks and CYBRPNKS NFT collections.</p>
							<p>
								I am a programmer (not a great one though), a tech-enthusiast, an artist (or I consider myself to be one, hehe), and a teenager living in the United States with the hopes to explore the world of new-generation technology such
								as AI, Web3, blockchain, crypto, and the metaverse.
							</p>
							<p>
								I&apos;ve been fascinated by technology, especially the blockchain, and I hope to contribute to the new phase of the World Wide Web (Web3). I have carefully worked on and built this project for a long time and hope it can make
								a lasting impact in the immortal world of Web3.
							</p>
							<p>I prefer to keep my identity hidden and to stay anonymous. Besides, the art is more important than the artist.</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
