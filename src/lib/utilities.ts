import { bytesToHex, hexToBytes } from "viem";

// ============================================================================
// TYPE DECLARATIONS (for browser APIs not in default TypeScript)
// ============================================================================

declare const DOMParser: {
	new (): { parseFromString(str: string, type: string): Document };
};

declare const XMLSerializer: {
	new (): { serializeToString(node: Node): string };
};

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Maximum bytes allowed for NFT name (bytes32 in Solidity = 32 bytes)
 */
const RETROPUNKS_NAME_MAX_BYTES = 32;

/**
 * Maximum character length allowed for NFT bio
 */
export const RETROPUNKS_BIO_MAX_LENGTH = 160;

/**
 * Allowed characters in NFT names (matches smart contract validation)
 */
const RETROPUNKS_NAME_ALLOWED = /^[\dA-Za-z\x20!\-._']*$/;

// ============================================================================
// BYTES32 ENCODING/DECODING
// ============================================================================

/**
 * Encodes a string to bytes32 hex format for smart contract storage
 *
 * The smart contract stores names as bytes32 (32 bytes fixed-length).
 * This function converts a UTF-8 string to bytes32 hex format.
 *
 * @param s - String to encode (max 32 bytes UTF-8)
 * @returns Hex string prefixed with "0x" (66 characters total)
 *
 * @example
 * stringToBytes32("RetroPunk") // "0x5265747261756e6b000000000000000000000000000000000000000000000000"
 */
export function stringToBytes32(s: string): `0x${string}` {
	const encoded = new TextEncoder().encode(s);
	const bytes = encoded.slice(0, RETROPUNKS_NAME_MAX_BYTES);
	const padded = new Uint8Array(32);
	padded.set(bytes);
	return bytesToHex(padded) as `0x${string}`;
}

/**
 * Decodes bytes32 hex from smart contract to readable string
 *
 * Converts the bytes32 hex format back to a UTF-8 string,
 * removing null padding bytes.
 *
 * @param hex - Hex string from contract (with or without "0x" prefix)
 * @returns Decoded UTF-8 string
 *
 * @example
 * bytes32ToString("0x5265747261756e6b000000000000000000000000000000000000000000000000")
 * // "RetroPunk"
 */
export function bytes32ToString(hex: string): string {
	if (!hex || typeof hex !== "string") return "";

	const h = hex.startsWith("0x") ? hex : `0x${hex}`;

	try {
		const bytes = hexToBytes(h as `0x${string}`);
		// Find first null byte (end of string)
		const end = bytes.findIndex((b) => b === 0);
		const len = end === -1 ? bytes.length : end;
		return new TextDecoder().decode(bytes.slice(0, len));
	} catch (error) {
		console.error("Error decoding bytes32:", error);
		return "";
	}
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validates NFT name according to smart contract rules
 *
 * Rules:
 * - Maximum 32 bytes (UTF-8 encoded)
 * - Allowed characters: 0-9, A-Z, a-z, space, ! - . _ '
 *
 * @param name - Name to validate
 * @returns Error message if invalid, null if valid
 */
export function validateRetroPunksName(name: string): string | null {
	const byteLength = new TextEncoder().encode(name).length;

	if (byteLength > RETROPUNKS_NAME_MAX_BYTES) {
		return "Name must be 32 bytes or less";
	}

	if (!RETROPUNKS_NAME_ALLOWED.test(name)) {
		return "Name can only use letters, numbers, spaces, and ! - . _ '";
	}

	return null;
}

/**
 * Validates NFT bio according to smart contract rules
 *
 * @param bio - Bio to validate
 * @returns Error message if invalid, null if valid
 */
export function validateRetroPunksBio(bio: string): string | null {
	const len = new TextEncoder().encode(bio).length;

	if (len > RETROPUNKS_BIO_MAX_LENGTH) {
		return `Bio must be ${RETROPUNKS_BIO_MAX_LENGTH} characters or less`;
	}

	return null;
}

// ============================================================================
// NFT TYPE DETECTION
// ============================================================================

/**
 * Detects if an NFT is a "Special" edition
 *
 * Special NFTs have a built-in background and cannot cycle backgrounds.
 * Detection is based on metadata attributes.
 *
 * @param metadata - NFT metadata object
 * @returns True if NFT is Special edition
 */
export function isSpecialNft(
	metadata: {
		attributes?: Array<{ trait_type: string; value: string | number }>;
	} | null,
): boolean {
	if (!metadata?.attributes) return false;

	return metadata.attributes.some(
		(attr) =>
			(attr.trait_type.toLowerCase() === "type" && String(attr.value).toLowerCase() === "special") ||
			(attr.trait_type.toLowerCase() === "special" && String(attr.value).toLowerCase() === "yes"),
	);
}

// ============================================================================
// TOKEN URI PARSING
// ============================================================================

/**
 * Parses a base64-encoded token URI into usable metadata and SVG content
 *
 * Token URI format: "data:application/json;base64,{base64JSON}"
 * JSON contains metadata and a base64-encoded SVG image
 *
 * @param tokenUri - Full token URI from smart contract
 * @returns Parsed data including metadata, SVG content, and image data
 */
export const parseTokenURI = (tokenUri: string) => {
	try {
		// Extract and decode base64 JSON
		const jsonPart = tokenUri.split("data:application/json;base64,")[1];
		if (!jsonPart) {
			throw new Error("Invalid token URI format");
		}

		const metadata = JSON.parse(atob(jsonPart));
		const fullImage = metadata?.image;

		if (!fullImage || typeof fullImage !== "string") {
			throw new Error("No image in metadata");
		}

		// Check if image is SVG or other format (e.g., PNG for Special NFTs)
		const base64Svg = fullImage.split("data:image/svg+xml;base64,")[1];

		if (!base64Svg) {
			// Non-SVG image (Special NFT with built-in background)
			return {
				metadata,
				innerCharacterContent: "",
				viewBox: "0 0 48 48",
				imageDataUrl: fullImage,
				isSpecial: true,
			};
		}

		// Parse SVG to extract character content
		const fullSvgString = atob(base64Svg);
		const parser = new DOMParser();
		const doc = parser.parseFromString(fullSvgString, "image/svg+xml");
		const svg = doc.documentElement;

		if (!svg) {
			throw new Error("Invalid SVG");
		}

		const viewBox = svg.getAttribute("viewBox") || "0 0 48 48";

		// Extract inner character content (without background)
		const fgGroup = svg.querySelector('g[id="GeneratedImage"]');
		const innerCharacterContent = fgGroup ? fgGroup.innerHTML : svg.innerHTML;

		return {
			metadata,
			fullSvgString,
			innerCharacterContent,
			viewBox,
			imageDataUrl: null,
			isSpecial: false,
		};
	} catch (error) {
		console.error("Error parsing Token URI:", error);
		return {
			metadata: null,
			innerCharacterContent: "",
			viewBox: "0 0 48 48",
			imageDataUrl: null,
			isSpecial: false,
		};
	}
};

// ============================================================================
// DATE FORMATTING
// ============================================================================

/**
 * Formats a birthday/timestamp as DD/MM/YYYY
 *
 * Handles various input formats:
 * - Unix timestamps (seconds)
 * - Millisecond timestamps
 * - Date strings
 *
 * @param value - Timestamp or date string
 * @returns Formatted date string (DD/MM/YYYY) or original value if invalid
 */
export function formatBirthday(value: string | number): string {
	if (value == null) return "—";

	const str = String(value).trim();
	const num = parseInt(str, 10);
	let date: Date;

	if (!Number.isNaN(num)) {
		// Unix timestamp (seconds) vs milliseconds
		date = num < 1e10 ? new Date(num * 1000) : new Date(num);
	} else {
		// Parse as date string
		date = new Date(str);
	}

	// Return original value if parsing failed
	if (Number.isNaN(date.getTime())) return str;

	const day = date.getDate().toString().padStart(2, "0");
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	const year = date.getFullYear();

	return `${day}/${month}/${year}`;
}

// ============================================================================
// IMAGE EXPORT UTILITIES
// ============================================================================

/**
 * Snaps resolution to nearest multiple of 48 for crisp pixel scaling
 *
 * Base NFT size is 48x48 pixels. For crisp pixel art, we need integer
 * multiples: 480 (10x), 960 (20x), 1920 (40x), etc.
 *
 * @param resolution - Desired resolution
 * @returns Nearest valid resolution (multiple of 48)
 */
export function snapResolutionTo48(resolution: number): number {
	const base = 48;
	const scale = Math.round(resolution / base);
	const clamped = Math.max(1, Math.min(scale, 64)); // Max 64x scale
	return base * clamped;
}

/**
 * Prepares SVG for crisp pixel-art export
 *
 * - Ensures resolution is multiple of 48
 * - Adds pixel-rendering CSS hints
 * - Optionally removes background for transparency
 *
 * @param svgString - Original SVG string
 * @param resolution - Target resolution
 * @param transparent - Whether to remove background
 * @returns Modified SVG string optimized for export
 */
function prepareSvgForExport(svgString: string, resolution: number, transparent: boolean): string {
	const parser = new DOMParser();
	const doc = parser.parseFromString(svgString, "image/svg+xml");
	const svg = doc.documentElement;

	if (!svg) return svgString;

	// Use integer multiple of 48 for perfect pixel scaling
	const res = snapResolutionTo48(resolution);

	// Remove background if transparent export requested
	if (transparent) {
		const bgGroup = doc.getElementById("Background");
		if (bgGroup) bgGroup.innerHTML = "";
	}

	// Set dimensions and rendering hints
	svg.setAttribute("width", String(res));
	svg.setAttribute("height", String(res));
	svg.setAttribute("shape-rendering", "crispEdges");
	svg.setAttribute("style", "image-rendering: pixelated; image-rendering: crisp-edges; image-rendering: -moz-crisp-edges; image-rendering: -webkit-crisp-edges;");

	// Add pixelated rendering to all image elements
	const images = doc.querySelectorAll("image");
	images.forEach((img) => {
		const existingStyle = img.getAttribute("style") || "";
		img.setAttribute("style", `${existingStyle}image-rendering: pixelated; image-rendering: crisp-edges;`);
	});

	return new XMLSerializer().serializeToString(svg);
}

/**
 * Downloads NFT as PNG file with pixel-perfect scaling
 *
 * Process:
 * 1. Prepare SVG with correct resolution and rendering hints
 * 2. Convert SVG to base64 data URL
 * 3. Load into Image element
 * 4. Draw to Canvas with pixel-perfect settings
 * 5. Export as PNG blob
 * 6. Trigger download
 *
 * @param svgString - SVG content to export
 * @param resolution - Target resolution (will be snapped to multiple of 48)
 * @param fileName - Output filename (without extension)
 * @param transparent - Whether to export with transparent background
 */
export const downloadPunkAsPng = async (svgString: string, resolution: number, fileName: string, transparent: boolean = false): Promise<void> => {
	const res = snapResolutionTo48(resolution);
	const finalSvg = prepareSvgForExport(svgString, res, transparent);
	const svg64 = btoa(unescape(encodeURIComponent(finalSvg)));
	const b64Start = `data:image/svg+xml;base64,${svg64}`;

	return new Promise<void>((resolve, reject) => {
		const img = new Image();
		img.src = b64Start;

		img.onload = () => {
			const canvas = document.createElement("canvas");
			canvas.width = res;
			canvas.height = res;
			const ctx = canvas.getContext("2d");

			if (!ctx) {
				reject(new Error("Canvas context failed"));
				return;
			}

			// Disable image smoothing for crisp pixels
			ctx.imageSmoothingEnabled = false;
			(
				ctx as CanvasRenderingContext2D & {
					imageSmoothingQuality?: string;
				}
			).imageSmoothingQuality = "low";

			ctx.drawImage(img, 0, 0, res, res);

			canvas.toBlob(
				(blob) => {
					if (blob) {
						const url = URL.createObjectURL(blob);
						const link = document.createElement("a");
						link.href = url;
						link.download = `${fileName}.png`;
						link.click();
						URL.revokeObjectURL(url);
						resolve();
					} else {
						reject(new Error("Blob creation failed"));
					}
				},
				"image/png",
				1,
			);
		};

		img.onerror = () => reject(new Error("Image load failed"));
	});
};

/**
 * Converts SVG to PNG data URL (for opening in browser)
 *
 * Similar to downloadPunkAsPng but returns data URL instead of downloading
 *
 * @param svgString - SVG content to convert
 * @param resolution - Target resolution
 * @param transparent - Whether to use transparent background
 * @returns Promise resolving to PNG data URL
 */
export const svgToPngDataUrl = async (svgString: string, resolution: number, transparent: boolean = false): Promise<string> => {
	const finalSvg = prepareSvgForExport(svgString, resolution, transparent);
	const svg64 = btoa(unescape(encodeURIComponent(finalSvg)));
	const b64Start = `data:image/svg+xml;base64,${svg64}`;

	return new Promise((resolve, reject) => {
		const img = new Image();
		img.src = b64Start;

		img.onload = () => {
			const canvas = document.createElement("canvas");
			canvas.width = resolution;
			canvas.height = resolution;
			const ctx = canvas.getContext("2d");

			if (!ctx) {
				reject(new Error("Canvas context failed"));
				return;
			}

			// Disable image smoothing for crisp pixels
			ctx.imageSmoothingEnabled = false;
			(
				ctx as CanvasRenderingContext2D & {
					imageSmoothingQuality?: string;
				}
			).imageSmoothingQuality = "low";

			ctx.drawImage(img, 0, 0, resolution, resolution);
			resolve(canvas.toDataURL("image/png"));
		};

		img.onerror = () => reject(new Error("Image load failed"));
	});
};
