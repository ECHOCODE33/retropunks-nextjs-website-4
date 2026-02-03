"use client";

import Image from "next/image";
import Link from "next/link";

export default function About() {
	return (
		<section id="about" className="section">
			<div className="flex flex-col gap-12 text-center">
				<h1 className="section-title">The RetroPunks</h1>
				<p className="font-space text-base text-gray-300 lg:text-2xl">
					An <span className="font-normal text-retro-orange">exclusive</span> collection of 10,000 retro PFP NFTs on the Ethereum chain.
				</p>
			</div>

			<div className="grid grid-cols-[1fr_min-content] gap-4 place-items-center place-content-center mt-20">
				<div className="font-space space-y-4 text-[20px] leading-relaxed text-gray-300">
					<p>
						You could <span className="text-retro-orange">swear</span> you've seen them before - on the street, in a bar, behind the counter at the store. Maybe on the last <span className="italic">train</span> home.
					</p>
					<p>
						Some look like you. Some look like the version of you that you haven't dared to become yet. <span className="text-retro-orange">Crooked</span> grin. Piercings. Faded ink.
					</p>
					<p>
						And there are whispers they're not all human. That under the cotton. <span className="text-retro-orange">Skeletons</span>. Zombies. Apes. Under the golden sun, he breathes.
					</p>
					<p>
						They're not here to save the world. They're here to live in it. Just like you. On-Chain Artwork. Welcome to the <span className="text-retro-orange">Crypto Culture Club</span>.
					</p>
				</div>

				<div className="flex justify-center border-3 border-retro-orange">
					<div className="relative overflow-hidden border-8 border-black w-80 h-80">
						<Image src="/punk.png" alt="Featured RetroPunk" fill className="object-cover pixelated" />
					</div>
				</div>
			</div>

			<div className="mt-24 text-center">
				<Link href="https://opensea.io/" target="_blank" rel="noopener noreferrer">
					<button className="mint-btn">MINT</button>
				</Link>
			</div>
		</section>
	);
}
