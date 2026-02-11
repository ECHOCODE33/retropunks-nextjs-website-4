"use client";

interface IconFullscreenProps {
  className?: string;
  size?: number;
}

export default function IconFullscreen({
  className = "",
  size = 24,
}: IconFullscreenProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/fullscreen-icon.svg"
      alt="Fullscreen"
      width={size}
      height={size}
      className={className}
    />
  );
}
