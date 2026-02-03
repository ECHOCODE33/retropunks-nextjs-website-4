// src/lib/svgGenerator.ts
// SVG generation utilities for RetroPunks NFTs
// Generates complete HTML documents for iframe srcdoc attribute

import {
  BACKGROUNDS,
  TOTAL_BACKGROUNDS,
  BG_TYPES,
  getGradientCoords,
  type BackgroundEntry,
} from "./backgrounds";

const VIEWBOX_SIZE = 48; // Standard viewBox is 48x48 for RetroPunks

/**
 * Generates SVG background element (gradient or solid fill)
 */
export function generateBackgroundSVG(
  backgroundIndex: number,
  gradientId: string = "bg-gradient"
): string {
  if (backgroundIndex < 0 || backgroundIndex >= BACKGROUNDS.length) {
    return `<rect x="0" y="0" width="${VIEWBOX_SIZE}" height="${VIEWBOX_SIZE}" fill="#638596" />`;
  }

  const bg = BACKGROUNDS[backgroundIndex];
  const { palette, layerType } = bg;

  // Solid color
  if (layerType === BG_TYPES.Solid) {
    return `<rect x="0" y="0" width="${VIEWBOX_SIZE}" height="${VIEWBOX_SIZE}" fill="${palette[0]}" />`;
  }

  // Radial gradient
  if (layerType === BG_TYPES.Radial) {
    const stops = palette
      .map((color, i) => {
        const offset = (i / (palette.length - 1)) * 100;
        return `<stop offset="${offset.toFixed(4)}%" stop-color="${color}" />`;
      })
      .join("");

    return `
      <defs>
        <radialGradient id="${gradientId}" cx="50%" cy="50%" r="70%">
          ${stops}
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="${VIEWBOX_SIZE}" height="${VIEWBOX_SIZE}" fill="url(#${gradientId})" />
    `;
  }

  // Linear gradients (smooth or pixelated)
  const coords = getGradientCoords(layerType);
  const isPixelated =
    layerType === BG_TYPES.P_Vertical ||
    layerType === BG_TYPES.P_Horizontal ||
    layerType === BG_TYPES.P_Down ||
    layerType === BG_TYPES.P_Up;

  let stops = "";

  if (isPixelated) {
    // Pixelated: discrete color bands with sharp transitions
    const bandSize = 100 / palette.length;
    palette.forEach((color, i) => {
      const startOffset = (i * bandSize).toFixed(4);
      const endOffset = ((i + 1) * bandSize - 0.0005).toFixed(4);
      const nextStartOffset = ((i + 1) * bandSize).toFixed(4);

      // Add color band
      stops += `<stop offset="${startOffset}%" stop-color="${color}" />`;
      stops += `<stop offset="${endOffset}%" stop-color="${color}" />`;

      // Add transition to next color (if not last)
      if (i < palette.length - 1) {
        stops += `<stop offset="${nextStartOffset}%" stop-color="${palette[i + 1]}" />`;
      }
    });
  } else {
    // Smooth: even distribution
    stops = palette
      .map((color, i) => {
        const offset = (i / (palette.length - 1)) * 100;
        return `<stop offset="${offset.toFixed(4)}%" stop-color="${color}" />`;
      })
      .join("");
  }

  return `
    <defs>
      <linearGradient id="${gradientId}" x1="${coords.x1}" y1="${coords.y1}" x2="${coords.x2}" y2="${coords.y2}">
        ${stops}
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="${VIEWBOX_SIZE}" height="${VIEWBOX_SIZE}" fill="url(#${gradientId})" />
  `;
}

/**
 * Generates complete HTML document for iframe srcdoc
 * This includes the SVG, JavaScript for background cycling, and postMessage communication
 */
export function generateFullSVG(
  imageDataUrl: string,
  initialBackgroundIndex: number = 0,
  tokenId: string = "0"
): string {
  const backgroundSVG = generateBackgroundSVG(
    initialBackgroundIndex,
    `bg-gradient-${tokenId}`
  );

  // Generate the colors array for JavaScript
  const colorsArray = JSON.stringify(
    BACKGROUNDS.map((bg, idx) => ({
      index: idx,
      name: bg.name,
      palette: bg.palette,
      layerType: bg.layerType,
    }))
  );

  const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            overflow: hidden;
            margin: 0;
            padding: 0;
        }
        svg {
            max-width: 100vw;
            max-height: 100vh;
            width: 100%;
            height: 100%;
        }
        img {
            width: 100%;
            height: 100%;
            image-rendering: optimizeSpeed;
            image-rendering: -moz-crisp-edges;
            image-rendering: -o-crisp-edges;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: optimize-contrast;
            image-rendering: crisp-edges;
            image-rendering: pixelated;
            -ms-interpolation-mode: nearest-neighbor;
        }
    </style>
</head>
<body onkeydown="handleKeyPress(event)" onclick="handleClick(event)">
    <div style="height: 100%" id="svg-content-retropunks">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}">
            <g id="Background">
                ${backgroundSVG}
            </g>
            <g id="GeneratedImage">
                <foreignObject width="${VIEWBOX_SIZE}" height="${VIEWBOX_SIZE}">
                    <img xmlns="http://www.w3.org/1999/xhtml" src="${imageDataUrl}" width="100%" height="100%" />
                </foreignObject>
            </g>
        </svg>
    </div>

    <script>
        const colors = ${colorsArray};
        const VIEWBOX_SIZE = ${VIEWBOX_SIZE};
        const svgElement = document.getElementById('svg-content-retropunks').getElementsByTagName('svg')[0];
        let colorIndex = ${initialBackgroundIndex};

        // Get current background ID from SVG
        function getCurrentBackgroundId() {
            return colorIndex;
        }

        // Clear existing background gradients/elements
        function clearBackgroundGroup() {
            const bgGroup = svgElement.getElementById('Background');
            if (bgGroup) {
                bgGroup.innerHTML = '';
            }
        }

        // Render background entry at specific index
        function renderBackgroundEntry(index) {
            clearBackgroundGroup();
            const bgGroup = svgElement.getElementById('Background');
            if (!bgGroup) return;

            if (index < 0 || index >= colors.length) {
                bgGroup.innerHTML = '<rect x="0" y="0" width="' + VIEWBOX_SIZE + '" height="' + VIEWBOX_SIZE + '" fill="#638596" />';
                return;
            }

            const bg = colors[index];
            const gradientId = 'bg-gradient-${tokenId}';

            // Solid color
            if (bg.layerType === 2) {
                bgGroup.innerHTML = '<rect x="0" y="0" width="' + VIEWBOX_SIZE + '" height="' + VIEWBOX_SIZE + '" fill="' + bg.palette[0] + '" />';
                return;
            }

            // Radial gradient
            if (bg.layerType === 11) {
                let stops = '';
                bg.palette.forEach((color, i) => {
                    const offset = (i / (bg.palette.length - 1)) * 100;
                    stops += '<stop offset="' + offset.toFixed(4) + '%" stop-color="' + color + '" />';
                });
                bgGroup.innerHTML = '<defs><radialGradient id="' + gradientId + '" cx="50%" cy="50%" r="70%">' + stops + '</radialGradient></defs>' +
                    '<rect x="0" y="0" width="' + VIEWBOX_SIZE + '" height="' + VIEWBOX_SIZE + '" fill="url(#' + gradientId + ')" />';
                return;
            }

            // Linear gradients
            const coords = getGradientCoords(bg.layerType);
            const isPixelated = [4, 6, 8, 10].includes(bg.layerType);
            let stops = '';

            if (isPixelated) {
                const bandSize = 100 / bg.palette.length;
                bg.palette.forEach((color, i) => {
                    const startOffset = (i * bandSize).toFixed(4);
                    const endOffset = ((i + 1) * bandSize - 0.0005).toFixed(4);
                    const nextStartOffset = ((i + 1) * bandSize).toFixed(4);

                    stops += '<stop offset="' + startOffset + '%" stop-color="' + color + '" />';
                    stops += '<stop offset="' + endOffset + '%" stop-color="' + color + '" />';

                    if (i < bg.palette.length - 1) {
                        stops += '<stop offset="' + nextStartOffset + '%" stop-color="' + bg.palette[i + 1] + '" />';
                    }
                });
            } else {
                bg.palette.forEach((color, i) => {
                    const offset = (i / (bg.palette.length - 1)) * 100;
                    stops += '<stop offset="' + offset.toFixed(4) + '%" stop-color="' + color + '" />';
                });
            }

            bgGroup.innerHTML = '<defs><linearGradient id="' + gradientId + '" x1="' + coords.x1 + '" y1="' + coords.y1 + '" x2="' + coords.x2 + '" y2="' + coords.y2 + '">' + stops + '</linearGradient></defs>' +
                '<rect x="0" y="0" width="' + VIEWBOX_SIZE + '" height="' + VIEWBOX_SIZE + '" fill="url(#' + gradientId + ')" />';
        }

        // Get gradient coordinates based on layer type
        function getGradientCoords(layerType) {
            switch (layerType) {
                case 3:  // S_Vertical
                case 4:  // P_Vertical
                    return { x1: "0", y1: "0", x2: "0", y2: "1" };
                case 5:  // S_Horizontal
                case 6:  // P_Horizontal
                    return { x1: "0", y1: "0", x2: "1", y2: "0" };
                case 7:  // S_Down
                case 8:  // P_Down
                    return { x1: "0", y1: "0", x2: "1", y2: "1" };
                case 9:  // S_Up
                case 10: // P_Up
                    return { x1: "0", y1: "1", x2: "1", y2: "0" };
                default:
                    return { x1: "0", y1: "0", x2: "0", y2: "1" };
            }
        }

        // Cycle background (forward or backward)
        function cycleBackground(forward) {
            if (forward) {
                colorIndex = (colorIndex + 1) % colors.length;
            } else {
                colorIndex = (colorIndex - 1 + colors.length) % colors.length;
            }
            renderBackgroundEntry(colorIndex);
            postToParent();
        }

        // Post current background index to parent
        function postToParent() {
            if (window && window.parent) {
                window.parent.postMessage(
                    {
                        type: 'current-background',
                        backgroundIndex: colorIndex + "/" + (colors.length - 1),
                        iframeId: window.frameElement?.id || 'unknown'
                    },
                    '*'
                );
            }
        }

        // Handle click events
        function handleClick(event) {
            cycleBackground(true);
        }

        // Handle keyboard events
        function handleKeyPress(event) {
            if ([' ', 'Enter', 'ArrowRight', 'ArrowDown', '+', '='].includes(event.key)) {
                cycleBackground(true);
            }
            if (['Backspace', 'ArrowLeft', 'ArrowUp', '-', '_', 'b'].includes(event.key)) {
                cycleBackground(false);
            }
        }

        // Listen for messages from parent window
        window.addEventListener('message', function(event) {
            if (event.data.type === 'background-next') {
                cycleBackground(true);
            }
            if (event.data.type === 'background-prev') {
                cycleBackground(false);
            }
        });

        // Initial post to parent
        postToParent();
    </script>
</body>
</html>`;

  return html;
}

/**
 * Escapes HTML for use in srcdoc attribute
 */
export function escapeHTML(html: string): string {
  return html
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Gets display text for background (e.g., "0/18", "15/18")
 */
export function getBackgroundDisplay(index: number): string {
  return `${index}/${TOTAL_BACKGROUNDS - 1}`;
}