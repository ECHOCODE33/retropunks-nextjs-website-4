"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { toast } from "sonner";
import { RETROPUNKS_CONTRACT, RETROPUNKS_ABI } from "@/lib/contracts";
import {
  parseTokenURI,
  formatBirthday,
  downloadPunkAsPng,
  isSpecialNft,
  stringToBytes32,
  validateRetroPunksName,
  validateRetroPunksBio,
} from "@/lib/utilities";
import {
  buildIframeSrcdoc,
  IFRAME_BACKGROUND_COUNT,
} from "@/lib/iframeGenerator";
import Tooltip from "./Tooltip";
import {
  IconArrowBack,
  IconArrowForward,
  IconInfo,
  IconDownload,
  IconSetBackground,
  IconFullscreen,
} from "@/components/icons";

interface PunkCardProps {
  tokenId: string;
  tokenUri: string;
  currentBg: number;
  name: string;
  bio: string;
  onMetadataUpdate?: (
    tokenId: string,
    updates: { name?: string; bio?: string; currentBg?: number },
  ) => void;
}

function formatAttributeValue(attr: {
  trait_type: string;
  value: string | number;
}): string {
  if (attr.trait_type.toLowerCase() === "birthday") {
    return formatBirthday(attr.value);
  }
  return String(attr.value);
}

export default function PunkCard({
  tokenId,
  tokenUri,
  currentBg,
  name,
  bio,
  onMetadataUpdate,
}: PunkCardProps) {
  const [metadata, setMetadata] = useState<{
    name?: string;
    description?: string;
    attributes?: Array<{ trait_type: string; value: string | number }>;
  } | null>(null);
  const [innerCharacterContent, setInnerCharacterContent] = useState("");
  const [srcdoc, setSrcdoc] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [isSpecial, setIsSpecial] = useState(false);
  const [bgIndex, setBgIndex] = useState(currentBg);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [resolution, setResolution] = useState(960);
  const [transparent, setTransparent] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [lastUpdateType, setLastUpdateType] = useState<
    "background" | "name" | "bio" | null
  >(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const svgResolveRef = useRef<((svg: string) => void) | null>(null);
  const submittedNameRef = useRef<string>("");
  const submittedBioRef = useRef<string>("");

  const { writeContract, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const isAnyModalOpen = isDetailsOpen || isDownloadOpen || isFullscreenOpen;

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

  useEffect(() => {
    if (!tokenUri) return;
    try {
      const parsed = parseTokenURI(tokenUri);
      const specialByAttr = isSpecialNft(parsed.metadata);
      const specialByFormat = parsed.isSpecial || !!parsed.imageDataUrl;
      const special = specialByAttr || specialByFormat;

      setMetadata(parsed.metadata);
      setInnerCharacterContent(parsed.innerCharacterContent);
      setImageDataUrl(parsed.imageDataUrl ?? null);
      setIsSpecial(special);
      setBgIndex(currentBg);

      if (special) {
        setSrcdoc("");
      } else {
        setSrcdoc(
          buildIframeSrcdoc(parsed.innerCharacterContent, currentBg, tokenId),
        );
      }
    } catch {
      setMetadata(null);
      setInnerCharacterContent("");
      setImageDataUrl(null);
      setIsSpecial(false);
      setSrcdoc(buildIframeSrcdoc("", 0, tokenId));
      setBgIndex(0);
    }
  }, [tokenUri, currentBg, tokenId]);

  const modalSrcdoc =
    !isSpecial && innerCharacterContent
      ? buildIframeSrcdoc(innerCharacterContent, bgIndex, tokenId)
      : srcdoc;

  useEffect(() => {
    if (isDetailsOpen) {
      setEditName(name?.trim() ?? "");
      setEditBio(bio?.trim() ?? "");
    }
  }, [isDetailsOpen, name, bio]);

  // Only update this card's bgIndex when message cardId matches (prevents cross-card sync)
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      const d = e.data;
      if (!d || typeof d !== "object") return;
      if (
        d.type === "backgroundChange" &&
        d.cardId === tokenId &&
        typeof d.index === "number"
      ) {
        setBgIndex(d.index);
      }
      if (d.type === "svgResult" && d.svg != null) {
        svgResolveRef.current?.(d.svg);
        svgResolveRef.current = null;
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [tokenId]);

  const sendToIframe = useCallback((msg: Record<string, unknown>) => {
    iframeRef.current?.contentWindow?.postMessage(msg, "*");
  }, []);

  const handleCyclePrev = () => sendToIframe({ type: "cyclePrev" });
  const handleCycleNext = () => sendToIframe({ type: "cycleNext" });

  const requestSvgFromIframe = (): Promise<string> =>
    new Promise((resolve) => {
      svgResolveRef.current = resolve;
      sendToIframe({
        type: "getSvg",
        requestId: crypto.randomUUID?.() ?? `${Date.now()}`,
      });
      setTimeout(() => {
        if (svgResolveRef.current) {
          svgResolveRef.current("");
          svgResolveRef.current = null;
        }
      }, 3000);
    });

  const handleDownload = async () => {
    try {
      if (isSpecial && imageDataUrl) {
        const a = document.createElement("a");
        a.href = imageDataUrl;
        a.download = `retropunk-${tokenId}-special.png`;
        a.click();
        toast.success("Download started");
        setIsDownloadOpen(false);
        return;
      }
      const svgString = await requestSvgFromIframe();
      if (!svgString) {
        toast.error("Could not capture image");
        return;
      }
      const filename = `retropunk-${tokenId}-bg${bgIndex}${
        transparent ? "-transparent" : ""
      }`;
      await downloadPunkAsPng(svgString, resolution, filename, transparent);
      toast.success("Download started");
      setIsDownloadOpen(false);
    } catch {
      toast.error("Download failed");
    }
  };

  const saveTokenMetadata = (
    nameStr: string,
    bioStr: string,
    backgroundIndex: number,
  ) => {
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
    writeContract({
      address: RETROPUNKS_CONTRACT,
      abi: RETROPUNKS_ABI,
      functionName: "setTokenMetadata",
      args: [
        BigInt(tokenId),
        stringToBytes32(nameStr),
        bioStr,
        backgroundIndex,
      ],
    });
  };

  const handleSetBackground = () => {
    setLastUpdateType("background");
    saveTokenMetadata(name, bio, bgIndex);
  };

  const handleUpdateName = () => {
    submittedNameRef.current = editName;
    setLastUpdateType("name");
    saveTokenMetadata(editName, editBio, bgIndex);
  };

  const handleUpdateBio = () => {
    submittedBioRef.current = editBio;
    setLastUpdateType("bio");
    saveTokenMetadata(editName, editBio, bgIndex);
  };

  const displayName = name?.trim() || `RetroPunk #${tokenId}`;
  const iconSize = 22;
  const iconBtnClass =
    "p-2 min-w-[44px] min-h-[44px] text-retro-orange hover:bg-retro-orange/10 active:bg-retro-orange/20 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center touch-manipulation";

  if (!srcdoc && !imageDataUrl) {
    return (
      <div className="border-2 border-retro-orange bg-retro-card overflow-hidden w-full max-w-[300px] mx-auto aspect-3/4 flex items-center justify-center animate-fade-in">
        <span className="text-retro-orange/60 text-sm">Loading...</span>
      </div>
    );
  }

  return (
    <div className="group/card relative border-2 border-retro-orange bg-retro-card overflow-hidden w-full max-w-[300px] mx-auto flex flex-col animate-fade-in min-w-0">
      {/* NFT display */}
      <div className="aspect-square w-full bg-retro-muted overflow-hidden">
        {isSpecial && imageDataUrl ? (
          <img
            src={imageDataUrl}
            alt={displayName}
            className="w-full h-full object-contain"
            style={{ imageRendering: "pixelated" }}
          />
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

      {/* Card content - NFT name only, no ID */}
      <div className="p-3 flex flex-col gap-1 bg-retro-card">
        <h3
          className="text-white font-bold text-center truncate"
          title={displayName}
        >
          {displayName}
        </h3>
        {isSpecial && (
          <p className="text-retro-orange/80 text-xs text-center">
            Special · No background
          </p>
        )}

        {/* Background cycle - only for non-Special NFTs */}
        {!isSpecial && (
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCyclePrev();
              }}
              className={iconBtnClass}
              aria-label="Previous background"
            >
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
              aria-label="Next background"
            >
              <IconArrowForward size={iconSize} />
            </button>
          </div>
        )}

        {/* Action buttons - 4 icons; hide Set Background for Special NFTs */}
        <div className="flex justify-center gap-1">
          <Tooltip label="Info" side="top">
            <button
              type="button"
              onClick={() => setIsDetailsOpen(true)}
              className={iconBtnClass}
              aria-label="Info"
            >
              <IconInfo size={iconSize} />
            </button>
          </Tooltip>
          <Tooltip label="Download Image" side="top">
            <button
              type="button"
              onClick={() => setIsDownloadOpen(true)}
              className={iconBtnClass}
              aria-label="Download"
            >
              <IconDownload size={iconSize} />
            </button>
          </Tooltip>
          {!isSpecial && (
            <Tooltip label="Set Background" side="top">
              <button
                type="button"
                onClick={handleSetBackground}
                disabled={isConfirming}
                className={iconBtnClass}
                aria-label="Set background on-chain"
              >
                <IconSetBackground size={iconSize} />
              </button>
            </Tooltip>
          )}
          <Tooltip label="Fullscreen" side="top">
            <button
              type="button"
              onClick={() => setIsFullscreenOpen(true)}
              className={iconBtnClass}
              aria-label="Fullscreen"
            >
              <IconFullscreen size={iconSize} />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* View Details Modal - image on top, details below */}
      {isDetailsOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-100 flex flex-col p-2 sm:p-4 bg-retro-dark/90 overflow-hidden touch-pan-y"
            onClick={() => setIsDetailsOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`details-title-${tokenId}`}
          >
            <div
              className="bg-retro-card border-2 border-retro-orange w-full max-w-3xl mx-auto flex-1 min-h-0 flex flex-col overflow-hidden my-auto max-h-[95vh] sm:max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header - ID as title */}
              <div className="flex justify-between items-center px-3 sm:px-4 py-2 sm:py-3 border-b border-retro-orange/30 shrink-0">
                <h2
                  id={`details-title-${tokenId}`}
                  className="text-base sm:text-lg font-bold text-retro-orange font-mono"
                >
                  ID: {tokenId}
                </h2>
                <button
                  type="button"
                  onClick={() => setIsDetailsOpen(false)}
                  className="p-2 -mr-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-retro-orange hover:bg-retro-orange/10 active:bg-retro-orange/20 transition-colors touch-manipulation"
                  aria-label="Close"
                >
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain">
                {/* Image - top, fills width */}
                <div className="flex items-center justify-center bg-retro-muted p-3 sm:p-4 shrink-0">
                  <div className="w-full aspect-square mx-auto sm:max-w-125">
                    {" "}
                    {/* max-w-[280px] sm:max-w-[340px] */}
                    {isSpecial && imageDataUrl ? (
                      <img
                        src={imageDataUrl}
                        alt={displayName}
                        className="w-full h-full object-contain"
                        style={{ imageRendering: "pixelated" }}
                      />
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

                {/* Details - name, bio, attributes */}
                <div className="p-3 sm:p-4 space-y-8 min-w-0">
                  {/* Name - input then button below */}
                  <div className="min-w-0">
                    <label
                      htmlFor={`details-name-${tokenId}`}
                      className="block text-retro-orange text-xs font-bold uppercase tracking-wider mb-1.5"
                    >
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
                      className="mt-2 px-4 py-2 h-9 bg-retro-orange text-white font-semibold hover:brightness-110 active:brightness-95 transition-colors disabled:opacity-50 touch-manipulation text-sm"
                    >
                      Update
                    </button>
                  </div>

                  {/* Bio - textarea then button below */}
                  <div className="min-w-0">
                    <label
                      htmlFor={`details-bio-${tokenId}`}
                      className="block text-retro-orange text-xs font-bold uppercase tracking-wider mb-1.5"
                    >
                      Bio
                    </label>
                    <textarea
                      id={`details-bio-${tokenId}`}
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      placeholder="Bio / description"
                      rows={4}
                      className="w-full bg-retro-muted border border-retro-orange/50 px-3 sm:px-4 py-2 text-white placeholder:text-gray-500 focus:border-retro-orange outline-none resize-none text-base min-h-[88px]"
                    />
                    <button
                      type="button"
                      onClick={handleUpdateBio}
                      disabled={isConfirming}
                      className="mt-2 px-4 py-2 h-9 bg-retro-orange text-white font-semibold hover:brightness-110 active:brightness-95 transition-colors disabled:opacity-50 touch-manipulation text-sm"
                    >
                      Update
                    </button>
                  </div>

                  {/* Attributes */}
                  {metadata?.attributes && metadata.attributes.length > 0 && (
                    <div className="min-w-0">
                      <h3 className="text-retro-orange text-xs font-bold uppercase tracking-wider mb-2">
                        Attributes
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {metadata.attributes.map((attr) => (
                          <div
                            key={attr.trait_type}
                            className="bg-retro-muted border border-retro-orange/30 px-4 py-3 min-w-0"
                          >
                            <span className="text-retro-orange/90 text-xs font-semibold uppercase block mb-2 truncate">
                              {attr.trait_type}
                            </span>
                            <span className="text-white text-sm truncate block">
                              {formatAttributeValue(attr)}
                            </span>
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

      {/* Download Modal - large preview */}
      {isDownloadOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-100 flex items-center justify-center p-2 sm:p-4 bg-retro-dark/90 overflow-y-auto touch-pan-y"
            onClick={() => setIsDownloadOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`download-title-${tokenId}`}
          >
            <div
              className="bg-retro-card border-2 border-retro-orange p-4 sm:p-6 w-full max-w-xl sm:max-w-2xl max-h-[95vh] overflow-y-auto overscroll-contain"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2
                  id={`download-title-${tokenId}`}
                  className="text-lg sm:text-xl font-bold text-retro-orange"
                >
                  Download Image
                </h2>
                <button
                  type="button"
                  onClick={() => setIsDownloadOpen(false)}
                  className="p-2 -mr-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-retro-orange hover:bg-retro-orange/10 active:bg-retro-orange/20 transition-colors rounded touch-manipulation"
                  aria-label="Close"
                >
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Large preview - always with background; download respects transparent option */}
              <div className="aspect-square w-full max-w-sm sm:max-w-md mx-auto mb-6 overflow-hidden rounded-sm flex items-center justify-center bg-retro-muted min-h-[200px] sm:min-h-[280px]">
                {isSpecial && imageDataUrl ? (
                  <img
                    src={imageDataUrl}
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
                    <div>
                      <label
                        htmlFor={`resolution-${tokenId}`}
                        className="block text-retro-orange text-sm font-medium mb-1"
                      >
                        Resolution
                      </label>
                      <select
                        id={`resolution-${tokenId}`}
                        value={resolution}
                        onChange={(e) => setResolution(Number(e.target.value))}
                        className="w-full bg-retro-muted border border-retro-orange/50 px-3 sm:px-4 py-2 text-white focus:border-retro-orange outline-none rounded-sm min-w-0"
                      >
                        <option value={480}>480 × 480 (10×)</option>
                        <option value={960}>960 × 960 (20×)</option>
                        <option value={1920}>1920 × 1920 (40×)</option>
                      </select>
                    </div>
                    <label className="flex items-center gap-3 text-white cursor-pointer">
                      <input
                        type="checkbox"
                        checked={transparent}
                        onChange={(e) => setTransparent(e.target.checked)}
                        className="accent-retro-orange shrink-0"
                      />
                      <span className="text-sm">Transparent background</span>
                    </label>
                  </>
                )}
                <button
                  type="button"
                  onClick={handleDownload}
                  className="w-full py-3 sm:py-3.5 min-h-[48px] bg-retro-orange text-white font-semibold hover:brightness-110 active:brightness-95 transition-all rounded-sm touch-manipulation"
                >
                  Download PNG
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Fullscreen Modal - responsive display */}
      {isFullscreenOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-100 flex items-center justify-center bg-retro-dark p-3 sm:p-6"
            onClick={() => setIsFullscreenOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Fullscreen view"
          >
            <button
              type="button"
              onClick={() => setIsFullscreenOpen(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 min-w-[48px] min-h-[48px] flex items-center justify-center text-retro-orange hover:bg-retro-orange/20 active:bg-retro-orange/30 z-10 rounded touch-manipulation"
              aria-label="Close fullscreen"
            >
              <svg
                className="w-7 h-7 sm:w-8 sm:h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div
              className="w-[min(90vw,90vh)] h-[min(90vw,90vh)] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {isSpecial && imageDataUrl ? (
                <img
                  src={imageDataUrl}
                  alt="Fullscreen RetroPunk"
                  className="w-full h-full object-contain min-w-0"
                  style={{ imageRendering: "pixelated" }}
                />
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
