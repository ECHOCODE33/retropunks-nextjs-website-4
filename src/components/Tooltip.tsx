"use client";

import { useState, useRef, useEffect, useCallback, ReactNode } from "react";

// ============================================================================
// TYPES
// ============================================================================

interface TooltipProps {
	/** Text to display in the tooltip */
	label: string;

	/** Child element that triggers the tooltip on hover */
	children: ReactNode;

	/** Position of tooltip relative to child element */
	side?: "top" | "bottom" | "left" | "right";

	/** Delay in milliseconds before showing tooltip (prevents flicker on quick hovers) */
	delay?: number;

	/** Additional CSS classes for the wrapper div */
	className?: string;
}

// ============================================================================
// TOOLTIP COMPONENT
// ============================================================================

/**
 * Tooltip Component
 *
 * Displays a tooltip on hover with configurable position and delay.
 *
 * Features:
 * - Configurable side positioning (top, bottom, left, right)
 * - Customizable show delay to prevent tooltip flicker
 * - Accessible with proper ARIA attributes
 * - Clean styling with backdrop blur and smooth transitions
 *
 * @example
 * ```tsx
 * <Tooltip label="Download" side="top">
 *   <button>📥</button>
 * </Tooltip>
 * ```
 */
export default function Tooltip({ label, children, side = "top", delay = 400, className = "" }: TooltipProps) {
	// ---------------------------------------------------------------------------
	// STATE
	// ---------------------------------------------------------------------------

	const [visible, setVisible] = useState(false);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// ---------------------------------------------------------------------------
	// EVENT HANDLERS
	// ---------------------------------------------------------------------------

	/**
	 * Shows tooltip after delay period
	 */
	const show = useCallback(() => {
		timeoutRef.current = setTimeout(() => setVisible(true), delay);
	}, [delay]);

	/**
	 * Hides tooltip immediately and cancels any pending show timeout
	 */
	const hide = useCallback(() => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
		setVisible(false);
	}, []);

	// ---------------------------------------------------------------------------
	// EFFECTS
	// ---------------------------------------------------------------------------

	/**
	 * Cleanup timeout on unmount to prevent memory leaks
	 */
	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	// ---------------------------------------------------------------------------
	// COMPUTED VALUES
	// ---------------------------------------------------------------------------

	/**
	 * Position classes for tooltip placement
	 * Uses Tailwind positioning utilities with transforms for centering
	 */
	const positionClasses = {
		top: "bottom-full left-1/2 -translate-x-1/2 -translate-y-2 mb-1",
		bottom: "top-full left-1/2 -translate-x-1/2 translate-y-2 mt-1",
		left: "right-full top-1/2 -translate-y-1/2 -translate-x-2 mr-1",
		right: "left-full top-1/2 -translate-y-1/2 translate-x-2 ml-1",
	};

	// ---------------------------------------------------------------------------
	// RENDER
	// ---------------------------------------------------------------------------

	return (
		<div className={`relative inline-flex ${className}`} onMouseEnter={show} onMouseLeave={hide}>
			{children}

			{visible && (
				<div
					className={`
            absolute z-100 
            px-3 py-1.5 
            text-xs font-medium text-white 
            bg-zinc-800/95 backdrop-blur-sm 
            border border-white/10 
            rounded-lg 
            whitespace-nowrap 
            shadow-xl 
            pointer-events-none 
            ${positionClasses[side]} 
            transition-opacity duration-150
          `}
					role="tooltip">
					{label}
				</div>
			)}
		</div>
	);
}
