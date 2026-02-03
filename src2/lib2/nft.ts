export interface NFTAttribute {
  trait_type: string;
  value: string | number;
  display_type?: string;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: NFTAttribute[];
}

export interface TokenData {
  tokenId: bigint;
  metadata: NFTMetadata | null;
  tokenIdSeed?: number;
  backgroundIndex?: number;
  customName?: string;
  bio?: string;
}

export interface ContractMetadata {
  tokenIdSeed: number;
  backgroundIndex: number;
  name: string;
  bio: string;
}

export const BACKGROUND_NAMES = [
  'Rainbow',
  'Solid',
  'Smooth Vertical',
  'Pixelated Vertical',
  'Smooth Vertical Inverse',
  'Pixelated Vertical Inverse',
  'Smooth Horizontal',
  'Pixelated Horizontal',
  'Smooth Horizontal Inverse',
  'Pixelated Horizontal Inverse',
  'Smooth Diagonal',
  'Pixel Diagonal',
  'Smooth Diagonal Inverse',
  'Pixel Diagonal Inverse',
  'Smooth Reverse Diagonal',
  'Pixel Reverse Diagonal',
  'Smooth Reverse Diagonal Inverse',
  'Pixel Reverse Diagonal Inverse',
  'Radial'
];