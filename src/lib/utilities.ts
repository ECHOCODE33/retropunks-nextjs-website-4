// lib/utilities.ts

// DOMParser and XMLSerializer are available globally in modern browsers and can be polyfilled for Node.js environments
declare const DOMParser: any;
declare const XMLSerializer: any;

export const parseTokenURI = (tokenUri: string) => {
  try {
    const jsonPart = tokenUri.split('data:application/json;base64,')[1];
    const metadata = JSON.parse(atob(jsonPart));
    const fullImage = metadata.image;
    const base64Svg = fullImage.split('data:image/svg+xml;base64,')[1];
    const fullSvgString = atob(base64Svg);

    const parser = new DOMParser();
    const doc = parser.parseFromString(fullSvgString, "image/svg+xml");
    const svg = doc.documentElement;

    if (!svg) throw new Error("Invalid SVG");

    const viewBox = svg.getAttribute("viewBox") || "0 0 48 48";

    const fgGroup = svg.querySelector('g[id="GeneratedImage"]');
    const innerCharacterContent = fgGroup ? fgGroup.innerHTML : svg.innerHTML;

    return { metadata, fullSvgString, innerCharacterContent, viewBox };
  } catch (e) {
    console.error("Error parsing Token URI", e);
    return { metadata: null, innerCharacterContent: '', viewBox: '0 0 48 48' };
  }
};

export const downloadPunkAsPng = async (svgString: string, resolution: number, fileName: string, transparent: boolean = false) => {
  let finalSvg = svgString;

  if (transparent) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, "image/svg+xml");
    const svg = doc.documentElement;

    // Clear background group
    const bgGroup = svg.getElementById("Background");
    if (bgGroup) bgGroup.innerHTML = "";

    // Remove any stray defs or full-size rects
    const defs = svg.querySelector("defs");
    if (defs) svg.removeChild(defs);
    svg.querySelectorAll('rect[width="100%"][height="100%"], rect[width="48"][height="48"]').forEach((r: Element) => r.parentNode?.removeChild(r));

    finalSvg = new XMLSerializer().serializeToString(svg);
  }

  return new Promise<void>((resolve, reject) => {
    const img = new Image();
    const svg64 = btoa(unescape(encodeURIComponent(finalSvg)));
    const b64Start = `data:image/svg+xml;base64,${svg64}`;
    img.src = b64Start;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = resolution;
      canvas.height = resolution;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0, resolution, resolution);
        canvas.toBlob((blob) => {
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
        });
      } else {
        reject(new Error("Canvas context failed"));
      }
    };

    img.onerror = reject;
  });
};