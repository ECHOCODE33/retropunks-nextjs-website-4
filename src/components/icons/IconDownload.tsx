"use client";

interface IconDownloadProps {
	className?: string;
	size?: number;
}

export default function IconDownload({ className = "", size = 24 }: IconDownloadProps) {
	return (
		// eslint-disable-next-line @next/next/no-img-element
		<img src="/download-icon.svg" alt="Download" width={size} height={size} className={className} />
	);
}
