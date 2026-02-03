"use client";

import { useState, useEffect, useRef, ReactElement } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { RETROPUNKS_CONTRACT, RETROPUNKS_ABI } from "@/lib/contracts";
import { BACKGROUND_OPTIONS, BG_TYPES } from "@/lib/backgrounds";
import { parseTokenURI, downloadPunkAsPng } from "@/lib/utilities";

interface PunkCardProps {
  tokenId: string;
  tokenUri: string;
  currentBg: number;
}

const PunkCard: React.FC<PunkCardProps> = ({ tokenId, tokenUri, currentBg }) => {
  const [metadata, setMetadata] = useState<any>(null);
  const [innerContent, setInnerContent] = useState<string>("");
  const [viewBox, setViewBox] = useState<string>("0 0 48 48");
  const [bgIndex, setBgIndex] = useState<number>(currentBg);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [resolution, setResolution] = useState(512);
  const [transparent, setTransparent] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);

  const { writeContract, data: hash } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (tokenUri) {
      const { metadata, innerCharacterContent, viewBox: vBox } = parseTokenURI(tokenUri);
      setMetadata(metadata);
      setInnerContent(innerCharacterContent);
      setViewBox(vBox);
      setBgIndex(currentBg);
    }
  }, [tokenUri, currentBg]);

  const handleCycle = (direction: "prev" | "next") => {
    setBgIndex((prev) => {
      if (direction === "next") return (prev + 1) % BACKGROUND_OPTIONS.length;
      return prev === 0 ? BACKGROUND_OPTIONS.length - 1 : prev - 1;
    });
  };

  const normalizeColor = (c: string): string => {
    let s = c.trim().toLowerCase();
    if (!s.startsWith('#')) s = '#' + s;
    let body = s.slice(1);
    if (body.length === 6) body += 'ff';
    if (body.length === 8) return '#' + body;
    return '#000000ff';
  };

  const getGradientCoords = (layerType: number) => {
    switch (layerType) {
      case BG_TYPES.S_Vertical:
      case BG_TYPES.P_Vertical:
        return { x1: "0", y1: "0", x2: "0", y2: "1" };
      case BG_TYPES.S_Horizontal:
      case BG_TYPES.P_Horizontal:
        return { x1: "0", y1: "0", x2: "1", y2: "0" };
      case BG_TYPES.S_Down:
      case BG_TYPES.P_Down:
        return { x1: "0", y1: "0", x2: "1", y2: "1" };
      case BG_TYPES.S_Up:
      case BG_TYPES.P_Up:
        return { x1: "0", y1: "1", x2: "1", y2: "0" };
      default:
        return { x1: "0", y1: "0", x2: "0", y2: "1" };
    }
  };

  const renderBackground = () => {
    const bg = BACKGROUND_OPTIONS[bgIndex] || BACKGROUND_OPTIONS[0];
    const { layerType, palette = [], name } = bg;
    const [, , w, h] = viewBox.split(" ");
    const width = w || "48";
    const height = h || "48";
    const gradId = `grad-${tokenId}-${bgIndex}`;

    // Special handling for Rainbow (image type → rainbow gradient)
    if (layerType === BG_TYPES.Image && name === "Rainbow") {
      const rainbowPalette = ["#ff0000", "#ff7f00", "#ffff00", "#00ff00", "#0000ff", "#4b0082", "#9400d3"];
      const stops = rainbowPalette.map((col, i) => (
        <stop key={i} offset={`${(i / (rainbowPalette.length - 1)) * 100}%`} stopColor={col} />
      ));

      return (
        <g id="Background">
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              {stops}
            </linearGradient>
          </defs>
          <rect x="0" y="0" width={width} height={height} fill={`url(#${gradId})`} />
        </g>
      );
    }

    // Solid
    if (layerType === BG_TYPES.Solid) {
      const color = palette[0] ? normalizeColor(palette[0]) : "#000000ff";
      return (
        <g id="Background">
          <rect x="0" y="0" width={width} height={height} fill={color} />
        </g>
      );
    }

    // Radial
    if (layerType === BG_TYPES.Radial) {
      const stops = palette.map((col, i) => {
        const offset = palette.length > 1 ? (i / (palette.length - 1)) * 100 : 0;
        return <stop key={i} offset={`${offset}%`} stopColor={normalizeColor(col)} />;
      });

      return (
        <g id="Background">
          <defs>
            <radialGradient id={gradId} cx="50%" cy="50%" r="70%">
              {stops}
            </radialGradient>
          </defs>
          <rect x="0" y="0" width={width} height={height} fill={`url(#${gradId})`} />
        </g>
      );
    }

    // Linear gradients (smooth or pixelated)
    const isPixelated = [BG_TYPES.P_Vertical, BG_TYPES.P_Horizontal, BG_TYPES.P_Down, BG_TYPES.P_Up].includes(layerType as typeof BG_TYPES.P_Vertical);
    const coords = getGradientCoords(layerType);

    if (palette.length === 0) {
      return (
        <g id="Background">
          <rect x="0" y="0" width={width} height={height} fill="transparent" />
        </g>
      );
    }

    let stops: ReactElement[] = [];

    if (isPixelated) {
      const n = palette.length;
      const epsilon = 0.01;
      for (let i = 0; i < n; i++) {
        const start = (i / n) * 100;
        const end = ((i + 1) / n) * 100;
        stops.push(<stop key={`${i}-a`} offset={`${start}%`} stopColor={normalizeColor(palette[i])} />);
        stops.push(<stop key={`${i}-b`} offset={`${end - epsilon}%`} stopColor={normalizeColor(palette[i])} />);
        if (i < n - 1) {
          stops.push(<stop key={`${i}-c`} offset={`${end}%`} stopColor={normalizeColor(palette[i + 1])} />);
        }
      }
    } else {
      const n = palette.length;
      stops = palette.map((col, i) => {
        const pct = n > 1 ? (i / (n - 1)) * 100 : 0;
        return <stop key={i} offset={`${pct}%`} stopColor={normalizeColor(col)} />;
      });
    }

    return (
      <g id="Background">
        <defs>
          <linearGradient id={gradId} x1={coords.x1} y1={coords.y1} x2={coords.x2} y2={coords.y2}>
            {stops}
          </linearGradient>
        </defs>
        <rect x="0" y="0" width={width} height={height} fill={`url(#${gradId})`} />
      </g>
    );
  };

  const handleDownload = async () => {
    if (!svgRef.current) return;

    const cloned = svgRef.current.cloneNode(true) as SVGSVGElement;
    let svgString = new XMLSerializer().serializeToString(cloned);

    const filename = `retropunk-${tokenId}-bg${bgIndex}${transparent ? "-transparent" : ""}`;
    await downloadPunkAsPng(svgString, resolution, filename, transparent);
    setIsDownloadOpen(false);
  };

  const paddedId = tokenId.padStart(5, "0");

  return (
    <div className="border-4 border-orange-500 rounded-xl bg-gray-900 overflow-hidden flex flex-col w-full max-w-md mx-auto">
      {/* Clickable image area - cycles background on click */}
      <div
        className="aspect-square relative overflow-hidden bg-black cursor-pointer"
        onClick={() => handleCycle("next")}
      >
        <svg
          ref={svgRef}
          viewBox={viewBox}
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full block"
          style={{ imageRendering: "pixelated" }}
          preserveAspectRatio="xMidYMid meet"
        >
          {renderBackground()}
          <g id="GeneratedImage" dangerouslySetInnerHTML={{ __html: innerContent }} />
        </svg>
      </div>

      <div className="p-4 bg-black flex flex-col gap-4">
        <div className="flex items-center justify-between text-white">
          <div className="text-2xl font-bold">#{paddedId}</div>
          <div className="flex items-center gap-6">
            <button onClick={(e) => { e.stopPropagation(); handleCycle("prev"); }} className="text-4xl text-orange-500 hover:text-orange-400">←</button>
            <div className="text-xl font-bold">{bgIndex + 1}/{BACKGROUND_OPTIONS.length}</div>
            <button onClick={(e) => { e.stopPropagation(); handleCycle("next"); }} className="text-4xl text-orange-500 hover:text-orange-400">→</button>
          </div>
        </div>

        <div className="flex justify-center gap-12 text-4xl text-orange-500">
          <button onClick={(e) => { e.stopPropagation(); setIsDetailsOpen(true); }}>ℹ️</button>
          <button onClick={(e) => { e.stopPropagation(); setIsDownloadOpen(true); }}>⬇️</button>
          {bgIndex !== currentBg && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                writeContract({
                  address: RETROPUNKS_CONTRACT,
                  abi: RETROPUNKS_ABI,
                  functionName: "setTokenBackground",
                  args: [BigInt(tokenId), BigInt(bgIndex)],
                });
              }}
            >
              {isConfirming ? "⌛" : "⚙️"}
            </button>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {isDetailsOpen && metadata && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setIsDetailsOpen(false)}>
          <div className="bg-gray-900 border-4 border-orange-500 rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-white">RetroPunk #{paddedId}</h2>
              <button onClick={() => setIsDetailsOpen(false)} className="text-3xl text-orange-500">×</button>
            </div>
            <div className="aspect-square w-full mb-8 bg-black">
              <svg viewBox={viewBox} className="w-full h-full" style={{ imageRendering: "pixelated" }}>
                {renderBackground()}
                <g id="GeneratedImage" dangerouslySetInnerHTML={{ __html: innerContent }} />
              </svg>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {metadata.attributes.map((attr: any) => (
                <div key={attr.trait_type} className="bg-black p-4 rounded border border-orange-900 text-white">
                  <strong className="text-orange-400">{attr.trait_type}:</strong> {attr.value}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Download Modal */}
      {isDownloadOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setIsDownloadOpen(false)}>
          <div className="bg-gray-900 border-4 border-orange-500 rounded-xl p-8 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-white">Download</h2>
              <button onClick={() => setIsDownloadOpen(false)} className="text-3xl text-orange-500">×</button>
            </div>
            <div className="space-y-6">
              <select value={resolution} onChange={(e) => setResolution(Number(e.target.value))} className="w-full bg-black border border-orange-500 rounded px-4 py-2 text-white">
                <option value={512}>512x512</option>
                <option value={1024}>1024x1024</option>
                <option value={2048}>2048x2048</option>
              </select>
              <label className="flex items-center gap-3 text-white">
                <input type="checkbox" checked={transparent} onChange={(e) => setTransparent(e.target.checked)} className="w-5 h-5" />
                Transparent Background
              </label>
              <button onClick={handleDownload} className="w-full bg-orange-500 text-black font-bold py-4 rounded hover:bg-orange-400">
                Download PNG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PunkCard;