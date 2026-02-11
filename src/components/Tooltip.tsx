"use client";

import { useState, useRef, useEffect, ReactNode } from "react";

interface TooltipProps {
  label: string;
  children: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  delay?: number;
  className?: string;
}

export default function Tooltip({
  label,
  children,
  side = "top",
  delay = 400,
  className = "",
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    timeoutRef.current = setTimeout(() => setVisible(true), delay);
  };

  const hide = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setVisible(false);
  };

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 -translate-y-2 mb-1",
    bottom: "top-full left-1/2 -translate-x-1/2 translate-y-2 mt-1",
    left: "right-full top-1/2 -translate-y-1/2 -translate-x-2 mr-1",
    right: "left-full top-1/2 -translate-y-1/2 translate-x-2 ml-1",
  };

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      {children}
      {visible && (
        <div
          className={`absolute z-100 px-3 py-1.5 text-xs font-medium text-white bg-zinc-800/95 backdrop-blur-sm border border-white/10 rounded-lg whitespace-nowrap shadow-xl pointer-events-none ${positionClasses[side]} transition-opacity duration-150`}
          role="tooltip"
        >
          {label}
        </div>
      )}
    </div>
  );
}
