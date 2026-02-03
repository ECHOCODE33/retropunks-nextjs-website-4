"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState, useEffect } from "react";

export default function MobileNavbar() {
	const [isOpen, setIsOpen] = useState(false);

	const toggleMenu = () => setIsOpen(!isOpen);

	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth >= 1024) {
				setIsOpen(false);
			}
		};

		window.addEventListener("resize", handleResize);

		// Cleanup listener on unmount
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const mobileScroll = (id?: string) => {
		setIsOpen(false);
		if (id) {
			const element = document.getElementById(id);
			if (element) {
				element.scrollIntoView({ behavior: "smooth" });
			}
		}
	};

	return (
		<div className="lg:hidden">
			<button onClick={toggleMenu} className="relative z-100 p-2 focus:outline-none">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="32"
					height="32"
					viewBox="0 0 24 24"
					fill="none"
					stroke="var(--color-retro-orange)"
					strokeWidth="2.5"
					strokeLinecap="round"
					strokeLinejoin="round"
					className={`transition-transform duration-300 ${isOpen ? "rotate-90" : ""}`}>
					{isOpen ? (
						<>
							<line x1="18" y1="6" x2="6" y2="18" />
							<line x1="6" y1="6" x2="18" y2="18" />
						</>
					) : (
						<>
							<path d="M4 6h16" />
							<path d="M4 12h16" />
							<path d="M4 18h16" />
						</>
					)}
				</svg>
			</button>

			<div>
				<div className={`fixed inset-0 z-90 flex flex-col items-center justify-center bg-retro-dark/95 backdrop-blur-md transition-all duration-300 ease-in-out ${isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}`}>
					<nav className="flex flex-col items-center gap-10">
						<button onClick={() => mobileScroll("about")} className="mobile-nav-link">
							ABOUT
						</button>

						<button onClick={() => mobileScroll("creator")} className="mobile-nav-link">
							CREATOR
						</button>

						<button onClick={() => {}} className="mobile-nav-link">
							SOCIALS
						</button>

						<button onClick={() => mobileScroll("faq")} className="mobile-nav-link">
							FAQs
						</button>

						<Link href="/my-punks" onClick={() => setIsOpen(false)} className="mobile-nav-link">
							MY PUNKS
						</Link>

						<div className="mt-4">
							<ConnectButton.Custom>
								{({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
									const ready = mounted;
									const connected = ready && account && chain;

									return (
										<div
											{...(!ready && {
												"aria-hidden": true,
												style: {
													opacity: 0,
													pointerEvents: "none",
													userSelect: "none",
												},
											})}>
											{(() => {
												if (!connected) {
													return (
														<button onClick={openConnectModal} type="button" className="connect-btn">
															Connect Wallet
														</button>
													);
												}
												if (chain.unsupported) {
													return (
														<button onClick={openChainModal} type="button" className="connect-btn bg-error!">
															Wrong Network
														</button>
													);
												}
												return (
													<button onClick={openAccountModal} type="button" className="connect-btn">
														{account.displayName}
													</button>
												);
											})()}
										</div>
									);
								}}
							</ConnectButton.Custom>
						</div>
					</nav>
				</div>
			</div>
		</div>
	);
}
