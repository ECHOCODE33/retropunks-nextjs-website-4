"use client";

import { useState } from "react";

interface FAQItem {
	question: string;
	answer: string;
}

const faqData: FAQItem[] = [
	{
		question: "How many RetroPunks are there?",
		answer: "There are 10,000 unique RetroPunks NFTs in the collection, each with distinct traits and characteristics stored fully on-chain.",
	},
	{
		question: "How are the NFTs created?",
		answer: "RetroPunks are algorithmically generated on-chain with a combination of traits including background, skin type, eyes, hair, headwear, and eyewear. The artwork is rendered as SVG directly from the smart contract.",
	},
	{
		question: "What can I do with my NFTs?",
		answer: "You can customize your RetroPunk by changing its background, name, and bio. You can also trade them on secondary marketplaces like OpenSea, use them as profile pictures, or hold them as collectibles.",
	},
	{
		question: "Do I own the art when I mint an NFT?",
		answer: "Yes! When you own a RetroPunk NFT, you have full commercial rights to that specific artwork. You can use it however you like, including for commercial purposes.",
	},
	{
		question: "What inspired the creation of the RetroPunks?",
		answer: "RetroPunks was inspired by the early days of crypto culture and punk aesthetics. The goal was to create a collection that celebrates individuality and the rebellious spirit of Web3.",
	},
	{
		question: "Can I customize my NFTs?",
		answer: "Yes! RetroPunks allows you to customize your NFT by changing the background, setting a custom name (up to 32 characters), and writing a bio (up to 160 characters). Note: The first 7 special 1-of-1 NFTs cannot be customized.",
	},
	{
		question: "How does the OpenSea drop work?",
		answer: "The collection can be minted directly from the smart contract or through OpenSea. After the initial mint, NFTs can be bought and sold on the secondary market.",
	},
	{
		question: "Can I sell my RetroPunks?",
		answer: "Absolutely! You can list your RetroPunks for sale on any NFT marketplace that supports ERC-721 tokens, such as OpenSea, LooksRare, or X2Y2.",
	},
];

export default function FAQ() {
	// Use a Set to track multiple open indices at once
	const [openIndices, setOpenIndices] = useState<Set<number>>(new Set());

	const toggleFAQ = (index: number) => {
		const newIndices = new Set(openIndices);
		if (newIndices.has(index)) newIndices.delete(index);
		else newIndices.add(index);
		setOpenIndices(newIndices);
	};

	return (
		<section id="faq" className="section">
			<div className="w-full my-auto min-w-6xl">
				<h2 className="mb-24 text-center normal-case section-title">FAQs</h2>

				<div className="space-y-6">
					{faqData.map((item, index) => {
						const isOpen = openIndices.has(index);

						return (
							<div key={index} className="flex flex-col bg-retro-dark transition-all duration-300 shadow-2xl border-l-3 border-retro-orange">
								<button onClick={() => toggleFAQ(index)} className="flex items-center justify-between w-full p-4 text-left transition-colors md:p-6 hover:bg-white/5">
									<span className="text-lg font-medium text-white font-google md:text-xl">{item.question}</span>
									<span className="ml-4 text-3xl font-light text-retro-orange hover:cursor-pointer">{isOpen ? "-" : "+"}</span>
								</button>

								{isOpen && (
									<div className="font-lexend p-4 text-base leading-relaxed text-gray-300 duration-300 md:px-6 animate-in fade-in slide-in-from-top-2">
										{/* <hr className="mb-4 border-retro-orange/30" /> */}
										{item.answer}
									</div>
								)}
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
