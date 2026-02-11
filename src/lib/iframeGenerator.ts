// ============================================================================
// IFRAME GENERATOR FOR RETROPUNKS NFT DISPLAY
// ============================================================================
//
// This module generates self-contained HTML iframes for displaying RetroPunks
// NFTs with interactive background cycling capabilities.
//
// The iframe:
// - Displays the NFT character as SVG
// - Allows cycling through 19 different backgrounds
// - Communicates with parent via postMessage
// - Is fully sandboxed for security
//
// ============================================================================

// ============================================================================
// CONSTANTS
// ============================================================================

/** Number of available backgrounds for standard (non-Special) NFTs */
export const IFRAME_BACKGROUND_COUNT = 19;

/** Default placeholder image shown when NFT content fails to load */
const DEFAULT_IMAGE_PLACEHOLDER =
	'<image href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAB5UlEQVR4AeyXMVLEMAxFBcfgGKSg3YqOO3CUPcp2HICOaiu6HACogZKCA4B/Es06GUxsfTmBmezkj2xHsvTknWT3XP75ZwNY+wC3E9hOgOzA9hUiG0iHbydAt5DcwOMEvkINFoUw/vIA4KsgdmAAuq43FyIWhZq7+GCpiwGgEnsFWwC6zmnXtZCmaQTS+ZyN4rv95vxT9y0Aqb1WWacB0HWobVuBlqagAZYueJqPBkDXoZvrnZRoWoh1TgNYE3vF0QDa9dKCrHHTPAUA09C/MXcDeHp+kVgpvNgH45Rf7robQG5Cb78SgO6NGb1BR7XcPb4KtLu6FGh0M5rAB4IPFN0yDUsATAlqB7kB7G93Ar1/fAokiQ98IPhACbfsZTeA7IzOjsUA7ZsI5FyHebtiAHOmSoElAGehBiiY03X/cBTotNKP9oejQP1MunE813XWlgCwuarEuwHgFCCtcj88lVJz+EJ632rdAKwFsHFuAKW/Lkv9U6BuAKkEtddpALwTIC0UT5ocqT9raQC2ADbeHUCfPnOWLVzj3QF046UsDaD/D/R7n1t45I+3O5QbOvKjAUa7rTBxAxidxKH/HaRd/skGVnQdCkP75QZgL4GLrAmA7v4mrvIhuibAkKKu2QDq9nd+928AAAD//0m3XPsAAAAGSURBVAMAs7DEJZhpsgcAAAAASUVORK5CYII=" width="48" height="48" x="0" y="0" />';

// ============================================================================
// POST MESSAGE SCRIPT GENERATION
// ============================================================================

/**
 * Generates the postMessage communication script for the iframe
 *
 * This script:
 * - Listens for messages from the parent window
 * - Handles background cycling commands (cycleNext, cyclePrev)
 * - Sends background change notifications back to parent
 * - Handles SVG extraction requests
 * - Adds keyboard navigation (Arrow keys, Space, Enter)
 * - Adds click-to-cycle functionality
 *
 * @param cardId - Unique identifier for this card (tokenId)
 * @returns JavaScript code as string to inject into iframe
 */
function getPostMessageScript(cardId: string): string {
	const escapedId = JSON.stringify(cardId);

	return `
    var CARD_ID=${escapedId};
    
    // Listen for messages from parent window
    window.addEventListener("message", function(e) {
      var d = e.data;
      if (!d || typeof d !== "object") return;
      
      // Handle background cycling commands
      if (d.type === "cycleNext") {
        cycleNextBackground();
      }
      if (d.type === "cyclePrev") {
        cyclePrevBackground();
      }
      
      // Handle direct background index setting
      if (d.type === "setBackground" && typeof d.index === "number") {
        currentIndex = Math.max(0, Math.min(d.index, BACKGROUNDS.length - 1));
        requestAnimationFrame(updateVisuals);
        notifyParent();
      }
      
      // Handle SVG extraction request
      if (d.type === "getSvg") {
        var svg = document.querySelector("#svg-content svg");
        var str = svg ? new XMLSerializer().serializeToString(svg) : "";
        try {
          e.source.postMessage({
            type: "svgResult",
            requestId: d.requestId,
            svg: str
          }, "*");
        } catch(_) {}
      }
    });
    
    // Notify parent of background changes
    function notifyParent() {
      try {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({
            type: "backgroundChange",
            cardId: CARD_ID,
            index: currentIndex
          }, "*");
        }
      } catch(_) {}
    }
    
    // Wrap existing functions to notify parent
    var _cycleNext = cycleNextBackground;
    cycleNextBackground = function() {
      _cycleNext();
      notifyParent();
    };
    
    var _cyclePrev = cyclePrevBackground;
    cyclePrevBackground = function() {
      _cyclePrev();
      notifyParent();
    };
    
    // Keyboard navigation
    document.addEventListener("keydown", function(e) {
      if ([" ", "Enter", "ArrowRight"].indexOf(e.key) !== -1) {
        cycleNextBackground();
      }
      if (e.key === "ArrowLeft") {
        cyclePrevBackground();
      }
    });
    
    // Click to cycle
    document.addEventListener("click", cycleNextBackground);
  `;
}

// ============================================================================
// IFRAME SRCDOC BUILDER
// ============================================================================

/**
 * Builds the complete HTML document for the iframe srcdoc attribute
 *
 * This creates a self-contained HTML page with:
 * - The NFT character SVG
 * - Background system with 19 different backgrounds
 * - Interactive cycling functionality
 * - PostMessage communication with parent
 *
 * @param innerCharacterContent - SVG content for the character (from parseTokenURI)
 * @param initialBgIndex - Starting background index (0-18)
 * @param cardId - Unique card identifier for postMessage targeting
 * @returns Complete HTML string for iframe srcdoc
 */
export function buildIframeSrcdoc(innerCharacterContent: string, initialBgIndex: number, cardId: string): string {
	// Sanitize and validate inputs
	const safeContent = innerCharacterContent?.trim() || DEFAULT_IMAGE_PLACEHOLDER;
	const safeIndex = Math.max(0, Math.min(Math.floor(initialBgIndex), IFRAME_BACKGROUND_COUNT - 1));

	// Generate initialization and communication scripts
	const scriptInit = `let currentIndex = ${safeIndex};`;
	const postMsgScript = getPostMessageScript(cardId);

	// Get base template and inject content
	const html = getIframeTemplate()
		.replace(/<g id="GeneratedImage">[\s\S]*?<\/g>/, `<g id="GeneratedImage">${safeContent}</g>`)
		.replace("let currentIndex = 0;", scriptInit)
		.replace("initBackgroundSystem();", `${postMsgScript}initBackgroundSystem();`);

	return html;
}

// ============================================================================
// IFRAME HTML TEMPLATE
// ============================================================================

/**
 * Returns the complete HTML template for the iframe
 *
 * This template includes:
 * - SVG structure with Background and GeneratedImage groups
 * - Background system with 19 gradient/solid backgrounds
 * - Cycling logic
 * - Pixel-perfect rendering CSS
 *
 * @returns HTML template string
 */
function getIframeTemplate(): string {
	return `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <style>
      /* Prevent scrolling and set pixel-perfect rendering */
      body {
        overflow: hidden;
        margin: 0;
        cursor: pointer;
      }
      svg {
        max-width: 100vw;
        max-height: 100vh;
        width: 100%;
      }
      /* Pixel-perfect image rendering for retro aesthetic */
      image, img {
        image-rendering: -moz-crisp-edges;
        image-rendering: -webkit-optimize-contrast;
        image-rendering: crisp-edges;
        image-rendering: pixelated;
      }
    </style>
  </head>
  <body>
    <div id="svg-content">
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 48 48">
        <!-- Background layer (generated dynamically) -->
        <g id="Background"></g>
        
        <!-- Character layer (injected from NFT data) -->
        <g id="GeneratedImage">
          ${DEFAULT_IMAGE_PLACEHOLDER}
        </g>
      </svg>
    </div>

    <script>
      // Background type enumeration
      const BG_TYPES = {
        None: 0,
        Image: 1,
        Solid: 2,
        S_Vertical: 3,      // Smooth vertical gradient
        P_Vertical: 4,      // Pixelated vertical gradient
        S_Horizontal: 5,    // Smooth horizontal gradient
        P_Horizontal: 6,    // Pixelated horizontal gradient
        S_Down: 7,          // Smooth diagonal (top-left to bottom-right)
        P_Down: 8,          // Pixelated diagonal
        S_Up: 9,            // Smooth diagonal (bottom-left to top-right)
        P_Up: 10,           // Pixelated diagonal
        Radial: 11          // Radial gradient
      };

      // Background definitions (19 total)
      const BACKGROUNDS = [
        { name: "Default", layerType: 2, palette: ["#e8eded"] },
        { name: "Solid Black", layerType: 2, palette: ["#000000"] },
        { name: "Smooth Vertical", layerType: 3, palette: ["#000000", "#ffffff"] },
        { name: "Pixelated Vertical", layerType: 4, palette: ["#000000ff", "#020202ff", "#070707ff", "#0f0f0fff", "#161616ff", "#1e1e1eff", "#272727ff", "#333333ff", "#404040ff", "#4e4e4eff", "#5e5e5eff", "#6e6e6eff", "#808080ff", "#919191ff", "#a2a2a2ff", "#b3b3b3ff", "#c3c3c3ff", "#d2d2d2ff", "#dfdfdfff", "#eaeaeaff", "#f3f3f3ff", "#fafafaff", "#fefefeff", "#ffffffff"] },
        { name: "Smooth Vertical Inverse", layerType: 3, palette: ["#ffffff", "#000000"] },
        { name: "Pixelated Vertical Inverse", layerType: 4, palette: ["#ffffffff", "#fefefeff", "#fafafaff", "#f3f3f3ff", "#eaeaeaff", "#dfdfdfff", "#d2d2d2ff", "#c3c3c3ff", "#b3b3b3ff", "#a2a2a2ff", "#919191ff", "#808080ff", "#6e6e6eff", "#5e5e5eff", "#4e4e4eff", "#404040ff", "#333333ff", "#272727ff", "#1e1e1eff", "#161616ff", "#0f0f0fff", "#070707ff", "#020202ff", "#000000ff"] },
        { name: "Smooth Horizontal", layerType: 5, palette: ["#000000", "#ffffff"] },
        { name: "Pixelated Horizontal", layerType: 6, palette: ["#000000ff", "#020202ff", "#070707ff", "#0f0f0fff", "#161616ff", "#1e1e1eff", "#272727ff", "#333333ff", "#404040ff", "#4e4e4eff", "#5e5e5eff", "#6e6e6eff", "#808080ff", "#919191ff", "#a2a2a2ff", "#b3b3b3ff", "#c3c3c3ff", "#d2d2d2ff", "#dfdfdfff", "#eaeaeaff", "#f3f3f3ff", "#fafafaff", "#fefefeff", "#ffffffff"] },
        { name: "Smooth Horizontal Inverse", layerType: 5, palette: ["#ffffff", "#000000"] },
        { name: "Pixelated Horizontal Inverse", layerType: 6, palette: ["#ffffffff", "#fefefeff", "#fafafaff", "#f3f3f3ff", "#eaeaeaff", "#dfdfdfff", "#d2d2d2ff", "#c3c3c3ff", "#b3b3b3ff", "#a2a2a2ff", "#919191ff", "#808080ff", "#6e6e6eff", "#5e5e5eff", "#4e4e4eff", "#404040ff", "#333333ff", "#272727ff", "#1e1e1eff", "#161616ff", "#0f0f0fff", "#070707ff", "#020202ff", "#000000ff"] },
        { name: "Smooth Diagonal", layerType: 7, palette: ["#000000", "#ffffff"] },
        { name: "Pixel Diagonal", layerType: 8, palette: ["#000000ff", "#020202ff", "#070707ff", "#0f0f0fff", "#161616ff", "#1e1e1eff", "#272727ff", "#333333ff", "#404040ff", "#4e4e4eff", "#5e5e5eff", "#6e6e6eff", "#808080ff", "#919191ff", "#a2a2a2ff", "#b3b3b3ff", "#c3c3c3ff", "#d2d2d2ff", "#dfdfdfff", "#eaeaeaff", "#f3f3f3ff", "#fafafaff", "#fefefeff", "#ffffffff"] },
        { name: "Smooth Diagonal Inverse", layerType: 7, palette: ["#ffffff", "#000000"] },
        { name: "Pixel Diagonal Inverse", layerType: 8, palette: ["#ffffffff", "#fefefeff", "#fafafaff", "#f3f3f3ff", "#eaeaeaff", "#dfdfdfff", "#d2d2d2ff", "#c3c3c3ff", "#b3b3b3ff", "#a2a2a2ff", "#919191ff", "#808080ff", "#6e6e6eff", "#5e5e5eff", "#4e4e4eff", "#404040ff", "#333333ff", "#272727ff", "#1e1e1eff", "#161616ff", "#0f0f0fff", "#070707ff", "#020202ff", "#000000ff"] },
        { name: "Smooth Reverse Diagonal", layerType: 9, palette: ["#000000", "#ffffff"] },
        { name: "Pixel Reverse Diagonal", layerType: 10, palette: ["#000000ff", "#020202ff", "#070707ff", "#0f0f0fff", "#161616ff", "#1e1e1eff", "#272727ff", "#333333ff", "#404040ff", "#4e4e4eff", "#5e5e5eff", "#6e6e6eff", "#808080ff", "#919191ff", "#a2a2a2ff", "#b3b3b3ff", "#c3c3c3ff", "#d2d2d2ff", "#dfdfdfff", "#eaeaeaff", "#f3f3f3ff", "#fafafaff", "#fefefeff", "#ffffffff"] },
        { name: "Smooth Reverse Diagonal Inverse", layerType: 9, palette: ["#ffffff", "#000000"] },
        { name: "Pixel Reverse Diagonal Inverse", layerType: 10, palette: ["#ffffffff", "#fefefeff", "#fafafaff", "#f3f3f3ff", "#eaeaeaff", "#dfdfdfff", "#d2d2d2ff", "#c3c3c3ff", "#b3b3b3ff", "#a2a2a2ff", "#919191ff", "#808080ff", "#6e6e6eff", "#5e5e5eff", "#4e4e4eff", "#404040ff", "#333333ff", "#272727ff", "#1e1e1eff", "#161616ff", "#0f0f0fff", "#070707ff", "#020202ff", "#000000ff"] },
        { name: "Radial", layerType: 11, palette: ["#ffffff", "#000000"] }
      ];

      // DOM references
      const backgroundElement = document.getElementById("Background");
      let currentIndex = 0;
      let bgRect = null;
      let bgImage = null;

      /**
       * Normalizes color format to 8-character hex (#RRGGBBAA)
       */
      function normalizeColor(col) {
        if (!col) return "#000000ff";
        let s = String(col).trim();
        if (!s.startsWith("#")) s = "#" + s;
        
        // Expand shorthand (#RGB -> #RRGGBB)
        if (s.length === 4) {
          s = "#" + s[1] + s[1] + s[2] + s[2] + s[3] + s[3];
        }
        
        // Add alpha channel if missing
        return s.length === 7 ? s + "ff" : s.toLowerCase();
      }

      /**
       * Gets gradient coordinates based on gradient type
       */
      function getCoords(type) {
        if ([3, 4].includes(type)) {
          return { x1: "0", y1: "0", x2: "0", y2: "1" }; // Vertical
        }
        if ([5, 6].includes(type)) {
          return { x1: "0", y1: "0", x2: "1", y2: "0" }; // Horizontal
        }
        if ([7, 8].includes(type)) {
          return { x1: "0", y1: "0", x2: "1", y2: "1" }; // Diagonal down
        }
        if ([9, 10].includes(type)) {
          return { x1: "0", y1: "1", x2: "1", y2: "0" }; // Diagonal up
        }
        return { x1: "0", y1: "0", x2: "0", y2: "1" }; // Default vertical
      }

      /**
       * Creates SVG element with attributes
       */
      function createSvgElement(tag, attrs) {
        const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
        for (const k in attrs || {}) {
          el.setAttribute(k, attrs[k]);
        }
        return el;
      }

      /**
       * Initializes the background system with all gradient definitions
       */
      function initBackgroundSystem() {
        backgroundElement.innerHTML = "";
        const defs = createSvgElement("defs", {});

        // Create gradient definitions for each background
        BACKGROUNDS.forEach(function(bg, idx) {
          if (bg.layerType < 3) return; // Skip non-gradient types

          bg._id = "grad-" + idx;
          const palette = (bg.palette || []).map(normalizeColor);
          const n = palette.length;

          // Create gradient element (linear or radial)
          const grad = bg.layerType === BG_TYPES.Radial
            ? createSvgElement("radialGradient", {
                id: bg._id,
                cx: "50%",
                cy: "50%",
                r: "70%"
              })
            : createSvgElement("linearGradient",
                Object.assign({ id: bg._id }, getCoords(bg.layerType))
              );

          // Pixelated gradients use hard stops between colors
          const isPixel = [4, 6, 8, 10].includes(bg.layerType);

          palette.forEach(function(color, i) {
            if (isPixel) {
              // Hard stop at start of color band
              grad.appendChild(createSvgElement("stop", {
                offset: (i / n) * 100 + "%",
                "stop-color": color
              }));
              // Hard stop at end of color band
              grad.appendChild(createSvgElement("stop", {
                offset: ((i + 1) / n) * 100 - 0.01 + "%",
                "stop-color": color
              }));
            } else {
              // Smooth gradient
              grad.appendChild(createSvgElement("stop", {
                offset: (i / (n - 1 || 1)) * 100 + "%",
                "stop-color": color
              }));
            }
          });

          defs.appendChild(grad);
        });

        backgroundElement.appendChild(defs);

        // Create rect and image elements for displaying backgrounds
        bgRect = createSvgElement("rect", {
          width: 48,
          height: 48,
          fill: "transparent"
        });
        bgImage = createSvgElement("image", {
          width: 48,
          height: 48,
          preserveAspectRatio: "none",
          style: "display:none"
        });

        backgroundElement.appendChild(bgRect);
        backgroundElement.appendChild(bgImage);

        updateVisuals();
      }

      /**
       * Updates the visual display based on current background index
       */
      function updateVisuals() {
        const bg = BACKGROUNDS[currentIndex];
        if (!bg) return;

        // Image backgrounds (currently unused but supported)
        if (bg.layerType === BG_TYPES.Image && bg.imageURL) {
          let url = bg.imageURL.trim();
          if (!url.startsWith("data:image") && !url.startsWith("http")) {
            url = "data:image/png;base64," + url;
          }
          bgRect.style.display = "none";
          bgImage.style.display = "block";
          bgImage.setAttribute("href", url);
          bgImage.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", url);
        } else {
          // Gradient or solid backgrounds
          bgImage.style.display = "none";
          bgRect.style.display = "block";
          const fill = bg._id ? "url(#" + bg._id + ")" : bg.palette[0] || "transparent";
          bgRect.setAttribute("fill", fill);
        }
      }

      /**
       * Cycles to the next background
       */
      function cycleNextBackground() {
        currentIndex = (currentIndex + 1) % BACKGROUNDS.length;
        requestAnimationFrame(updateVisuals);
      }

      /**
       * Cycles to the previous background
       */
      function cyclePrevBackground() {
        currentIndex = (currentIndex - 1 + BACKGROUNDS.length) % BACKGROUNDS.length;
        requestAnimationFrame(updateVisuals);
      }

      // Initialize on load (will be replaced by postMessage script injection)
      initBackgroundSystem();
    </script>
  </body>
</html>`;
}
