// lib/utilities.ts

declare const DOMParser: {
  new (): { parseFromString(str: string, type: string): Document };
};
declare const XMLSerializer: {
  new (): { serializeToString(node: Node): string };
};

/**
 * Detects Special NFTs that have a built-in background (no separate background layer).
 * These cannot cycle backgrounds.
 */
export function isSpecialNft(metadata: { attributes?: Array<{ trait_type: string; value: string | number }> } | null): boolean {
  if (!metadata?.attributes) return false;
  return metadata.attributes.some(
    (a) =>
      (a.trait_type.toLowerCase() === "type" && String(a.value).toLowerCase() === "special") ||
      (a.trait_type.toLowerCase() === "special" && String(a.value).toLowerCase() === "yes")
  );
}

export const parseTokenURI = (tokenUri: string) => {
  try {
    const jsonPart = tokenUri.split("data:application/json;base64,")[1];
    if (!jsonPart) throw new Error("Invalid token URI format");
    const metadata = JSON.parse(atob(jsonPart));
    const fullImage = metadata?.image;
    if (!fullImage || typeof fullImage !== "string") throw new Error("No image in metadata");
    const base64Svg = fullImage.split("data:image/svg+xml;base64,")[1];
    if (!base64Svg) {
      // Non-SVG image (e.g. Special NFT with built-in background) - return raw image
      return { metadata, innerCharacterContent: "", viewBox: "0 0 48 48", imageDataUrl: fullImage, isSpecial: true };
    }
    const fullSvgString = atob(base64Svg);

    const parser = new DOMParser();
    const doc = parser.parseFromString(fullSvgString, "image/svg+xml");
    const svg = doc.documentElement;

    if (!svg) throw new Error("Invalid SVG");

    const viewBox = svg.getAttribute("viewBox") || "0 0 48 48";
    const fgGroup = svg.querySelector('g[id="GeneratedImage"]');
    const innerCharacterContent = fgGroup ? fgGroup.innerHTML : svg.innerHTML;

    return { metadata, fullSvgString, innerCharacterContent, viewBox, imageDataUrl: null, isSpecial: false };
  } catch (e) {
    console.error("Error parsing Token URI", e);
    return { metadata: null, innerCharacterContent: "", viewBox: "0 0 48 48", imageDataUrl: null, isSpecial: false };
  }
};

/**
 * Formats a birthday/value as DD/MM/YYYY.
 * Handles Unix timestamps (seconds), milliseconds, or date strings.
 */
export function formatBirthday(value: string | number): string {
  if (value == null) return "—";
  const str = String(value).trim();
  const num = parseInt(str, 10);
  let date: Date;
  if (!Number.isNaN(num)) {
    date = num < 1e10 ? new Date(num * 1000) : new Date(num);
  } else {
    date = new Date(str);
  }
  if (Number.isNaN(date.getTime())) return str;
  const d = date.getDate().toString().padStart(2, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

/**
 * Ensures resolution is an integer multiple of 48 for crisp pixel scaling.
 * 48x48 base → 480 (10x), 960 (20x), 1920 (40x) for sharp pixels.
 */
export function snapResolutionTo48(resolution: number): number {
  const base = 48;
  const scale = Math.round(resolution / base);
  const clamped = Math.max(1, Math.min(scale, 64));
  return base * clamped;
}

/**
 * Prepares SVG string for crisp pixel-art export at target resolution.
 * Uses integer multiples of 48, adds pixelated rendering hints for sharp output.
 */
function prepareSvgForExport(
  svgString: string,
  resolution: number,
  transparent: boolean
): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, "image/svg+xml");
  const svg = doc.documentElement;
  if (!svg) return svgString;

  // Use integer multiple of 48 for perfect pixel scaling (48x48 source)
  const res = snapResolutionTo48(resolution);

  if (transparent) {
    const bgGroup = doc.getElementById("Background");
    if (bgGroup) bgGroup.innerHTML = "";
  }

  svg.setAttribute("width", String(res));
  svg.setAttribute("height", String(res));
  svg.setAttribute("shape-rendering", "crispEdges");
  svg.setAttribute(
    "style",
    "image-rendering: pixelated; image-rendering: crisp-edges; image-rendering: -moz-crisp-edges; image-rendering: -webkit-crisp-edges;"
  );

  // Add pixelated rendering to all image elements inside SVG
  const images = doc.querySelectorAll("image");
  images.forEach((img) => {
    img.setAttribute(
      "style",
      (img.getAttribute("style") || "") +
        "image-rendering: pixelated; image-rendering: crisp-edges;"
    );
  });

  return new XMLSerializer().serializeToString(svg);
}

export const downloadPunkAsPng = async (
  svgString: string,
  resolution: number,
  fileName: string,
  transparent: boolean = false
): Promise<void> => {
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
      ctx.imageSmoothingEnabled = false;
      (ctx as CanvasRenderingContext2D & { imageSmoothingQuality?: string }).imageSmoothingQuality = "low";
      ctx.drawImage(img, 0, 0, res, res);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${fileName}.png`;
            a.click();
            URL.revokeObjectURL(url);
            resolve();
          } else {
            reject(new Error("Blob creation failed"));
          }
        },
        "image/png",
        1
      );
    };
    img.onerror = () => reject(new Error("Image load failed"));
  });
};

/**
 * Converts SVG string to PNG data URL for opening in browser.
 * Uses same crisp pixel logic as downloadPunkAsPng.
 */
export const svgToPngDataUrl = async (
  svgString: string,
  resolution: number,
  transparent: boolean = false
): Promise<string> => {
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
      ctx.imageSmoothingEnabled = false;
      (ctx as CanvasRenderingContext2D & { imageSmoothingQuality?: string }).imageSmoothingQuality = "low";
      ctx.drawImage(img, 0, 0, resolution, resolution);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject(new Error("Image load failed"));
  });
};