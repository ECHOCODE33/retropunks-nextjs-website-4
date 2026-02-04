# RetroPunks NFT Website

An NFT customization website for the RetroPunks collection. View and customize your on-chain punks with background cycling, downloads, and metadata editing.

## Tech Stack

- **Next.js 16** · **React 19** · **TypeScript**
- **Wagmi** · **Viem** · **RainbowKit**
- **Tailwind CSS 4** · **Sonner** (toasts)

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

### Toasts (Sonner)

The project uses [Sonner](https://sonner.emilkowal.ski/) for toast notifications. It's already wired in `src/app/providers.tsx`. Use it anywhere:

```tsx
import { toast } from "sonner";

toast.success("Background set on-chain");
toast.error("Download failed");
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
