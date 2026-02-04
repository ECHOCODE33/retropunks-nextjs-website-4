"use client";

interface IconArrowForwardProps {
	className?: string;
	size?: number;
}

export default function IconArrowForward({ className = "", size = 24 }: IconArrowForwardProps) {
	return (
		// eslint-disable-next-line @next/next/no-img-element
		<img src="/arrow-forward-icon.svg" alt="Next background" width={size} height={size} className={className} />
	);
}
