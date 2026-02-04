"use client";

interface IconArrowBackProps {
	className?: string;
	size?: number;
}

export default function IconArrowBack({ className = "", size = 24 }: IconArrowBackProps) {
	return (
		// eslint-disable-next-line @next/next/no-img-element
		<img src="/arrow-back-icon.svg" alt="Previous background" width={size} height={size} className={className} />
	);
}
