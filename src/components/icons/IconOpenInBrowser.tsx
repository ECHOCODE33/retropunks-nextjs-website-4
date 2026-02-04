"use client";

interface IconOpenInBrowserProps {
	className?: string;
	size?: number;
}

export default function IconOpenInBrowser({ className = "", size = 24 }: IconOpenInBrowserProps) {
	return (
		// eslint-disable-next-line @next/next/no-img-element
		<img src="/open-in-browser-icon.svg" alt="Open in browser" width={size} height={size} className={className} />
	);
}
