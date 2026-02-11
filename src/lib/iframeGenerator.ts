/**
 * Generates srcdoc HTML for the NFT iframe display.
 * Injects character content from token metadata and adds postMessage API for background control.
 */

const DEFAULT_IMAGE_PLACEHOLDER =
	'<image href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAB5UlEQVR4AeyXMVLEMAxFBcfgGKSg3YqOO3CUPcp2HICOaiu6HACogZKCA4B/Es06GUxsfTmBmezkj2xHsvTknWT3XP75ZwNY+wC3E9hOgOzA9hUiG0iHbydAt5DcwOMEvkINFoUw/vIA4KsgdmAAuq43FyIWhZq7+GCpiwGgEnsFWwC6zmnXtZCmaQTS+ZyN4rv95vxT9y0Aqb1WWacB0HWobVuBlqagAZYueJqPBkDXoZvrnZRoWoh1TgNYE3vF0QDa9dKCrHHTPAUA09C/MXcDeHp+kVgpvNgH45Rf7robQG5Cb78SgO6NGb1BR7XcPb4KtLu6FGh0M5rAB4IPFN0yDUsATAlqB7kB7G93Ar1/fAokiQ98IPhACbfsZTeA7IzOjsUA7ZsI5FyHebtiAHOmSoElAGehBiiY03X/cBTotNKP9oejQP1MunE813XWlgCwuarEuwHgFCCtcj88lVJz+EJ632rdAKwFsHFuAKW/Lkv9U6BuAKkEtddpALwTIC0UT5ocqT9raQC2ADbeHUCfPnOWLVzj3QF046UsDaD/D/R7n1t45I+3O5QbOvKjAUa7rTBxAxidxKH/HaRd/skGVnQdCkP75QZgL4GLrAmA7v4mrvIhuibAkKKu2QDq9nd+928AAAD//0m3XPsAAAAGSURBVAMAs7DEJZhpsgcAAAAASUVORK5CYII=" width="48" height="48" x="0" y="0" />';

function getPostMessageScript(cardId: string): string {
	const escapedId = JSON.stringify(cardId);
	return `var CARD_ID=${escapedId};window.addEventListener("message",function(e){var d=e.data;if(!d||typeof d!=="object")return;if(d.type==="cycleNext"){cycleNextBackground();}if(d.type==="cyclePrev"){cyclePrevBackground();}if(d.type==="setBackground"&&typeof d.index==="number"){currentIndex=Math.max(0,Math.min(d.index,BACKGROUNDS.length-1));requestAnimationFrame(updateVisuals);notifyParent();}if(d.type==="getSvg"){var svg=document.querySelector("#svg-content svg");var str=svg?new XMLSerializer().serializeToString(svg):"";try{e.source.postMessage({type:"svgResult",requestId:d.requestId,svg:str},"*")}catch(_){}}});function notifyParent(){try{if(window.parent&&window.parent!==window)window.parent.postMessage({type:"backgroundChange",cardId:CARD_ID,index:currentIndex},"*")}catch(_){}};var _cycleNext=cycleNextBackground;cycleNextBackground=function(){_cycleNext();notifyParent()};var _cyclePrev=cyclePrevBackground;cyclePrevBackground=function(){_cyclePrev();notifyParent()};document.addEventListener("keydown",function(e){if([" ","Enter","ArrowRight"].indexOf(e.key)!==-1)cycleNextBackground();if(e.key==="ArrowLeft")cyclePrevBackground();});document.addEventListener("click",cycleNextBackground);`;
}

export const IFRAME_BACKGROUND_COUNT = 19;

/**
 * Builds the srcdoc HTML string for the iframe.
 * @param innerCharacterContent - Inner HTML for the GeneratedImage group (from parseTokenURI)
 * @param initialBgIndex - Starting background index (0-based) - NFT's on-chain background
 * @param cardId - Unique ID (tokenId) so postMessage updates only the matching card
 */
export function buildIframeSrcdoc(
	innerCharacterContent: string,
	initialBgIndex: number,
	cardId: string
): string {
	const safeContent =
		innerCharacterContent?.trim() || DEFAULT_IMAGE_PLACEHOLDER;
	const safeIndex = Math.max(
		0,
		Math.min(Math.floor(initialBgIndex), IFRAME_BACKGROUND_COUNT - 1)
	);

	const scriptInit = `let currentIndex = ${safeIndex};`;
	const postMsgScript = getPostMessageScript(cardId);

	const html = getIframeTemplate()
		.replace(
			/<g id="GeneratedImage">[\s\S]*?<\/g>/,
			`<g id="GeneratedImage">${safeContent}</g>`
		)
		.replace("let currentIndex = 0;", scriptInit)
		.replace("initBackgroundSystem();", `${postMsgScript}initBackgroundSystem();`);

	return html;
}

function getIframeTemplate(): string {
	// Inline the iframe template - loaded at build time via raw string
	// This mirrors extra/iframe-srcdoc.html with the structure needed for replacement
	return `<!doctype html>
<html>
	<head>
		<meta charset="UTF-8" />
		<style>
			body { overflow: hidden; margin: 0; cursor: pointer; }
			svg { max-width: 100vw; max-height: 100vh; width: 100%; }
			image, img { image-rendering: -moz-crisp-edges; image-rendering: -webkit-optimize-contrast; image-rendering: crisp-edges; image-rendering: pixelated; }
		</style>
	</head>
	<body>
		<div id="svg-content">
			<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 48 48">
				<g id="Background"></g>
				<g id="GeneratedImage">
					<image href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAB5UlEQVR4AeyXMVLEMAxFBcfgGKSg3YqOO3CUPcp2HICOaiu6HACogZKCA4B/Es06GUxsfTmBmezkj2xHsvTknWT3XP75ZwNY+wC3E9hOgOzA9hUiG0iHbydAt5DcwOMEvkINFoUw/vIA4KsgdmAAuq43FyIWhZq7+GCpiwGgEnsFWwC6zmnXtZCmaQTS+ZyN4rv95vxT9y0Aqb1WWacB0HWobVuBlqagAZYueJqPBkDXoZvrnZRoWoh1TgNYE3vF0QDa9dKCrHHTPAUA09C/MXcDeHp+kVgpvNgH45Rf7robQG5Cb78SgO6NGb1BR7XcPb4KtLu6FGh0M5rAB4IPFN0yDUsATAlqB7kB7G93Ar1/fAokiQ98IPhACbfsZTeA7IzOjsUA7ZsI5FyHebtiAHOmSoElAGehBiiY03X/cBTotNKP9oejQP1MunE813XWlgCwuarEuwHgFCCtcj88lVJz+EJ632rdAKwFsHFuAKW/Lkv9U6BuAKkEtddpALwTIC0UT5ocqT9raQC2ADbeHUCfPnOWLVzj3QF046UsDaD/D/R7n1t45I+3O5QbOvKjAUa7rTBxAxidxKH/HaRd/skGVnQdCkP75QZgL4GLrAmA7v4mrvIhuibAkKKu2QDq9nd+928AAAD//0m3XPsAAAAGSURBVAMAs7DEJZhpsgcAAAAASUVORK5CYII=" width="48" height="48" x="0" y="0" />
				</g>
			</svg>
		</div>
		<script>
			const BG_TYPES = { None: 0, Image: 1, Solid: 2, S_Vertical: 3, P_Vertical: 4, S_Horizontal: 5, P_Horizontal: 6, S_Down: 7, P_Down: 8, S_Up: 9, P_Up: 10, Radial: 11 };
			const BACKGROUNDS = [
				{ name: "Default", layerType: 2, palette: ["#b5b5b5"] },
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
			const backgroundElement = document.getElementById("Background");
			let currentIndex = 0;
			let bgRect = null;
			let bgImage = null;
			function normalizeColor(col) {
				if (!col) return "#000000ff";
				let s = String(col).trim();
				if (!s.startsWith("#")) s = "#" + s;
				if (s.length === 4) s = "#" + s[1] + s[1] + s[2] + s[2] + s[3] + s[3];
				return s.length === 7 ? s + "ff" : s.toLowerCase();
			}
			function getCoords(type) {
				if ([3, 4].includes(type)) return { x1: "0", y1: "0", x2: "0", y2: "1" };
				if ([5, 6].includes(type)) return { x1: "0", y1: "0", x2: "1", y2: "0" };
				if ([7, 8].includes(type)) return { x1: "0", y1: "0", x2: "1", y2: "1" };
				if ([9, 10].includes(type)) return { x1: "0", y1: "1", x2: "1", y2: "0" };
				return { x1: "0", y1: "0", x2: "0", y2: "1" };
			}
			function createSvgElement(tag, attrs) {
				const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
				for (const k in attrs || {}) el.setAttribute(k, attrs[k]);
				return el;
			}
			function initBackgroundSystem() {
				backgroundElement.innerHTML = "";
				const defs = createSvgElement("defs", {});
				BACKGROUNDS.forEach(function(bg, idx) {
					if (bg.layerType < 3) return;
					bg._id = "grad-" + idx;
					const palette = (bg.palette || []).map(normalizeColor);
					const n = palette.length;
					const grad = bg.layerType === BG_TYPES.Radial ? createSvgElement("radialGradient", { id: bg._id, cx: "50%", cy: "50%", r: "70%" }) : createSvgElement("linearGradient", Object.assign({ id: bg._id }, getCoords(bg.layerType)));
					const isPixel = [4, 6, 8, 10].includes(bg.layerType);
					palette.forEach(function(color, i) {
						if (isPixel) {
							grad.appendChild(createSvgElement("stop", { offset: (i / n) * 100 + "%", "stop-color": color }));
							grad.appendChild(createSvgElement("stop", { offset: ((i + 1) / n) * 100 - 0.01 + "%", "stop-color": color }));
						} else {
							grad.appendChild(createSvgElement("stop", { offset: (i / (n - 1 || 1)) * 100 + "%", "stop-color": color }));
						}
					});
					defs.appendChild(grad);
				});
				backgroundElement.appendChild(defs);
				bgRect = createSvgElement("rect", { width: 48, height: 48, fill: "transparent" });
				bgImage = createSvgElement("image", { width: 48, height: 48, preserveAspectRatio: "none", style: "display:none" });
				backgroundElement.appendChild(bgRect);
				backgroundElement.appendChild(bgImage);
				updateVisuals();
			}
			function updateVisuals() {
				const bg = BACKGROUNDS[currentIndex];
				if (!bg) return;
				if (bg.layerType === BG_TYPES.Image && bg.imageURL) {
					let url = bg.imageURL.trim();
					if (!url.startsWith("data:image") && !url.startsWith("http")) url = "data:image/png;base64," + url;
					bgRect.style.display = "none";
					bgImage.style.display = "block";
					bgImage.setAttribute("href", url);
					bgImage.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", url);
				} else {
					bgImage.style.display = "none";
					bgRect.style.display = "block";
					bgRect.setAttribute("fill", bg._id ? "url(#" + bg._id + ")" : bg.palette[0] || "transparent");
				}
			}
			function cycleNextBackground() {
				currentIndex = (currentIndex + 1) % BACKGROUNDS.length;
				requestAnimationFrame(updateVisuals);
			}
			function cyclePrevBackground() {
				currentIndex = (currentIndex - 1 + BACKGROUNDS.length) % BACKGROUNDS.length;
				requestAnimationFrame(updateVisuals);
			}
			// Removed: document.addEventListener("keydown",
			// Placeholder - replaced by postMessage script
			initBackgroundSystem();
		</script>
	</body>
</html>`;
}
