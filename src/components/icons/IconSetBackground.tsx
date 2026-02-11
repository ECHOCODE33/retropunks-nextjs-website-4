"use client";

interface IconSetBackgroundProps {
  className?: string;
  size?: number;
}

export default function IconSetBackground({
  className = "",
  size = 24,
}: IconSetBackgroundProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/image-icon.svg"
      alt="Set background"
      width={size}
      height={size}
      className={className}
    />
  );
}
