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

/**
 * Defines the properties for the PunkCard component.
 */
interface PunkCardProps {
	/**
	 * The unique identifier for the NFT.
	 */
	tokenId: string;

	/**
	 * The URI containing metadata for the NFT.
	 */
	tokenUri: string;

	/**
	 * The current background index for the NFT.
	 */
	currentBg: number;

	/**
	 * The name of the NFT.
	 */
	name: string;

	/**
	 * The bio or description of the NFT.
	 */
	bio: string;

	/**
	 * Optional callback for when metadata is updated.
	 * @param tokenId The tokenID of the NFT being updated.
	 * @param updates The updated values for name, bio, and background.
	 */
	onMetadataUpdate?: (tokenId: string, updates: { name?: string; bio?: string; currentBg?: number }) => void;
}

/**
 * Formats the value of an attribute, handling special cases like 'birthday'.
 * @param attr - The attribute object with trait_type and value.
 * @returns The formatted attribute value as a string.
 */
function formatAttributeValue(attr: { trait_type: string; value: string | number }): string {
	if (attr.trait_type.toLowerCase() === "birthday") {
		return formatBirthday(attr.value);
	}
	return String(attr.value);
}

/**
 * The main component for displaying a single RetroPunk NFT.
 */
export default function PunkCard({ tokenId, tokenUri, currentBg, name, bio, onMetadataUpdate }: PunkCardProps) {
	/**
	 * State for storing parsed metadata from the token URI.
	 */
	const [metadata, setMetadata] = useState<{
		name?: string;
		description?: string;
		attributes?: Array<{ trait_type: string; value: string | number }>;
	} | null>(null);

	/**
	 * State for the inner SVG content of the character.
	 */
	const [innerCharacterContent, setInnerCharacterContent] = useState("");

	/**
	 * State for the full SVG string from metadata.
	 */
	const [metadataSvgString, setMetadataSvgString] = useState<string>("");

	/**
	 * State for the iframe's srcdoc content.
	 */
	const [srcdoc, setSrcdoc] = useState("");

	/**
	 * State for the data URL of the image, for special NFTs.
	 */
	const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);

	/**
	 * State to indicate if the NFT is a special edition.
	 */
	const [isSpecial, setIsSpecial] = useState(false);

	/**
	 * State for the current background index, controlled by the user.
	 */
	const [bgIndex, setBgIndex] = useState(currentBg);

	/**
	 * State to control the visibility of the details modal.
	 */
	const [isDetailsOpen, setIsDetailsOpen] = useState(false);

	/**
	 * State to control the visibility of the download modal.
	 */
	const [isDownloadOpen, setIsDownloadOpen] = useState(false);

	/**
	 * State to control the visibility of the fullscreen view.
	 */
	const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);

	/**
	 * State for the selected resolution for downloading the image.
	 */
	const [resolution, setResolution] = useState(960);

	/**
	 * State to determine if the downloaded image should have a transparent background.
	 */
	const [transparent, setTransparent] = useState(false);

	/**
	 * State for the editable name field in the details modal.
	 */
	const [editName, setEditName] = useState("");

	/**
	 * State for the editable bio field in the details modal.
	 */
	const [editBio, setEditBio] = useState("");

	/**
	 * State to track the type of the last metadata update operation.
	 */
	const [lastUpdateType, setLastUpdateType] = useState<"background" | "name" | "bio" | null>(null);

	// Refs for DOM elements and other imperative values.
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const svgResolveRef = useRef<((svg: string) => void) | null>(null);
	const submittedNameRef = useRef<string>("");
	const submittedBioRef = useRef<string>("");

	// Wagmi hooks for interacting with the smart contract.
	const { writeContract, data: hash } = useWriteContract();
	const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
		hash,
	});

	/**
	 * A boolean to easily check if any modal is open.
	 */
	const isAnyModalOpen = isDetailsOpen || isDownloadOpen || isFullscreenOpen;

	/**
	 * Effect to show toast notifications on successful contract interactions.
	 */
	useEffect(() => {
		if (isSuccess && hash && lastUpdateType) {
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
		}
	}, [isSuccess, hash, lastUpdateType, tokenId, onMetadataUpdate, bgIndex]);

	/**
	 * Effect to handle body overflow and keyboard shortcuts when a modal is open.
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
	 * Effect to parse the token URI and set up the initial state of the card.
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

			if (special) {
				setSrcdoc("");
			} else {
				setSrcdoc(buildIframeSrcdoc(parsed.innerCharacterContent, currentBg, tokenId));
			}
		} catch {
			// Reset state in case of parsing error.
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
	 * The srcdoc for modals, which should reflect the currently selected background.
	 */
	const modalSrcdoc = !isSpecial && innerCharacterContent ? buildIframeSrcdoc(innerCharacterContent, bgIndex, tokenId) : srcdoc;

	/**
	 * Effect to initialize the edit fields when the details modal is opened.
	 */
	useEffect(() => {
		if (isDetailsOpen) {
			setEditName(name?.trim() ?? "");
			setEditBio(bio?.trim() ?? "");
		}
	}, [isDetailsOpen, name, bio]);

	/**
	 * Effect to handle messages from the iframe (e.g., background changes, SVG data).
	 */
	useEffect(() => {
		const handler = (e: MessageEvent) => {
			const d = e.data;
			if (!d || typeof d !== "object") return;
			// Update background index when the iframe signals a change.
			if (d.type === "backgroundChange" && d.cardId === tokenId && typeof d.index === "number") {
				setBgIndex(d.index);
			}
			// Resolve the SVG promise when the iframe sends the SVG string.
			if (d.type === "svgResult" && d.svg != null) {
				svgResolveRef.current?.(d.svg);
				svgResolveRef.current = null;
			}
		};
		window.addEventListener("message", handler);
		return () => window.removeEventListener("message", handler);
	}, [tokenId]);

	/**
	 * Sends a message to the iframe.
	 * @param msg - The message object to send.
	 */
	const sendToIframe = useCallback((msg: Record<string, unknown>) => {
		iframeRef.current?.contentWindow?.postMessage(msg, "*");
	}, []);

	// Handlers for cycling through backgrounds.
	const handleCyclePrev = () => sendToIframe({ type: "cyclePrev" });
	const handleCycleNext = () => sendToIframe({ type: "cycleNext" });

	/**
	 * Requests the current SVG from the iframe.
	 * @returns A promise that resolves with the SVG string.
	 */
	const requestSvgFromIframe = (): Promise<string> =>
		new Promise((resolve) => {
			svgResolveRef.current = resolve;
			sendToIframe({
				type: "getSvg",
				requestId: crypto.randomUUID?.() ?? `${Date.now()}`,
			});
			// Timeout to prevent the promise from hanging indefinitely.
			setTimeout(() => {
				if (svgResolveRef.current) {
					svgResolveRef.current("");
					svgResolveRef.current = null;
				}
			}, 3000);
		});

	/**
	 * Handles the download of the NFT image as a PNG.
	 */
	const handleDownload = async () => {
		try {
			// Special handling for non-SVG special NFTs.
			if (isSpecial && imageDataUrl) {
				const a = document.createElement("a");
				a.href = imageDataUrl;
				a.download = `retropunk-${tokenId}-special.png`;
				a.click();
				toast.success("Download started");
				setIsDownloadOpen(false);
				return;
			}
			// Use the SVG from metadata for consistency.
			const svgString = metadataSvgString;
			if (!svgString) {
				toast.error("Could not get image from metadata");
				return;
			}
			const filename = `retropunk-${tokenId}-bg${currentBg}${transparent ? "-transparent" : ""}`;
			await downloadPunkAsPng(svgString, resolution, filename, transparent);
			toast.success("Download started");
			setIsDownloadOpen(false);
		} catch {
			toast.error("Download failed");
		}
	};

	/**
	 * Saves the token metadata by calling the smart contract.
	 * @param nameStr - The name to set.
	 * @param bioStr - The bio to set.
	 * @param backgroundIndex - The background index to set.
	 */
	const saveTokenMetadata = (nameStr: string, bioStr: string, backgroundIndex: number) => {
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
		// Call the 'setTokenMetadata' function on the contract.
		writeContract({
			address: RETROPUNKS_CONTRACT,
			abi: RETROPUNKS_ABI,
			functionName: "setTokenMetadata",
			args: [BigInt(tokenId), stringToBytes32(nameStr), bioStr, backgroundIndex],
		});
	};

	const handleSetBackground = () => {
		setLastUpdateType("background");
		saveTokenMetadata(name, bio, bgIndex);
	};

	const handleUpdateName = () => {
		submittedNameRef.current = editName;
		setLastUpdateType("name");
		saveTokenMetadata(editName, bio, currentBg);
	};

	const handleUpdateBio = () => {
		submittedBioRef.current = editBio;
		setLastUpdateType("bio");
		saveTokenMetadata(name, editBio, currentBg);
	};

	// Constants for styling and display.
	const displayName = name?.trim() || `RetroPunk #${tokenId}`;
	const iconSize = 22;
	const iconBtnClass =
		"p-2 min-w-[44px] min-h-11 text-retro-orange hover:bg-retro-orange/10 active:bg-retro-orange/20 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center touch-manipulation";

	// Loading state display.
	if (!srcdoc && !imageDataUrl) {
		return (
			<div className="border-2 border-retro-orange bg-retro-card overflow-hidden w-full max-w-75 mx-auto aspect-3/4 flex items-center justify-center animate-fade-in">
				<span className="text-retro-orange/60 text-sm">Loading...</span>
			</div>
		);
	}

	return (
		<div className="group/card relative border-2 border-retro-orange bg-retro-card overflow-hidden w-full max-w-75 mx-auto flex flex-col animate-fade-in min-w-0">
			{/* NFT display: image for special NFTs, iframe for standard NFTs */}
			<div className="aspect-square w-full bg-retro-muted overflow-hidden">
				{isSpecial && imageDataUrl ? (
					<img src={imageDataUrl} alt={displayName} className="w-full h-full object-contain" style={{ imageRendering: "pixelated" }} />
				) : (
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

			{/* Card content (name / action buttons) */}
			<div className="p-3 flex flex-col gap-1 bg-retro-card">
				<h3 className="text-white font-bold text-center truncate" title={displayName}>
					{displayName}
				</h3>
				{isSpecial && <p className="text-retro-orange/80 text-xs text-center">Special · No background</p>}

				{/* Background cycle control arrow buttons (only for non-Special NFTs) */}
				{!isSpecial && (
					<div className="flex items-center justify-center gap-2">
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								handleCyclePrev();
							}}
							className={iconBtnClass}
							aria-label="Previous background">
							<IconArrowBack size={iconSize} />
						</button>
						<span className="text-retro-orange font-mono text-sm min-w-14 text-center">
							{bgIndex + 1}/{IFRAME_BACKGROUND_COUNT}
						</span>
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								handleCycleNext();
							}}
							className={iconBtnClass}
							aria-label="Next background">
							<IconArrowForward size={iconSize} />
						</button>
					</div>
				)}

				{/* Action buttons row */}
				<div className="flex justify-center gap-1">
					<Tooltip label="Info" side="top">
						<button type="button" onClick={() => setIsDetailsOpen(true)} className={iconBtnClass} aria-label="Info">
							<IconInfo size={iconSize} />
						</button>
					</Tooltip>
					<Tooltip label="Download Image" side="top">
						<button type="button" onClick={() => setIsDownloadOpen(true)} className={iconBtnClass} aria-label="Download">
							<IconDownload size={iconSize} />
						</button>
					</Tooltip>
					{!isSpecial && (
						<Tooltip label="Set Background" side="top">
							<button type="button" onClick={handleSetBackground} disabled={isConfirming} className={iconBtnClass} aria-label="Set background on-chain">
								<IconSetBackground size={iconSize} />
							</button>
						</Tooltip>
					)}
					<Tooltip label="Fullscreen" side="top">
						<button type="button" onClick={() => setIsFullscreenOpen(true)} className={iconBtnClass} aria-label="Fullscreen">
							<IconFullscreen size={iconSize} />
						</button>
					</Tooltip>
				</div>
			</div>

			{/* View Details Modal */}
			{isDetailsOpen &&
				createPortal(
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

								{/* Metadata Details */}
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
				)}

			{/* Download Modal */}
			{isDownloadOpen &&
				createPortal(
					<div
						className="fixed inset-0 z-100 flex items-center justify-center p-2 sm:p-4 bg-retro-dark/90 overflow-y-auto touch-pan-y"
						onClick={() => setIsDownloadOpen(false)}
						role="dialog"
						aria-modal="true"
						aria-labelledby={`download-title-${tokenId}`}>
						<div
							className="bg-retro-card border-2 border-retro-orange p-4 sm:p-6 w-full max-w-xl sm:max-w-2xl max-h-[95vh] overflow-y-auto overscroll-contain"
							onClick={(e) => e.stopPropagation()}>
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

							{/* Image preview for download */}
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

							<div className="space-y-4">
								{!isSpecial && (
									<>
										{/* Download options */}
										<div>
											<label htmlFor={`resolution-${tokenId}`} className="block text-retro-orange text-sm font-medium mb-1">
												Resolution
											</label>
											<select
												id={`resolution-${tokenId}`}
												value={resolution}
												onChange={(e) => setResolution(Number(e.target.value))}
												className="w-full bg-retro-muted border border-retro-orange/50 px-3 sm:px-4 py-2 text-white focus:border-retro-orange outline-none rounded-sm min-w-0">
												<option value={480}>480 × 480 (10×)</option>
												<option value={960}>960 × 960 (20×)</option>
												<option value={1920}>1920 × 1920 (40×)</option>
											</select>
										</div>
										<label className="flex items-center gap-3 text-white cursor-pointer">
											<input type="checkbox" checked={transparent} onChange={(e) => setTransparent(e.target.checked)} className="accent-retro-orange shrink-0" />
											<span className="text-sm">Transparent background</span>
										</label>
									</>
								)}
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
				)}

			{/* Fullscreen Modal */}
			{isFullscreenOpen &&
				createPortal(
					<div
						className="fixed inset-0 z-100 flex items-center justify-center bg-retro-dark p-3 sm:p-6"
						onClick={() => setIsFullscreenOpen(false)}
						role="dialog"
						aria-modal="true"
						aria-label="Fullscreen view">
						<button
							type="button"
							onClick={() => setIsFullscreenOpen(false)}
							className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 min-w-12 min-h-12 flex items-center justify-center text-retro-orange hover:bg-retro-orange/20 active:bg-retro-orange/30 z-10 rounded touch-manipulation"
							aria-label="Close fullscreen">
							<svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
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
				)}
		</div>
	);
}
