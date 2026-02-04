"use client";

interface IconInfoProps {
	className?: string;
	size?: number;
}

export default function IconInfo({ className = "", size = 24 }: IconInfoProps) {
	return (
		// eslint-disable-next-line @next/next/no-img-element
		<img src="/info-icon.svg" alt="View details" width={size} height={size} className={className} />
	);
}
