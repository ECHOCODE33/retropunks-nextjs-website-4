"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { toast } from "sonner";
import { RETROPUNKS_CONTRACT, RETROPUNKS_ABI } from "@/lib/contracts";
import { parseTokenURI, formatBirthday, downloadPunkAsPng, isSpecialNft, stringToBytes32, validateRetroPunksName, validateRetroPunksBio } from "@/lib/utilities";
import { buildIframeSrcdoc, IFRAME_BACKGROUND_COUNT } from "@/lib/iframeGenerator";
import Tooltip from "./Tooltip";
import { IconArrowBack, IconArrowForward, IconInfo, IconDownload, IconSetBackground, IconFullscreen } from "@/components/icons";

// ============================================================================
// TYPES
// ============================================================================

interface PunkCardProps {
	tokenId: string;
	tokenUri: string;
	currentBg: number;
	name: string;
	bio: string;
	onMetadataUpdate?: (tokenId: string, updates: { name?: string; bio?: string; currentBg?: number }) => void;
}

interface Attribute {
	trait_type: string;
	value: string | number;
}

interface Metadata {
	name?: string;
	description?: string;
	attributes?: Attribute[];
}

type UpdateType = "background" | "name" | "bio" | null;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Formats attribute values for display, with special handling for dates
 */
function formatAttributeValue(attr: Attribute): string {
	if (attr.trait_type.toLowerCase() === "birthday") {
		return formatBirthday(attr.value);
	}
	return String(attr.value);
}

/**
 * Common button styling for icon buttons
 */
const ICON_BUTTON_CLASS =
	"p-2 min-w-[44px] min-h-11 text-retro-orange hover:bg-retro-orange/10 active:bg-retro-orange/20 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center touch-manipulation";

const ICON_SIZE = 22;

// ============================================================================
// PUNK CARD COMPONENT
// ============================================================================

export default function PunkCard({ tokenId, tokenUri, currentBg, name, bio, onMetadataUpdate }: PunkCardProps) {
	// ---------------------------------------------------------------------------
	// STATE - NFT Data
	// ---------------------------------------------------------------------------
	const [metadata, setMetadata] = useState<Metadata | null>(null);
	const [innerCharacterContent, setInnerCharacterContent] = useState("");
	const [metadataSvgString, setMetadataSvgString] = useState("");
	const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
	const [isSpecial, setIsSpecial] = useState(false);
	const [srcdoc, setSrcdoc] = useState("");
	const [bgIndex, setBgIndex] = useState(currentBg);

	// ---------------------------------------------------------------------------
	// STATE - UI Modals
	// ---------------------------------------------------------------------------
	const [isDetailsOpen, setIsDetailsOpen] = useState(false);
	const [isDownloadOpen, setIsDownloadOpen] = useState(false);
	const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);

	// ---------------------------------------------------------------------------
	// STATE - Download Options
	// ---------------------------------------------------------------------------
	const [resolution, setResolution] = useState(960);
	const [transparent, setTransparent] = useState(false);

	// ---------------------------------------------------------------------------
	// STATE - Editable Fields
	// ---------------------------------------------------------------------------
	const [editName, setEditName] = useState("");
	const [editBio, setEditBio] = useState("");

	// ---------------------------------------------------------------------------
	// STATE - Transaction Tracking
	// ---------------------------------------------------------------------------
	const [lastUpdateType, setLastUpdateType] = useState<UpdateType>(null);

	// ---------------------------------------------------------------------------
	// REFS
	// ---------------------------------------------------------------------------
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const svgResolveRef = useRef<((svg: string) => void) | null>(null);
	const submittedNameRef = useRef("");
	const submittedBioRef = useRef("");

	// ---------------------------------------------------------------------------
	// WAGMI HOOKS - Contract Interaction
	// ---------------------------------------------------------------------------
	const { writeContract, data: txHash } = useWriteContract();
	const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
		hash: txHash,
	});

	// ---------------------------------------------------------------------------
	// COMPUTED VALUES
	// ---------------------------------------------------------------------------
	const isAnyModalOpen = isDetailsOpen || isDownloadOpen || isFullscreenOpen;
	const displayName = name?.trim() || `RetroPunk #${tokenId}`;
	const modalSrcdoc = !isSpecial && innerCharacterContent ? buildIframeSrcdoc(innerCharacterContent, bgIndex, tokenId) : srcdoc;

	// ============================================================================
	// EFFECTS
	// ============================================================================

	/**
	 * Handle successful transaction confirmations
	 */
	useEffect(() => {
		if (!isSuccess || !txHash || !lastUpdateType) return;

		// Show success notification and call parent update handler
		if (lastUpdateType === "background") {
			toast.success("Background set on-chain");
			onMetadataUpdate?.(tokenId, { currentBg: bgIndex });
		} else if (lastUpdateType === "name") {
			toast.success("Name updated");
			onMetadataUpdate?.(tokenId, { name: submittedNameRef.current });
		} else if (lastUpdateType === "bio") {
			toast.success("Bio updated");
			onMetadataUpdate?.(tokenId, { bio: submittedBioRef.current });
		}

		setLastUpdateType(null);
	}, [isSuccess, txHash, lastUpdateType, tokenId, onMetadataUpdate, bgIndex]);

	/**
	 * Prevent body scroll and handle escape key when modals are open
	 */
	useEffect(() => {
		if (!isAnyModalOpen) return;

		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				setIsDetailsOpen(false);
				setIsDownloadOpen(false);
				setIsFullscreenOpen(false);
			}
		};

		document.addEventListener("keydown", handleEscape);

		return () => {
			document.body.style.overflow = prevOverflow;
			document.removeEventListener("keydown", handleEscape);
		};
	}, [isAnyModalOpen]);

	/**
	 * Parse token URI and initialize NFT display
	 */
	useEffect(() => {
		if (!tokenUri) return;

		try {
			const parsed = parseTokenURI(tokenUri);
			const specialByAttr = isSpecialNft(parsed.metadata);
			const specialByFormat = parsed.isSpecial || !!parsed.imageDataUrl;
			const special = specialByAttr || specialByFormat;

			setMetadata(parsed.metadata);
			setInnerCharacterContent(parsed.innerCharacterContent);
			setMetadataSvgString("fullSvgString" in parsed && parsed.fullSvgString ? parsed.fullSvgString : "");
			setImageDataUrl(parsed.imageDataUrl ?? null);
			setIsSpecial(special);
			setBgIndex(currentBg);

			// Generate iframe srcdoc for standard NFTs
			if (!special) {
				setSrcdoc(buildIframeSrcdoc(parsed.innerCharacterContent, currentBg, tokenId));
			} else {
				setSrcdoc("");
			}
		} catch (error) {
			console.error("Error parsing token URI:", error);
			// Reset to default state on error
			setMetadata(null);
			setInnerCharacterContent("");
			setMetadataSvgString("");
			setImageDataUrl(null);
			setIsSpecial(false);
			setSrcdoc(buildIframeSrcdoc("", 0, tokenId));
			setBgIndex(0);
		}
	}, [tokenUri, currentBg, tokenId]);

	/**
	 * Initialize edit fields when details modal opens
	 */
	useEffect(() => {
		if (isDetailsOpen) {
			setEditName(name?.trim() ?? "");
			setEditBio(bio?.trim() ?? "");
		}
	}, [isDetailsOpen, name, bio]);

	/**
	 * Listen for messages from iframe (background changes, SVG requests)
	 */
	useEffect(() => {
		const handleMessage = (e: MessageEvent) => {
			const data = e.data;
			if (!data || typeof data !== "object") return;

			// Update background index when iframe signals a change
			if (data.type === "backgroundChange" && data.cardId === tokenId && typeof data.index === "number") {
				setBgIndex(data.index);
			}

			// Resolve SVG promise when iframe sends the SVG string
			if (data.type === "svgResult" && data.svg != null) {
				svgResolveRef.current?.(data.svg);
				svgResolveRef.current = null;
			}
		};

		window.addEventListener("message", handleMessage);
		return () => window.removeEventListener("message", handleMessage);
	}, [tokenId]);

	// ============================================================================
	// EVENT HANDLERS
	// ============================================================================

	/**
	 * Sends a message to the iframe
	 */
	const sendToIframe = useCallback((msg: Record<string, unknown>) => {
		iframeRef.current?.contentWindow?.postMessage(msg, "*");
	}, []);

	/**
	 * Navigate to previous background
	 */
	const handleCyclePrev = useCallback(() => {
		sendToIframe({ type: "cyclePrev" });
	}, [sendToIframe]);

	/**
	 * Navigate to next background
	 */
	const handleCycleNext = useCallback(() => {
		sendToIframe({ type: "cycleNext" });
	}, [sendToIframe]);

	/**
	 * Request current SVG from iframe
	 */
	const requestSvgFromIframe = useCallback((): Promise<string> => {
		return new Promise((resolve) => {
			svgResolveRef.current = resolve;
			sendToIframe({
				type: "getSvg",
				requestId: crypto.randomUUID?.() ?? `${Date.now()}`,
			});

			// Timeout to prevent hanging
			setTimeout(() => {
				if (svgResolveRef.current) {
					svgResolveRef.current("");
					svgResolveRef.current = null;
				}
			}, 3000);
		});
	}, [sendToIframe]);

	/**
	 * Download NFT image as PNG
	 */
	const handleDownload = useCallback(async () => {
		try {
			// Special handling for non-SVG special NFTs
			if (isSpecial && imageDataUrl) {
				const link = document.createElement("a");
				link.href = imageDataUrl;
				link.download = `retropunk-${tokenId}-special.png`;
				link.click();
				toast.success("Download started");
				setIsDownloadOpen(false);
				return;
			}

			// Use SVG from metadata for standard NFTs
			const svgString = metadataSvgString;
			if (!svgString) {
				toast.error("Could not get image from metadata");
				return;
			}

			const filename = `retropunk-${tokenId}-bg${currentBg}${transparent ? "-transparent" : ""}`;
			await downloadPunkAsPng(svgString, resolution, filename, transparent);
			toast.success("Download started");
			setIsDownloadOpen(false);
		} catch (error) {
			console.error("Download error:", error);
			toast.error("Download failed");
		}
	}, [isSpecial, imageDataUrl, metadataSvgString, tokenId, currentBg, transparent, resolution]);

	/**
	 * Save token metadata to blockchain
	 */
	const saveTokenMetadata = useCallback(
		(nameStr: string, bioStr: string, backgroundIndex: number) => {
			// Validate inputs
			const nameError = validateRetroPunksName(nameStr);
			if (nameError) {
				toast.error(nameError);
				return;
			}

			const bioError = validateRetroPunksBio(bioStr);
			if (bioError) {
				toast.error(bioError);
				return;
			}

			// Call smart contract
			writeContract({
				address: RETROPUNKS_CONTRACT,
				abi: RETROPUNKS_ABI,
				functionName: "setTokenMetadata",
				args: [BigInt(tokenId), stringToBytes32(nameStr), bioStr, backgroundIndex],
			});
		},
		[tokenId, writeContract],
	);

	/**
	 * Set current background on-chain
	 */
	const handleSetBackground = useCallback(() => {
		setLastUpdateType("background");
		saveTokenMetadata(name, bio, bgIndex);
	}, [name, bio, bgIndex, saveTokenMetadata]);

	/**
	 * Update name on-chain
	 */
	const handleUpdateName = useCallback(() => {
		submittedNameRef.current = editName;
		setLastUpdateType("name");
		saveTokenMetadata(editName, bio, currentBg);
	}, [editName, bio, currentBg, saveTokenMetadata]);

	/**
	 * Update bio on-chain
	 */
	const handleUpdateBio = useCallback(() => {
		submittedBioRef.current = editBio;
		setLastUpdateType("bio");
		saveTokenMetadata(name, editBio, currentBg);
	}, [name, editBio, currentBg, saveTokenMetadata]);

	// ============================================================================
	// RENDER - Loading State
	// ============================================================================

	if (!srcdoc && !imageDataUrl) {
		return (
			<div className="border-2 border-retro-orange bg-retro-card overflow-hidden w-full max-w-75 mx-auto aspect-3/4 flex items-center justify-center animate-fade-in">
				<span className="text-retro-orange/60 text-sm">Loading...</span>
			</div>
		);
	}

	// ============================================================================
	// RENDER - Main Card
	// ============================================================================

	return (
		<>
			{/* NFT Card */}
			<div className="group/card relative border-2 border-retro-orange bg-retro-card overflow-hidden w-full max-w-75 mx-auto flex flex-col animate-fade-in min-w-0">
				{/* NFT Image/Iframe Display */}
				<div className="aspect-square w-full bg-retro-muted overflow-hidden">
					{isSpecial && imageDataUrl ? (
						// Special NFTs: Display as image
						<img src={imageDataUrl} alt={displayName} className="w-full h-full object-contain" style={{ imageRendering: "pixelated" }} />
					) : (
						// Standard NFTs: Display in iframe with background cycling
						<iframe
							ref={iframeRef}
							srcDoc={srcdoc}
							title={`RetroPunk ${tokenId}`}
							sandbox="allow-scripts"
							className="w-full h-full border-0 block"
							style={{ imageRendering: "pixelated" }}
						/>
					)}
				</div>

				{/* Card Footer - Name & Controls */}
				<div className="p-3 flex flex-col gap-1 bg-retro-card">
					{/* NFT Name */}
					<h3 className="text-white font-bold text-center truncate" title={displayName}>
						{displayName}
					</h3>

					{/* Special NFT Badge */}
					{isSpecial && <p className="text-retro-orange/80 text-xs text-center">Special · No background</p>}

					{/* Background Cycle Controls (Standard NFTs only) */}
					{!isSpecial && (
						<div className="flex items-center justify-center gap-2">
							<button type="button" onClick={handleCyclePrev} className={ICON_BUTTON_CLASS} aria-label="Previous background">
								<IconArrowBack size={ICON_SIZE} />
							</button>

							<span className="text-retro-orange font-mono text-sm min-w-14 text-center">
								{bgIndex + 1}/{IFRAME_BACKGROUND_COUNT}
							</span>

							<button type="button" onClick={handleCycleNext} className={ICON_BUTTON_CLASS} aria-label="Next background">
								<IconArrowForward size={ICON_SIZE} />
							</button>
						</div>
					)}

					{/* Action Buttons */}
					<div className="flex justify-center gap-1">
						{/* Info Button */}
						<Tooltip label="Info" side="top">
							<button type="button" onClick={() => setIsDetailsOpen(true)} className={ICON_BUTTON_CLASS} aria-label="Info">
								<IconInfo size={ICON_SIZE} />
							</button>
						</Tooltip>

						{/* Download Button */}
						<Tooltip label="Download Image" side="top">
							<button type="button" onClick={() => setIsDownloadOpen(true)} className={ICON_BUTTON_CLASS} aria-label="Download">
								<IconDownload size={ICON_SIZE} />
							</button>
						</Tooltip>

						{/* Set Background Button (Standard NFTs only) */}
						{!isSpecial && (
							<Tooltip label="Set Background" side="top">
								<button type="button" onClick={handleSetBackground} disabled={isConfirming} className={ICON_BUTTON_CLASS} aria-label="Set background on-chain">
									<IconSetBackground size={ICON_SIZE} />
								</button>
							</Tooltip>
						)}

						{/* Fullscreen Button */}
						<Tooltip label="Fullscreen" side="top">
							<button type="button" onClick={() => setIsFullscreenOpen(true)} className={ICON_BUTTON_CLASS} aria-label="Fullscreen">
								<IconFullscreen size={ICON_SIZE} />
							</button>
						</Tooltip>
					</div>
				</div>
			</div>

			{/* Modals */}
			{renderDetailsModal()}
			{renderDownloadModal()}
			{renderFullscreenModal()}
		</>
	);

	// ============================================================================
	// MODAL RENDERERS
	// ============================================================================

	/**
	 * Details Modal - View and edit NFT metadata
	 */
	function renderDetailsModal() {
		if (!isDetailsOpen) return null;

		return createPortal(
			<div
				className="fixed inset-0 z-100 flex flex-col p-2 sm:p-4 bg-retro-dark/90 overflow-hidden touch-pan-y"
				onClick={() => setIsDetailsOpen(false)}
				role="dialog"
				aria-modal="true"
				aria-labelledby={`details-title-${tokenId}`}>
				<div
					className="bg-retro-card border-2 border-retro-orange w-full max-w-3xl mx-auto flex-1 min-h-0 flex flex-col overflow-hidden my-auto max-h-[95vh] sm:max-h-[90vh]"
					onClick={(e) => e.stopPropagation()}>
					{/* Modal Header */}
					<div className="flex justify-between items-center px-3 sm:px-4 py-2 sm:py-3 border-b border-retro-orange/30 shrink-0">
						<h2 id={`details-title-${tokenId}`} className="text-base sm:text-lg font-bold text-retro-orange font-mono">
							ID: {tokenId}
						</h2>
						<button
							type="button"
							onClick={() => setIsDetailsOpen(false)}
							className="p-2 -mr-2 min-w-11 min-h-11 flex items-center justify-center text-retro-orange hover:bg-retro-orange/10 active:bg-retro-orange/20 transition-colors touch-manipulation"
							aria-label="Close">
							<svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>

					{/* Scrollable Content */}
					<div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain">
						{/* Image Preview */}
						<div className="flex items-center justify-center bg-retro-muted p-3 sm:p-4 shrink-0">
							<div className="w-full aspect-square mx-auto sm:max-w-125">
								{isSpecial && imageDataUrl ? (
									<img src={imageDataUrl} alt={displayName} className="w-full h-full object-contain" style={{ imageRendering: "pixelated" }} />
								) : (
									<iframe
										srcDoc={modalSrcdoc}
										title={`RetroPunk ${tokenId}`}
										className="w-full h-full min-w-0 min-h-0 border-0 block"
										style={{ imageRendering: "pixelated" }}
										sandbox="allow-scripts"
									/>
								)}
							</div>
						</div>

						{/* Metadata Editor */}
						<div className="p-3 sm:p-4 space-y-8 min-w-0">
							{/* Name Editor */}
							<div className="min-w-0">
								<label htmlFor={`details-name-${tokenId}`} className="block text-retro-orange text-xs font-bold uppercase tracking-wider mb-1.5">
									Name
								</label>
								<input
									id={`details-name-${tokenId}`}
									type="text"
									value={editName}
									onChange={(e) => setEditName(e.target.value)}
									placeholder="NFT name"
									className="w-full bg-retro-muted border border-retro-orange/50 px-3 sm:px-4 py-2 text-white placeholder:text-gray-500 focus:border-retro-orange outline-none text-base h-9"
								/>
								<button
									type="button"
									onClick={handleUpdateName}
									disabled={isConfirming}
									className="mt-2 px-4 py-2 h-9 bg-retro-orange text-white font-semibold hover:brightness-110 active:brightness-95 transition-colors disabled:opacity-50 touch-manipulation text-sm">
									Update
								</button>
							</div>

							{/* Bio Editor */}
							<div className="min-w-0">
								<label htmlFor={`details-bio-${tokenId}`} className="block text-retro-orange text-xs font-bold uppercase tracking-wider mb-1.5">
									Bio
								</label>
								<textarea
									id={`details-bio-${tokenId}`}
									value={editBio}
									onChange={(e) => setEditBio(e.target.value)}
									placeholder="Bio / description"
									rows={4}
									className="w-full bg-retro-muted border border-retro-orange/50 px-3 sm:px-4 py-2 text-white placeholder:text-gray-500 focus:border-retro-orange outline-none resize-none text-base min-h-22"
								/>
								<button
									type="button"
									onClick={handleUpdateBio}
									disabled={isConfirming}
									className="mt-2 px-4 py-2 h-9 bg-retro-orange text-white font-semibold hover:brightness-110 active:brightness-95 transition-colors disabled:opacity-50 touch-manipulation text-sm">
									Update
								</button>
							</div>

							{/* Attributes Display */}
							{metadata?.attributes && metadata.attributes.length > 0 && (
								<div className="min-w-0">
									<h3 className="text-retro-orange text-xs font-bold uppercase tracking-wider mb-2">Attributes</h3>
									<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
										{metadata.attributes.map((attr) => (
											<div key={attr.trait_type} className="bg-retro-muted border border-retro-orange/30 px-4 py-3 min-w-0">
												<span className="text-retro-orange/90 text-xs font-semibold uppercase block mb-2 truncate">{attr.trait_type}</span>
												<span className="text-white text-sm truncate block">{formatAttributeValue(attr)}</span>
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>,
			document.body,
		);
	}

	/**
	 * Download Modal - Configure and download PNG
	 */
	function renderDownloadModal() {
		if (!isDownloadOpen) return null;

		return createPortal(
			<div
				className="fixed inset-0 z-100 flex items-center justify-center p-2 sm:p-4 bg-retro-dark/90 overflow-y-auto touch-pan-y"
				onClick={() => setIsDownloadOpen(false)}
				role="dialog"
				aria-modal="true"
				aria-labelledby={`download-title-${tokenId}`}>
				<div
					className="bg-retro-card border-2 border-retro-orange p-4 sm:p-6 w-full max-w-xl sm:max-w-2xl max-h-[95vh] overflow-y-auto overscroll-contain"
					onClick={(e) => e.stopPropagation()}>
					{/* Modal Header */}
					<div className="flex justify-between items-center mb-4">
						<h2 id={`download-title-${tokenId}`} className="text-lg sm:text-xl font-bold text-retro-orange">
							Download Image
						</h2>
						<button
							type="button"
							onClick={() => setIsDownloadOpen(false)}
							className="p-2 -mr-2 min-w-11 min-h-11 flex items-center justify-center text-retro-orange hover:bg-retro-orange/10 active:bg-retro-orange/20 transition-colors rounded touch-manipulation"
							aria-label="Close">
							<svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>

					{/* Image Preview */}
					<div className="aspect-square w-full max-w-sm sm:max-w-md mx-auto mb-6 overflow-hidden rounded-sm flex items-center justify-center bg-retro-muted min-h-50 sm:min-h-70">
						{isSpecial && imageDataUrl ? (
							<img src={imageDataUrl} alt="Preview" className="w-full h-full object-contain" style={{ imageRendering: "pixelated" }} />
						) : metadataSvgString ? (
							<img
								src={`data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(metadataSvgString)))}`}
								alt="Preview"
								className="w-full h-full object-contain"
								style={{ imageRendering: "pixelated" }}
							/>
						) : (
							<iframe
								srcDoc={modalSrcdoc}
								title="Preview"
								sandbox="allow-scripts"
								className="w-full h-full border-0 block min-w-0"
								style={{ imageRendering: "pixelated" }}
							/>
						)}
					</div>

					{/* Download Options */}
					<div className="space-y-4">
						{!isSpecial && (
							<>
								{/* Resolution Selector */}
								<div>
									<label htmlFor={`resolution-${tokenId}`} className="block text-retro-orange text-sm font-medium mb-1">
										Resolution
									</label>
									<select
										id={`resolution-${tokenId}`}
										value={resolution}
										onChange={(e) => setResolution(Number(e.target.value))}
										className="w-full bg-retro-muted border border-retro-orange/50 px-3 sm:px-4 py-2 text-white focus:border-retro-orange outline-none rounded-sm min-w-0">
										<option value={480}>480x480</option>
										<option value={960}>960x960</option>
										<option value={1920}>1920x1920</option>
									</select>
								</div>

								{/* Transparent Background Checkbox */}
								<label className="flex items-center gap-3 text-white cursor-pointer">
									<input type="checkbox" checked={transparent} onChange={(e) => setTransparent(e.target.checked)} className="accent-retro-orange shrink-0" />
									<span className="text-sm">Transparent background</span>
								</label>
							</>
						)}

						{/* Download Button */}
						<button
							type="button"
							onClick={handleDownload}
							className="w-full py-3 sm:py-3.5 min-h-12 bg-retro-orange text-white font-semibold hover:brightness-110 active:brightness-95 transition-all rounded-sm touch-manipulation">
							Download PNG
						</button>
					</div>
				</div>
			</div>,
			document.body,
		);
	}

	/**
	 * Fullscreen Modal - View NFT in fullscreen
	 */
	function renderFullscreenModal() {
		if (!isFullscreenOpen) return null;

		return createPortal(
			<div
				className="fixed inset-0 z-100 flex items-center justify-center bg-retro-dark p-3 sm:p-6"
				onClick={() => setIsFullscreenOpen(false)}
				role="dialog"
				aria-modal="true"
				aria-label="Fullscreen view">
				{/* Close Button */}
				<button
					type="button"
					onClick={() => setIsFullscreenOpen(false)}
					className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 min-w-12 min-h-12 flex items-center justify-center text-retro-orange hover:bg-retro-orange/20 active:bg-retro-orange/30 z-10 rounded touch-manipulation"
					aria-label="Close fullscreen">
					<svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>

				{/* Fullscreen Image */}
				<div className="w-[min(90vw,90vh)] h-[min(90vw,90vh)] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
					{isSpecial && imageDataUrl ? (
						<img src={imageDataUrl} alt="Fullscreen RetroPunk" className="w-full h-full object-contain min-w-0" style={{ imageRendering: "pixelated" }} />
					) : (
						<iframe
							srcDoc={modalSrcdoc}
							title="Fullscreen RetroPunk"
							sandbox="allow-scripts"
							className="w-full h-full min-w-0 border-0 block"
							style={{ imageRendering: "pixelated" }}
						/>
					)}
				</div>
			</div>,
			document.body,
		);
	}
}
