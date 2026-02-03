"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import MobileNavbar from "./Mobile-Navbar";
import { useState, useRef, useEffect, ReactNode } from "react";

type SocialLink = {
	name: string;
	href: string;
	icon: ReactNode;
};

const SOCIAL_LINKS: SocialLink[] = [
	{
		name: "X (Twitter)",
		href: "https://x.com",
		icon: (
			<svg viewBox="0 0 1200 1227" className="w-4 h-4" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" fill="white" />
			</svg>
		),
	},
	{
		name: "Discord",
		href: "https://discord.gg",
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 126.644 96" className="w-5 h-5 text-[#5865F2]" fill="currentColor">
				<path d="M81.15,0c-1.2376,2.1973-2.3489,4.4704-3.3591,6.794-9.5975-1.4396-19.3718-1.4396-28.9945,0-.985-2.3236-2.1216-4.5967-3.3591-6.794-9.0166,1.5407-17.8059,4.2431-26.1405,8.0568C2.779,32.5304-1.6914,56.3725.5312,79.8863c9.6732,7.1476,20.5083,12.603,32.0505,16.0884,2.6014-3.4854,4.8998-7.1981,6.8698-11.0623-3.738-1.3891-7.3497-3.1318-10.8098-5.1523.9092-.6567,1.7932-1.3386,2.6519-1.9953,20.281,9.547,43.7696,9.547,64.0758,0,.8587.7072,1.7427,1.3891,2.6519,1.9953-3.4601,2.0457-7.0718,3.7632-10.835,5.1776,1.97,3.8642,4.2683,7.5769,6.8698,11.0623,11.5419-3.4854,22.3769-8.9156,32.0509-16.0631,2.626-27.2771-4.496-50.9172-18.817-71.8548C98.9811,4.2684,90.1918,1.5659,81.1752.0505ZM42.2802,65.4144c-6.2383,0-11.4159-5.6575-11.4159-12.6535s4.9755-12.6788,11.3907-12.6788,11.5169,5.708,11.4159,12.6788c-.101,6.9708-5.026,12.6535-11.3907,12.6535ZM84.3576,65.4144c-6.2637,0-11.3907-5.6575-11.3907-12.6535s4.9755-12.6788,11.3907-12.6788,11.4917,5.708,11.3906,12.6788c-.101,6.9708-5.026,12.6535-11.3906,12.6535Z" />
			</svg>
		),
	},
	{
		name: "OpenSea",
		href: "https://opensea.io",
		icon: (
			<svg className="w-5 h-5" viewBox="0 0 360 360" fill="none" xmlns="http://www.w3.org/2000/svg">
				<g clipPath="url(#clip0_2_57)">
					<g clipPath="url(#clip1_2_57)">
						<path
							d="M252.072 212.292C245.826 220.662 232.686 234.558 225.378 234.558H191.412V212.274H218.466C222.336 212.274 226.026 210.708 228.69 207.954C242.586 193.554 250.614 176.418 250.614 158.04C250.614 126.684 227.178 98.964 191.394 82.26V67.284C191.394 60.84 186.174 55.62 179.73 55.62C173.286 55.62 168.066 60.84 168.066 67.284V73.494C158.04 70.56 147.42 68.328 136.332 67.05C154.692 86.994 165.906 113.67 165.906 142.92C165.906 169.146 156.942 193.23 141.876 212.31H168.066V234.63H129.726C124.542 234.63 120.33 230.436 120.33 225.234V215.478C120.33 213.768 118.944 212.364 117.216 212.364H66.672C65.682 212.364 64.836 213.174 64.836 214.164C64.8 254.088 96.39 284.058 134.172 284.058H240.822C266.382 284.058 277.812 251.298 292.788 230.454C298.602 222.39 312.552 215.91 316.782 214.11C317.556 213.786 318.006 213.066 318.006 212.22V199.26C318.006 197.946 316.71 196.956 315.432 197.316C315.432 197.316 253.782 211.482 253.062 211.68C252.342 211.896 252.072 212.31 252.072 212.31V212.292Z"
							fill="white"
						/>
						<path d="M146.16 142.83C146.16 122.724 139.266 104.22 127.746 89.586L69.732 189.972H132.138C141.012 176.436 146.178 160.236 146.178 142.848L146.16 142.83Z" fill="white" />
						<path
							d="M181.566 -5.19844e-06C80.91 -0.828005 -0.82799 80.91 1.00604e-05 181.566C0.84601 279.306 80.694 359.172 178.416 359.982C279.072 360.846 360.846 279.072 359.982 178.416C359.172 80.712 279.306 0.845995 181.566 -5.19844e-06ZM127.746 89.586C139.266 104.22 146.16 122.742 146.16 142.83C146.16 160.236 140.994 176.436 132.12 189.954H69.714L127.728 89.568L127.746 89.586ZM318.006 199.242V212.202C318.006 213.048 317.556 213.768 316.782 214.092C312.552 215.892 298.602 222.372 292.788 230.436C277.812 251.28 266.382 284.04 240.822 284.04H134.172C96.408 284.04 64.818 254.07 64.836 214.146C64.836 213.156 65.682 212.346 66.672 212.346H117.216C118.962 212.346 120.33 213.75 120.33 215.46V225.216C120.33 230.4 124.524 234.612 129.726 234.612H168.066V212.292H141.876C156.942 193.212 165.906 169.128 165.906 142.902C165.906 113.652 154.692 86.976 136.332 67.032C147.438 68.328 158.058 70.542 168.066 73.476V67.266C168.066 60.822 173.286 55.602 179.73 55.602C186.174 55.602 191.394 60.822 191.394 67.266V82.242C227.178 98.946 250.614 126.666 250.614 158.022C250.614 176.418 242.568 193.536 228.69 207.936C226.026 210.69 222.336 212.256 218.466 212.256H191.412V234.54H225.378C232.704 234.54 245.844 220.644 252.072 212.274C252.072 212.274 252.342 211.86 253.062 211.644C253.782 211.428 315.432 197.28 315.432 197.28C316.728 196.92 318.006 197.91 318.006 199.224V199.242Z"
							fill="#0086FF"
						/>
					</g>
				</g>
				<defs>
					<clipPath id="clip0_2_57">
						<rect width="360" height="360" fill="white" />
					</clipPath>
					<clipPath id="clip1_2_57">
						<rect width="360" height="360" fill="white" />
					</clipPath>
				</defs>
			</svg>
		),
	},
	{
		name: "Etherscan",
		href: "https://etherscan.io/",
		icon: (
			<svg className="w-5 h-5" width="123" height="123" viewBox="0 0 123 123" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path
					d="M25.79 58.4149C25.7901 57.7357 25.9244 57.0633 26.1851 56.4361C26.4458 55.809 26.8278 55.2396 27.3092 54.7605C27.7907 54.2814 28.3619 53.9021 28.9903 53.6444C29.6187 53.3867 30.2918 53.2557 30.971 53.2589L39.561 53.2869C40.9305 53.2869 42.244 53.831 43.2124 54.7994C44.1809 55.7678 44.725 57.0813 44.725 58.4509V90.9309C45.692 90.6439 46.934 90.3379 48.293 90.0179C49.237 89.7962 50.0783 89.262 50.6805 88.5019C51.2826 87.7418 51.6102 86.8006 51.61 85.8309V45.5409C51.61 44.1712 52.154 42.8576 53.1224 41.889C54.0908 40.9204 55.4043 40.3762 56.774 40.3759H65.381C66.7506 40.3762 68.0641 40.9204 69.0325 41.889C70.0009 42.8576 70.545 44.1712 70.545 45.5409V82.9339C70.545 82.9339 72.7 82.0619 74.799 81.1759C75.5787 80.8462 76.2441 80.2941 76.7122 79.5886C77.1803 78.8832 77.4302 78.0555 77.431 77.2089V32.6309C77.431 31.2615 77.9749 29.9481 78.9431 28.9797C79.9113 28.0113 81.2245 27.4672 82.5939 27.4669H91.201C92.5706 27.4669 93.884 28.0109 94.8525 28.9794C95.8209 29.9478 96.365 31.2613 96.365 32.6309V69.3399C103.827 63.9319 111.389 57.4279 117.39 49.6069C118.261 48.4717 118.837 47.1386 119.067 45.7267C119.297 44.3148 119.174 42.8678 118.709 41.5149C115.931 33.5227 111.516 26.1983 105.745 20.0105C99.974 13.8228 92.9749 8.90785 85.1955 5.58032C77.4161 2.2528 69.0277 0.585938 60.5671 0.686416C52.1065 0.786893 43.7601 2.6525 36.062 6.16383C28.3638 9.67517 21.4834 14.7549 15.8611 21.078C10.2388 27.401 5.99842 34.8282 3.41131 42.8842C0.824207 50.9401 -0.0526487 59.4474 0.836851 67.8617C1.72635 76.276 4.36263 84.4119 8.57696 91.7489C9.31111 93.0145 10.3912 94.0444 11.6903 94.7175C12.9894 95.3906 14.4536 95.679 15.911 95.5489C17.539 95.4059 19.566 95.2029 21.976 94.9199C23.0251 94.8008 23.9937 94.2999 24.6972 93.5126C25.4008 92.7253 25.7901 91.7067 25.791 90.6509L25.79 58.4149Z"
					fill="#21325B"
				/>
				<path d="M25.6021 110.51C34.6744 117.11 45.3959 121.072 56.5802 121.957C67.7646 122.841 78.9757 120.615 88.9731 115.523C98.9705 110.431 107.364 102.673 113.226 93.1068C119.087 83.5405 122.188 72.539 122.185 61.3197C122.185 59.9197 122.12 58.5347 122.027 57.1577C99.808 90.2957 58.7831 105.788 25.604 110.505" fill="#979695" />
			</svg>
		),
	},
];

export default function Header() {
	const [socialsOpen, setSocialsOpen] = useState(false);
	const rootRef = useRef<HTMLDivElement | null>(null);

	const scroll = (id: string): void => {
		document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
	};

	const handleLinkClick = () => setSocialsOpen(false);

	useEffect(() => {
		function handleOutside(e: MouseEvent | TouchEvent) {
			if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
				setSocialsOpen(false);
			}
		}
		function handleEsc(e: KeyboardEvent) {
			if (e.key === "Escape") setSocialsOpen(false);
		}

		document.addEventListener("mousedown", handleOutside);
		document.addEventListener("touchstart", handleOutside);
		document.addEventListener("keydown", handleEsc);
		return () => {
			document.removeEventListener("mousedown", handleOutside);
			document.removeEventListener("touchstart", handleOutside);
			document.removeEventListener("keydown", handleEsc);
		};
	}, []);

	const arrow = (
		<svg className="w-3 h-3 transition-all -translate-x-2 opacity-0 group-hover/item:opacity-40 group-hover/item:translate-x-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
		</svg>
	);

	// Optimized classes for the new structure
	const socialsMenuClass = `absolute left-1/2 -translate-x-1/2 lg:left-0 lg:translate-x-0 top-[calc(100%+8px)] transition-all duration-300 z-50 ${socialsOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-2 pointer-events-none"} group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto`;

	const dropdownAnchorClass = "block w-full px-4 py-2.5 hover:bg-white/5 rounded-xl transition-all group/item";
	const contentWrapperClass = "flex items-center w-full";
	const iconWrapperClass = "flex items-center justify-center shrink-0 mr-3";
	const textWrapperClass = "text-sm font-medium text-zinc-300 group-hover/item:text-white transition-colors";
	const arrowWrapperClass = "ml-auto flex items-center pl-2";

	return (
		<header className="w-full bg-retro-dark">
			<div className="flex items-center justify-between py-12 mx-auto max-w-360">
				<Link href="/" className="flex items-center shrink-0">
					<span className="font-press active:scale-[0.95] text-[22px] leading-none tracking-tight">
						RETRO<span className="text-retro-orange">PUNKS</span>
					</span>
				</Link>

				<nav className="items-center justify-center flex-1 hidden lg:flex ">
					<div>
						<button onClick={() => scroll("about")} className="nav-link">
							ABOUT
						</button>
					</div>

					<div>
						<button onClick={() => scroll("creator")} className="nav-link">
							CREATOR
						</button>
					</div>

					<div ref={rootRef} className="relative group">
						<button type="button" onClick={() => setSocialsOpen((s) => !s)} aria-expanded={socialsOpen} aria-controls="socials-menu" className="flex items-center gap-2 nav-link">
							SOCIALS
							<svg className={`w-3.5 h-3.5 opacity-60 transition-transform duration-300 ${socialsOpen ? "rotate-180" : "group-hover:rotate-180"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
							</svg>
						</button>

						<div className="absolute left-0 z-40 w-full h-4 top-full" />

						<div id="socials-menu" role="menu" aria-hidden={!socialsOpen} className={socialsMenuClass}>
							<div className="bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 p-1.5 rounded-sm shadow-xl min-w-50">
								{SOCIAL_LINKS.map((link) => (
									<a key={link.name} href={link.href} target="_blank" rel="noopener noreferrer" onClick={handleLinkClick} className={dropdownAnchorClass}>
										<div className={contentWrapperClass}>
											{/* Icon Wrapper */}
											<div className={iconWrapperClass}>{link.icon}</div>

											{/* Text Wrapper */}
											<div className={textWrapperClass}>{link.name}</div>

											{/* Arrow Wrapper (Pushed to Right) */}
											<div className={arrowWrapperClass}>{arrow}</div>
										</div>
									</a>
								))}
							</div>
						</div>
					</div>

					<div>
						<button onClick={() => scroll("faq")} className="nav-link">
							FAQs
						</button>
					</div>

					<div>
						<button className="nav-link">
							<Link href="/my-punks">MY PUNKS</Link>
						</button>
					</div>
				</nav>

				<div className="hidden lg:block shrink-0">
					<ConnectButton.Custom>
						{({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
							const ready = mounted;
							const connected = ready && account && chain;

							return (
								<div>
									{(() => {
										if (!connected) {
											return (
												<button className="connect-btn" onClick={openConnectModal} type="button">
													Connect Wallet
												</button>
											);
										}
										if (chain.unsupported) {
											return (
												<button className="connect-btn bg-error!" onClick={openChainModal} type="button">
													Wrong network
												</button>
											);
										}

										return (
											<button className="connect-btn" onClick={openAccountModal} type="button">
												{account.displayName}
											</button>
										);
									})()}
								</div>
							);
						}}
					</ConnectButton.Custom>
				</div>

				<MobileNavbar />
			</div>
		</header>
	);
}
