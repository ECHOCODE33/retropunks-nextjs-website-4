// lib/backgrounds.ts

export const BG_TYPES = {
  None: 0,
  Image: 1,
  Solid: 2,
  S_Vertical: 3,
  P_Vertical: 4,
  S_Horizontal: 5,
  P_Horizontal: 6,
  S_Down: 7,
  P_Down: 8,
  S_Up: 9,
  P_Up: 10,
  Radial: 11,
} as const;

export interface BackgroundOption {
  id: number;
  name: string;
  layerType: number;
  palette?: string[];
}

export const BACKGROUND_OPTIONS: BackgroundOption[] = [
  { id: 0, name: "Rainbow", layerType: BG_TYPES.Image, palette: [] },
  { id: 1, name: "Solid", layerType: BG_TYPES.Solid, palette: ["#b5b5b5"] },
  { id: 2, name: "Smooth Vertical", layerType: BG_TYPES.S_Vertical, palette: ["#000000", "#ffffff"] },
  { id: 3, name: "Pixelated Vertical", layerType: BG_TYPES.P_Vertical, palette: [
    "#000000ff","#020202ff","#070707ff","#0f0f0fff","#161616ff","#1e1e1eff","#272727ff","#333333ff",
    "#404040ff","#4e4e4eff","#5e5e5eff","#6e6e6eff","#808080ff","#919191ff","#a2a2a2ff","#b3b3b3ff",
    "#c3c3c3ff","#d2d2d2ff","#dfdfdfff","#eaeaeaff","#f3f3f3ff","#fafafaff","#fefefeff","#ffffffff"
  ]},
  { id: 4, name: "Smooth Vertical Inverse", layerType: BG_TYPES.S_Vertical, palette: ["#ffffff", "#000000"] },
  { id: 5, name: "Pixelated Vertical Inverse", layerType: BG_TYPES.P_Vertical, palette: [
    "#ffffffff","#fefefeff","#fafafaff","#f3f3f3ff","#eaeaeaff","#dfdfdfff","#d2d2d2ff","#c3c3c3ff",
    "#b3b3b3ff","#a2a2a2ff","#919191ff","#808080ff","#6e6e6eff","#5e5e5eff","#4e4e4eff","#404040ff",
    "#333333ff","#272727ff","#1e1e1eff","#161616ff","#0f0f0fff","#070707ff","#020202ff","#000000ff"
  ]},
  { id: 6, name: "Smooth Horizontal", layerType: BG_TYPES.S_Horizontal, palette: ["#000000", "#ffffff"] },
  { id: 7, name: "Pixelated Horizontal", layerType: BG_TYPES.P_Horizontal, palette: [
    "#000000ff","#020202ff","#070707ff","#0f0f0fff","#161616ff","#1e1e1eff","#272727ff","#333333ff",
    "#404040ff","#4e4e4eff","#5e5e5eff","#6e6e6eff","#808080ff","#919191ff","#a2a2a2ff","#b3b3b3ff",
    "#c3c3c3ff","#d2d2d2ff","#dfdfdfff","#eaeaeaff","#f3f3f3ff","#fafafaff","#fefefeff","#ffffffff"
  ]},
  { id: 8, name: "Smooth Horizontal Inverse", layerType: BG_TYPES.S_Horizontal, palette: ["#ffffff", "#000000"] },
  { id: 9, name: "Pixelated Horizontal Inverse", layerType: BG_TYPES.P_Horizontal, palette: [
    "#ffffffff","#fefefeff","#fafafaff","#f3f3f3ff","#eaeaeaff","#dfdfdfff","#d2d2d2ff","#c3c3c3ff",
    "#b3b3b3ff","#a2a2a2ff","#919191ff","#808080ff","#6e6e6eff","#5e5e5eff","#4e4e4eff","#404040ff",
    "#333333ff","#272727ff","#1e1e1eff","#161616ff","#0f0f0fff","#070707ff","#020202ff","#000000ff"
  ]},
  { id: 10, name: "Smooth Diagonal", layerType: BG_TYPES.S_Down, palette: ["#000000", "#ffffff"] },
  { id: 11, name: "Pixel Diagonal", layerType: BG_TYPES.P_Down, palette: [
    "#000000ff","#020202ff","#070707ff","#0f0f0fff","#161616ff","#1e1e1eff","#272727ff","#333333ff",
    "#404040ff","#4e4e4eff","#5e5e5eff","#6e6e6eff","#808080ff","#919191ff","#a2a2a2ff","#b3b3b3ff",
    "#c3c3c3ff","#d2d2d2ff","#dfdfdfff","#eaeaeaff","#f3f3f3ff","#fafafaff","#fefefeff","#ffffffff"
  ]},
  { id: 12, name: "Smooth Diagonal Inverse", layerType: BG_TYPES.S_Down, palette: ["#ffffff", "#000000"] },
  { id: 13, name: "Pixel Diagonal Inverse", layerType: BG_TYPES.P_Down, palette: [
    "#ffffffff","#fefefeff","#fafafaff","#f3f3f3ff","#eaeaeaff","#dfdfdfff","#d2d2d2ff","#c3c3c3ff",
    "#b3b3b3ff","#a2a2a2ff","#919191ff","#808080ff","#6e6e6eff","#5e5e5eff","#4e4e4eff","#404040ff",
    "#333333ff","#272727ff","#1e1e1eff","#161616ff","#0f0f0fff","#070707ff","#020202ff","#000000ff"
  ]},
  { id: 14, name: "Smooth Reverse Diagonal", layerType: BG_TYPES.S_Up, palette: ["#000000", "#ffffff"] },
  { id: 15, name: "Pixel Reverse Diagonal", layerType: BG_TYPES.P_Up, palette: [
    "#000000ff","#020202ff","#070707ff","#0f0f0fff","#161616ff","#1e1e1eff","#272727ff","#333333ff",
    "#404040ff","#4e4e4eff","#5e5e5eff","#6e6e6eff","#808080ff","#919191ff","#a2a2a2ff","#b3b3b3ff",
    "#c3c3c3ff","#d2d2d2ff","#dfdfdfff","#eaeaeaff","#f3f3f3ff","#fafafaff","#fefefeff","#ffffffff"
  ]},
  { id: 16, name: "Smooth Reverse Diagonal Inverse", layerType: BG_TYPES.S_Up, palette: ["#ffffff", "#000000"] },
  { id: 17, name: "Pixel Reverse Diagonal Inverse", layerType: BG_TYPES.P_Up, palette: [
    "#ffffffff","#fefefeff","#fafafaff","#f3f3f3ff","#eaeaeaff","#dfdfdfff","#d2d2d2ff","#c3c3c3ff",
    "#b3b3b3ff","#a2a2a2ff","#919191ff","#808080ff","#6e6e6eff","#5e5e5eff","#4e4e4eff","#404040ff",
    "#333333ff","#272727ff","#1e1e1eff","#161616ff","#0f0f0fff","#070707ff","#020202ff","#000000ff"
  ]},
  { id: 18, name: "Radial", layerType: BG_TYPES.Radial, palette: ["#ffffff", "#000000"] },
];

export function getBackgroundById(id: number): BackgroundOption {
  return BACKGROUND_OPTIONS[id] || BACKGROUND_OPTIONS[0];
}