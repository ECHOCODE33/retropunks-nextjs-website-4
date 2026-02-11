# RetroPunks NFT Website

An NFT customization website for the RetroPunks collection. View and customize your on-chain punks with background cycling, downloads, and metadata editing.

## Root Directory Structure
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

If you want to find the raw source code for any file in this directory, you can find it by using the following as a prefix: 

```https://raw.githubusercontent.com/ECHOCODE33/retropunks-nextjs-website-4/refs/heads/main/```

This is the root directory, just use this as a prefix link and at the end, enter the file path in root directory strcuture, for example:

- [https://raw.githubusercontent.com/ECHOCODE33/retropunks-nextjs-website-4/refs/heads/main/src/app/page.tsx](https://raw.githubusercontent.com/ECHOCODE33/retropunks-nextjs-website-4/refs/heads/main/src/app/page.tsx)
- [https://raw.githubusercontent.com/ECHOCODE33/retropunks-nextjs-website-4/refs/heads/main/src/lib/contracts.tsx](https://raw.githubusercontent.com/ECHOCODE33/retropunks-nextjs-website-4/refs/heads/main/src/lib/contracts.tsx)
- [https://raw.githubusercontent.com/ECHOCODE33/retropunks-nextjs-website-4/refs/heads/main/extra/RetroPunks.sol](https://raw.githubusercontent.com/ECHOCODE33/retropunks-nextjs-website-4/refs/heads/main/extra/Backgrounds.sol)