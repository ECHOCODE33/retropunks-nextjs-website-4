# RetroPunks NFT Website

An NFT customization website for the RetroPunks collection. View and customize your on-chain punks with background cycling, downloads, and metadata editing.

## Directory Structure
```
.
├── README.md
├── eslint.config.mjs
├── extra
│   ├── Backgrounds.sol
│   ├── ERC721SeaDropPausableAndQueryable.sol
│   ├── IRetroPunks.sol
│   ├── RetroPunks.sol
│   ├── _BackgroundAssetUltimate.py
│   ├── dependencies.json
│   ├── full.json
│   └── iframe-srcdoc.html
├── next-env.d.ts
├── next.config.ts
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── postcss.config.mjs
├── prompts
│   ├── claude-og.md
│   ├── claude.md
│   ├── claude.xml
│   ├── grok-2.md
│   ├── grok-3.md
│   └── grok.md
├── public
│   ├── arrow-back-icon.svg
│   ├── arrow-forward-icon.svg
│   ├── arrow.svg
│   ├── discord.svg
│   ├── download-icon.svg
│   ├── etherscan.svg
│   ├── fullscreen-icon.svg
│   ├── image-icon.svg
│   ├── info-icon.svg
│   ├── open-in-browser-icon.svg
│   ├── opensea.svg
│   ├── punk.png
│   └── x.svg
├── src
│   ├── app
│   │   ├── ClientProviders.tsx
│   │   ├── api
│   │   │   └── read-contract
│   │   │       └── route.ts
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── license
│   │   │   └── page.tsx
│   │   ├── my-punks
│   │   │   └── page.tsx
│   │   ├── page.tsx
│   │   ├── providers.tsx
│   │   └── wagmi.ts
│   ├── components
│   │   ├── About.tsx
│   │   ├── Creator.tsx
│   │   ├── FAQ.tsx
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── Mobile-Navbar.tsx
│   │   ├── PunkCard.tsx
│   │   ├── Tooltip.tsx
│   │   └── icons
│   │       ├── IconArrowBack.tsx
│   │       ├── IconArrowForward.tsx
│   │       ├── IconDownload.tsx
│   │       ├── IconFullscreen.tsx
│   │       ├── IconInfo.tsx
│   │       ├── IconOpenInBrowser.tsx
│   │       ├── IconSetBackground.tsx
│   │       └── index.ts
│   └── lib
│       ├── backgrounds.ts
│       ├── contracts.tsx
│       ├── fonts.ts
│       ├── iframeGenerator.ts
│       ├── retropunksABI.json
│       └── utilities.ts
├── tailwind.config.ts
├── tsconfig.json
└── tsconfig.tsbuildinfo

13 directories, 70 files
```

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Environment variables

Create a `.env` file with:

```
NEXT_PUBLIC_CONTRACT_ADDRESS=<your-contract-address>
NEXT_PUBLIC_RPC_URL=<alchemy-or-infura-url>
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=<walletconnect-project-id>
```

### 3. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
