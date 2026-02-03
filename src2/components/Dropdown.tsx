"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

const socials = [
	{ name: "X (Twitter)", icon: "/x.svg", url: "https://twitter.com" },
	{ name: "Discord", icon: "/discord.svg", url: "https://discord.com" },
	{ name: "OpenSea", icon: "/opensea.svg", url: "https://opensea.io" },
	{ name: "Etherscan", icon: "/etherscan.svg", url: "https://etherscan.io" },
];

interface SocialsDropdownProps {
	className?: string;
}

export default function SocialsDropdown({ className }: SocialsDropdownProps) {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<div className="relative" ref={dropdownRef}>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className={className} // This now uses the style passed from Header
				aria-expanded={isOpen}
				aria-haspopup="true">
				SOCIALS
			</button>

			{isOpen && (
				/* The dropdown menu stays styled with its own background */
				<div className="absolute top-full left-0 mt-2 w-48 bg-retro-dark border border-retro-orange shadow-xl z-50">
					{socials.map((social) => (
						<a
							key={social.name}
							href={social.url}
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center space-x-3 px-4 py-3 hover:bg-retro-orange/20 transition-colors duration-200"
							onClick={() => setIsOpen(false)}>
							<Image src={social.icon} alt="" width={20} height={20} className="shrink-0" />
							<span className="text-white text-[13px] uppercase font-bold tracking-wider">{social.name}</span>
						</a>
					))}
				</div>
			)}
		</div>
	);
}
